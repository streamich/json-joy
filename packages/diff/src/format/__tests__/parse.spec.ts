import {detect, parse} from '../parse';
import type {HUNK_OP_TYPE} from '../types';

/** `op text` per line, which is what a hunk is once the numbers are checked separately. */
const body = (hunk: {lines: {op: HUNK_OP_TYPE; text: string; noEol: boolean}[]}): string[] =>
  hunk.lines.map((line) => '-0+'[line.op + 1] + line.text + (line.noEol ? ' [noeol]' : ''));

/** `old,count new,count` per hunk, the half a body cannot show. */
const ranges = (file: {hunks: {oldStart: number; oldCount: number; newStart: number; newCount: number}[]}): string[] =>
  file.hunks.map((h) => `${h.oldStart},${h.oldCount} ${h.newStart},${h.newCount}`);

const codes = (file: {errors: {code: string; line: number}[]}): string[] =>
  file.errors.map((e) => e.code + '@' + e.line);

describe('detect()', () => {
  test('names each style from its own markers', () => {
    expect(detect('--- a\n+++ b\n@@ -1 +1 @@\n-a\n+b\n')).toBe('unified');
    expect(detect('@@ -1 +1 @@\n-a\n+b\n')).toBe('unified');
    expect(detect('diff --git a/x b/x\nindex 1..2 100644\n')).toBe('unified');
    expect(detect('*** a\n--- b\n***************\n*** 1 ****\n! a\n--- 1 ----\n! b\n')).toBe('context');
    expect(detect('3a4\n> X\n')).toBe('normal');
    expect(detect('3a\nX\n.\n')).toBe('ed');
  });

  test('nothing that looks like a patch is not a patch', () => {
    expect(detect('')).toBeUndefined();
    expect(detect('hello\nworld\n')).toBeUndefined();
    expect(parse('hello\nworld\n')).toEqual([]);
  });

  test('a strong marker wins wherever it sits, so prose cannot hijack the style', () => {
    // `3a4` reads as a normal-format command and turns up in prose, tables of
    // contents and log lines; `@@` does not turn up by accident.
    expect(detect('see 3a4 below\n\n--- a\n+++ b\n@@ -1 +1 @@\n-a\n+b\n')).toBe('unified');
    expect(detect('12d\n\n*** a\n--- b\n***************\n*** 1 ****\n! a\n--- 1 ----\n! b\n')).toBe('context');
  });

  test('an explicit style overrides detection', () => {
    // The same five lines are an ed script that appends `x`, and a normal-format
    // patch that appends `y`, depending only on which reader reads them.
    const text = '1a\nx\n.\n1a2\n> y\n';
    expect(parse(text)[0].style).toBe('ed');
    expect(parse(text)[0].hunks[0].lines[0].text).toBe('x');
    const [file] = parse(text, {style: 'normal'});
    expect(file.style).toBe('normal');
    expect(file.hunks[0].lines[0].text).toBe('y');
  });
});

describe('unified', () => {
  test('an insertion, `diff -u`', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,6 +1,7 @@\n 1\n 2\n 3\n+X\n 4\n 5\n 6\n');
    expect(file.oldName).toBe('a');
    expect(file.newName).toBe('b');
    expect(file.style).toBe('unified');
    expect(ranges(file)).toEqual(['1,6 1,7']);
    expect(body(file.hunks[0])).toEqual(['01', '02', '03', '+X', '04', '05', '06']);
    expect(file.errors).toEqual([]);
  });

  test('the same insertion at -U0, where the count is omitted and the range is empty', () => {
    const [file] = parse('--- a\n+++ b\n@@ -3,0 +4 @@\n+X\n');
    expect(ranges(file)).toEqual(['3,0 4,1']);
    expect(file.errors).toEqual([]);
  });

  test('a file created from nothing', () => {
    const [file] = parse('--- a\n+++ b\n@@ -0,0 +1,3 @@\n+a\n+b\n+c\n');
    expect(ranges(file)).toEqual(['0,0 1,3']);
    expect(file.errors).toEqual([]);
  });

  test('the no-newline marker attaches to the line before it, on either side', () => {
    const [file] = parse(
      '--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n b\n-c\n\\ No newline at end of file\n+z\n\\ No newline at end of file\n',
    );
    expect(body(file.hunks[0])).toEqual(['0a', '0b', '-c [noeol]', '+z [noeol]']);
    expect(file.errors).toEqual([]);
  });

  test('timestamps are what follows the first tab, and a name may hold spaces', () => {
    const [file] = parse('--- my file\t2026-08-05 12:00:00 +0300\n+++ b\n@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('my file');
    expect(file.oldTime).toBe('2026-08-05 12:00:00 +0300');
    expect(file.newName).toBe('b');
    expect(file.newTime).toBeUndefined();
  });

  test('a section trailer comes back off the @@ line', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1 +1 @@ function f()\n-a\n+b\n');
    expect(file.hunks[0].section).toBe('function f()');
    expect(parse('--- a\n+++ b\n@@ -1 +1 @@\n-a\n+b\n')[0].hunks[0].section).toBeUndefined();
  });

  test('a headerless hunk is still a patch, of an unnamed file', () => {
    const [file] = parse('@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('');
    expect(ranges(file)).toEqual(['1,1 1,1']);
  });

  test('a body line may itself read like a header', () => {
    // A deletion of `--` and an insertion of `++ b`; prefix-stripping a unified
    // diff eats real content, and only the counts say where the body ends.
    const [file] = parse('--- a\n+++ b\n@@ -1 +1 @@\n---\n+++ b\n');
    expect(body(file.hunks[0])).toEqual(['---', '+++ b']);
    expect(file.errors).toEqual([]);
  });

  test('multiple files in one patch file', () => {
    const files = parse(
      '--- a/one\n+++ b/one\n@@ -1 +1 @@\n-a\n+b\n--- a/two\n+++ b/two\n@@ -1 +1 @@\n-c\n+d\n@@ -9 +9 @@\n-e\n+f\n',
    );
    expect(files.length).toBe(2);
    expect(files.map((f) => f.oldName)).toEqual(['a/one', 'a/two']);
    expect(files[1].hunks.length).toBe(2);
  });

  test('an empty line is an empty context line, its flag stripped in transit', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n\n-c\n+z\n');
    expect(body(file.hunks[0])).toEqual(['0a', '0', '-c', '+z']);
    expect(file.errors).toEqual([]);
  });
});

describe('context', () => {
  test('an insertion, `diff -c`, whose old side prints no body at all', () => {
    const [file] = parse(
      '*** a\n--- b\n***************\n*** 1,6 ****\n--- 1,7 ----\n  1\n  2\n  3\n+ X\n  4\n  5\n  6\n',
    );
    expect(file.style).toBe('context');
    expect(file.oldName).toBe('a');
    expect(ranges(file)).toEqual(['1,6 1,7']);
    expect(body(file.hunks[0])).toEqual(['01', '02', '03', '+X', '04', '05', '06']);
    expect(file.errors).toEqual([]);
  });

  test('the count comes from the body, since a single-number range says 1 and 0 alike', () => {
    // `diff -C0` of a one-line insertion. Reading `*** 2 ****` as one line copies
    // a source line the patch never mentioned.
    const [file] = parse('*** a\n--- b\n***************\n*** 2 ****\n--- 3 ----\n+ c\n');
    expect(ranges(file)).toEqual(['2,0 3,1']);
    expect(body(file.hunks[0])).toEqual(['+c']);
    expect(file.errors).toEqual([]);
  });

  test('a deletion, whose new side prints no body', () => {
    const [file] = parse('*** a\n--- b\n***************\n*** 2,4 ****\n  b\n- c\n  d\n--- 2,3 ----\n');
    expect(ranges(file)).toEqual(['2,3 2,2']);
    expect(body(file.hunks[0])).toEqual(['0b', '-c', '0d']);
    expect(file.errors).toEqual([]);
  });

  test('a change run is marked ! on both sides and comes back as delete-then-insert', () => {
    const [file] = parse(
      '*** a\n--- b\n***************\n*** 1,7 ****\n  a\n  b\n  c\n! d\n  e\n  f\n  g\n--- 1,7 ----\n  a\n  b\n  c\n! D\n  e\n  f\n  g\n',
    );
    expect(ranges(file)).toEqual(['1,7 1,7']);
    expect(body(file.hunks[0])).toEqual(['0a', '0b', '0c', '-d', '+D', '0e', '0f', '0g']);
    expect(file.errors).toEqual([]);
  });

  test('the no-newline marker, in both bodies', () => {
    const [file] = parse(
      '*** a\n--- b\n***************\n*** 1,3 ****\n  a\n  b\n! c\n\\ No newline at end of file\n--- 1,3 ----\n  a\n  b\n! z\n\\ No newline at end of file\n',
    );
    expect(body(file.hunks[0])).toEqual(['0a', '0b', '-c [noeol]', '+z [noeol]']);
  });

  test('a body line that reads like a range line', () => {
    // `<flag><space><text>` is the discriminator: the second character of a body
    // line is a space and of a range line is not.
    const [file] = parse('*** a\n--- b\n***************\n*** 1 ****\n- --- 1,3 ----\n--- 1 ----\n+ x\n');
    expect(body(file.hunks[0])).toEqual(['---- 1,3 ----', '+x']);
    expect(file.errors).toEqual([]);
  });

  test('a section trailer sits on the separator', () => {
    const [file] = parse('*** a\n--- b\n*************** function f()\n*** 1 ****\n! a\n--- 1 ----\n! b\n');
    expect(file.hunks[0].section).toBe('function f()');
  });
});

describe('normal', () => {
  test('an append', () => {
    const [file] = parse('3a4\n> X\n');
    expect(file.style).toBe('normal');
    expect(ranges(file)).toEqual(['3,0 4,1']);
    expect(body(file.hunks[0])).toEqual(['+X']);
    expect(file.errors).toEqual([]);
  });

  test('a change, with the --- separator and a no-newline marker on each side', () => {
    const [file] = parse('3c3\n< c\n\\ No newline at end of file\n---\n> z\n\\ No newline at end of file\n');
    expect(ranges(file)).toEqual(['3,1 3,1']);
    expect(body(file.hunks[0])).toEqual(['-c [noeol]', '+z [noeol]']);
    expect(file.errors).toEqual([]);
  });

  test('a multi-line delete and a multi-line change', () => {
    const [file] = parse('2,3d1\n< b\n< c\n5,6c4,6\n< e\n< f\n---\n> X\n> Y\n> Z\n');
    expect(ranges(file)).toEqual(['2,2 1,0', '5,2 4,3']);
    expect(body(file.hunks[1])).toEqual(['-e', '-f', '+X', '+Y', '+Z']);
    expect(file.errors).toEqual([]);
  });

  test('`diff -r`s echo line starts the next file', () => {
    const files = parse('diff -r one/x two/x\n1c1\n< a\n---\n> b\ndiff -r one/y two/y\n1d0\n< q\n');
    expect(files.map((f) => [f.oldName, f.newName])).toEqual([
      ['one/x', 'two/x'],
      ['one/y', 'two/y'],
    ]);
    expect(files[1].hunks.length).toBe(1);
  });
});

describe('ed', () => {
  test('an append, and the destination numbers derived from the running delta', () => {
    const [file] = parse('3a\nX\n.\n');
    expect(file.style).toBe('ed');
    expect(ranges(file)).toEqual(['3,0 4,1']);
    expect(body(file.hunks[0])).toEqual(['+X']);
  });

  test('a script is read bottom-up and comes back in file order', () => {
    const [file] = parse('8a\nQ\n.\n5,6d\n2c\nX\nY\n.\n');
    expect(ranges(file)).toEqual(['2,1 2,2', '5,2 5,0', '8,0 8,1']);
    expect(file.errors).toEqual([]);
  });

  test('a deletion carries no text, because the format does not record any', () => {
    const [file] = parse('5,6d\n');
    expect(file.hunks[0].oldCount).toBe(2);
    expect(file.hunks[0].lines).toEqual([]);
  });

  test('a line whose text is one dot, and one whose text is two', () => {
    const [file] = parse('1c\n..\n.\ns/.//\na\n..\n.\n');
    expect(body(file.hunks[0])).toEqual(['+.', '+..']);
    expect(ranges(file)).toEqual(['1,1 1,2']);
  });

  test('a dot line at the end of a block closes it without a further terminator', () => {
    const [file] = parse('1a\nx\n..\n.\ns/.//\n');
    expect(body(file.hunks[0])).toEqual(['+x', '+.']);
  });
});

describe('git-extended headers', () => {
  const patch =
    'diff --git a/fresh.txt b/fresh.txt\n' +
    'new file mode 100755\n' +
    'index 0000000..45b983b\n' +
    '--- /dev/null\n' +
    '+++ b/fresh.txt\n' +
    '@@ -0,0 +1 @@\n' +
    '+hi\n' +
    'diff --git a/gone.txt b/gone.txt\n' +
    'deleted file mode 100644\n' +
    'index 587be6b..0000000\n' +
    '--- a/gone.txt\n' +
    '+++ /dev/null\n' +
    '@@ -1 +0,0 @@\n' +
    '-x\n' +
    'diff --git a/old.txt b/new.txt\n' +
    'similarity index 73%\n' +
    'rename from old.txt\n' +
    'rename to new.txt\n' +
    'index 4cb29ea..f384549 100644\n' +
    '--- a/old.txt\n' +
    '+++ b/new.txt\n' +
    '@@ -1,3 +1,4 @@\n' +
    ' one\n' +
    ' two\n' +
    ' three\n' +
    '+four\n';

  test('one file per `diff --git`, in order', () => {
    const files = parse(patch);
    expect(files.length).toBe(3);
    expect(files.map((f) => f.newName)).toEqual(['b/fresh.txt', '/dev/null', 'b/new.txt']);
    expect(files.every((f) => !f.errors.length)).toBe(true);
  });

  test('names stay raw, so the command`s -p strip applies to what was written', () => {
    const files = parse(patch);
    expect(files[1].oldName).toBe('a/gone.txt');
    expect(files[0].oldName).toBe('/dev/null');
  });

  test('creation, deletion and mode', () => {
    const files = parse(patch);
    expect(files[0].meta).toEqual({newFileMode: '100755', oldHash: '0000000', newHash: '45b983b'});
    expect(files[1].meta!.deletedFileMode).toBe('100644');
  });

  test('rename with its similarity index', () => {
    const meta = parse(patch)[2].meta!;
    expect(meta.renameFrom).toBe('old.txt');
    expect(meta.renameTo).toBe('new.txt');
    expect(meta.similarity).toBe(73);
    expect(meta.indexMode).toBe('100644');
  });

  test('a mode change with no hunks is still a file', () => {
    const files = parse('diff --git a/x b/x\nold mode 100644\nnew mode 100755\n');
    expect(files.length).toBe(1);
    expect(files[0].meta).toEqual({oldMode: '100644', newMode: '100755'});
    expect(files[0].hunks).toEqual([]);
  });

  test('a copy', () => {
    const files = parse('diff --git a/x b/y\nsimilarity index 100%\ncopy from x\ncopy to y\n');
    expect(files[0].meta).toEqual({similarity: 100, copyFrom: 'x', copyTo: 'y'});
  });

  test('a path with a space, which git writes twice unless it renames', () => {
    const files = parse(
      'diff --git a/my file.txt b/my file.txt\n--- a/my file.txt\n+++ b/my file.txt\n@@ -1 +1 @@\n-a\n+b\n',
    );
    expect(files[0].oldName).toBe('a/my file.txt');
    expect(files[0].newName).toBe('b/my file.txt');
  });

  test('a C-quoted path', () => {
    const files = parse('diff --git "a/we\\tird" "b/we\\tird"\nold mode 100644\nnew mode 100755\n');
    expect(files[0].oldName).toBe('a/we\tird');
    expect(files[0].newName).toBe('b/we\tird');
  });

  test('`GIT binary patch` is recognized and rejected, never misparsed as text', () => {
    const files = parse(
      'diff --git a/x.png b/x.png\n' +
        'index 1..2 100644\n' +
        'GIT binary patch\n' +
        'literal 12\n' +
        'zcmZQzU|<4b0)+kzQ\n' +
        '\n' +
        'literal 0\n' +
        'HcmV?d00001\n' +
        'diff --git a/y b/y\n' +
        '--- a/y\n' +
        '+++ b/y\n' +
        '@@ -1 +1 @@\n' +
        '-a\n' +
        '+b\n',
    );
    expect(files.length).toBe(2);
    expect(files[0].meta!.binary).toBe(true);
    expect(files[0].hunks).toEqual([]);
    expect(codes(files[0])).toEqual(['binary@3']);
    // and the file after the payload is read normally
    expect(files[1].oldName).toBe('a/y');
    expect(files[1].hunks.length).toBe(1);
  });
});

describe('junk around the hunks', () => {
  const patch = '--- a\n+++ b\n@@ -1 +1 @@\n-a\n+b\n';

  test('leading prose and mail headers', () => {
    const text =
      'From: someone@example.com\nSubject: [PATCH] fix the thing\n\nHere is the patch, it fixes the thing:\n\n' + patch;
    const [file] = parse(text);
    expect(file.oldName).toBe('a');
    expect(ranges(file)).toEqual(['1,1 1,1']);
    expect(file.errors).toEqual([]);
  });

  test('a trailing signature', () => {
    const [file] = parse(patch + '-- \nSteve\n');
    expect(body(file.hunks[0])).toEqual(['-a', '+b']);
    expect(file.errors).toEqual([]);
  });

  test('a git log decoration around the diff', () => {
    const text =
      'commit 0123456789abcdef\nAuthor: A U Thor <a@example.com>\nDate:   Wed Aug 5 12:00:00 2026 +0300\n\n' +
      '    a message that mentions 3a4 and --- and +++\n\n' +
      patch;
    const files = parse(text);
    expect(files.length).toBe(1);
    expect(files[0].hunks.length).toBe(1);
  });

  test('a CRLF-terminated patch file parses, and the CR is content until asked', () => {
    const crlf = patch.split('\n').join('\r\n');
    const [file] = parse(crlf);
    expect(ranges(file)).toEqual(['1,1 1,1']);
    expect(body(file.hunks[0])).toEqual(['-a\r', '+b\r']);
    expect(body(parse(crlf, {stripTrailingCr: true})[0].hunks[0])).toEqual(['-a', '+b']);
  });

  test('an `Index:` line names a file that has no other name', () => {
    const [file] = parse(
      'Index: src/x.ts\n===================================================================\n@@ -1 +1 @@\n-a\n+b\n',
    );
    expect(file.oldName).toBe('src/x.ts');
    expect(file.newName).toBe('src/x.ts');
    expect(file.indexName).toBe('src/x.ts');
  });

  test('and it is kept beside the header pair rather than replaced by it', () => {
    // POSIX tries the `Index:` name AFTER both context names, so a reader that
    // let the pair overwrite it leaves step 3 with nothing to fall back to.
    const [file] = parse('Index: src/x.ts\n--- a/gone\n+++ b/gone\n@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('a/gone');
    expect(file.newName).toBe('b/gone');
    expect(file.indexName).toBe('src/x.ts');
  });

  test('and it announces the file that follows it and no other', () => {
    const files = parse('Index: one\n--- one\n+++ one\n@@ -1 +1 @@\n-a\n+b\n--- two\n+++ two\n@@ -1 +1 @@\n-c\n+d\n');
    expect(files.map((file) => file.indexName)).toEqual(['one', undefined]);
  });

  test('a `---`/`+++` pair with no hunks is not a file', () => {
    expect(parse('--- a\n+++ b\n', {style: 'unified'})).toEqual([]);
  });
});

describe('a C-quoted `---`/`+++` name', () => {
  // git quotes any path holding a space, a tab or a control character, on the
  // header pair exactly as on the `diff --git` line - and the pair is what a
  // reader keeps, so quotes left on it name no file at all.
  test('is unquoted, on both sides', () => {
    const [file] = parse('--- "a/fruit ba\\164"\n+++ "b/fruit ba\\164"\n@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('a/fruit bat');
    expect(file.newName).toBe('b/fruit bat');
  });

  test('does not lose its timestamp, which follows the closing quote', () => {
    const [file] = parse('--- "my file"\t2026-01-02 03:04:05\n+++ "my file"\n@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('my file');
    expect(file.oldTime).toBe('2026-01-02 03:04:05');
    expect(file.newTime).toBeUndefined();
  });

  test('survives the git header pair overwriting the `diff --git` names', () => {
    const [file] = parse(
      'diff --git "a/fruit ba\\164" "b/fruit ba\\164"\n' +
        'index 1..2 100644\n' +
        '--- "a/fruit ba\\164"\n+++ "b/fruit ba\\164"\n@@ -1 +1 @@\n-a\n+b\n',
    );
    expect(file.oldName).toBe('a/fruit bat');
    expect(file.newName).toBe('b/fruit bat');
  });

  test('unterminated, it is the rest of the line and nothing crashes', () => {
    const [file] = parse('--- "filename\n+++ "filename\n@@ -1 +1 @@\n-a\n+b\n');
    expect(file.oldName).toBe('filename');
    expect(file.hunks.length).toBe(1);
  });

  test('a copied-context header pair is unquoted the same way', () => {
    const [file] = parse('*** "old name"\n--- "new name"\n***************\n*** 1 ****\n! a\n--- 1 ----\n! b\n');
    expect(file.oldName).toBe('old name');
    expect(file.newName).toBe('new name');
  });
});

describe('a common leading blank prefix', () => {
  const patch = '--- a\n+++ b\n@@ -1,3 +1,3 @@\n one\n-two\n+TWO\n three\n';
  /** Every line indented, the shape a mail client, a wiki and a chat transcript produce. */
  const indent = (text: string, by: string): string =>
    text
      .split('\n')
      .map((line) => (line === '' ? line : by + line))
      .join('\n');

  test('is removed before anything else, so the patch is still a patch', () => {
    for (const by of ['  ', '\t', '    ', ' \t ']) {
      expect(detect(indent(patch, by))).toBe('unified');
      const [file] = parse(indent(patch, by));
      expect(file.newName).toBe('b');
      expect(ranges(file)).toEqual(['1,3 1,3']);
      expect(body(file.hunks[0])).toEqual(['0one', '-two', '+TWO', '0three']);
      expect(file.errors).toEqual([]);
    }
  });

  test('comes off an indented patch under prose that is not indented', () => {
    // The markdown case, and the reason the width is read off the header rather
    // than off every line: the sentence above the block carries no indent.
    const mail = 'Here is the patch:\n\n' + indent(patch, '    ') + '\nHope that helps.\n';
    const files = parse(mail);
    expect(files.length).toBe(1);
    expect(files[0].newName).toBe('b');
    expect(body(files[0].hunks[0])).toEqual(['0one', '-two', '+TWO', '0three']);
  });

  test('is not taken from a context line whose content begins `@@`', () => {
    // A patch OF a patch: the body carries an indented `@@`, and the real header
    // is above it at column 0 - which is why the first marker settles it.
    const nested = '--- doc.md\n+++ doc.md\n@@ -1,3 +1,3 @@\n @@ -1 +1 @@\n-two\n+TWO\n three\n';
    const [file] = parse(nested);
    expect(file.newName).toBe('doc.md');
    expect(body(file.hunks[0])).toEqual(['0@@ -1 +1 @@', '-two', '+TWO', '0three']);
    expect(file.errors).toEqual([]);
  });

  test('leaves an unindented patch exactly as it is', () => {
    const [file] = parse(patch);
    expect(body(file.hunks[0])).toEqual(['0one', '-two', '+TWO', '0three']);
  });

  test('tolerates the empty lines a mail body carries, in LF and in CRLF', () => {
    const mail = indent('Here is the patch:\n\n' + patch, '  ');
    expect(parse(mail).length).toBe(1);
    expect(body(parse(mail)[0].hunks[0])).toEqual(['0one', '-two', '+TWO', '0three']);
    const crlf = mail.split('\n').join('\r\n');
    expect(body(parse(crlf, {stripTrailingCr: true})[0].hunks[0])).toEqual(['0one', '-two', '+TWO', '0three']);
  });

  test('an ed script survives it, insert block and all', () => {
    const [file] = parse('  3c\n  LINE 3\n  .\n');
    expect(file.style).toBe('ed');
    expect(body(file.hunks[0])).toEqual(['+LINE 3']);
  });
});

describe('malformed input is reported, not thrown', () => {
  test('a truncated hunk', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n-b\n');
    expect(codes(file)).toEqual(['truncated@3', 'count@3']);
    // what was there is still usable
    expect(body(file.hunks[0])).toEqual(['0a', '-b']);
    expect(ranges(file)).toEqual(['1,2 1,1']);
  });

  test('a header count that disagrees with the body, the short way', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,5 +1,5 @@\n a\n-b\n+c\n d\n@@ -9 +9 @@\n-x\n+y\n');
    expect(codes(file)).toEqual(['count@3']);
    expect(ranges(file)).toEqual(['1,3 1,3', '9,1 9,1']);
  });

  test('a header count that disagrees with the body, the long way', () => {
    // Consumption stops when the counts are satisfied, so an extra body line is
    // reported where it is rather than swallowed - trailing junk looks the same.
    const [file] = parse('--- a\n+++ b\n@@ -1 +1 @@\n-a\n+b\n+extra\n');
    expect(codes(file)).toEqual(['count@6']);
    expect(body(file.hunks[0])).toEqual(['-a', '+b']);
  });

  test('an unexpected op character in a body', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n?b\n c\n');
    expect(codes(file)).toEqual(['body@5', 'count@3']);
    expect(body(file.hunks[0])).toEqual(['0a']);
  });

  test('overlapping hunks', () => {
    const [file] = parse('--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n-b\n+B\n c\n@@ -2,2 +2,2 @@\n-x\n+y\n z\n');
    expect(codes(file)).toEqual(['overlap@8']);
    expect(file.hunks.length).toBe(2);
  });

  test('a zero line number on a non-empty range', () => {
    const [file] = parse('--- a\n+++ b\n@@ -0,1 +1 @@\n-a\n+b\n');
    expect(codes(file)).toEqual(['range@3']);
  });

  test('a negative line number is not a hunk header at all, and says so', () => {
    const [file] = parse('--- a\n+++ b\n@@ --1,2 +1 @@\n-a\n+b\n');
    expect(file.hunks).toEqual([]);
    expect(codes(file)).toEqual(['header@3']);
  });

  test('a normal-format range that ends before it begins', () => {
    const [file] = parse('5,3c1\n< a\n---\n> b\n');
    expect(codes(file)).toEqual(['range@1']);
    expect(file.hunks).toEqual([]);
  });

  test('a normal-format change with no --- separator', () => {
    const [file] = parse('1c1\n< a\n> b\n');
    expect(codes(file)).toEqual(['header@3']);
    expect(body(file.hunks[0])).toEqual(['-a']);
  });

  test('an ed insert block that never ends', () => {
    const [file] = parse('1a\nx\ny\n');
    expect(codes(file)).toEqual(['truncated@1']);
    expect(body(file.hunks[0])).toEqual(['+x', '+y']);
  });

  test('a context hunk with no --- range line', () => {
    const [file] = parse('*** a\n--- b\n***************\n*** 1,3 ****\n  a\n- b\n  c\n');
    expect(codes(file)).toEqual(['truncated@7']);
    expect(file.hunks).toEqual([]);
  });

  test('context bodies whose unchanged lines do not line up', () => {
    const [file] = parse('*** a\n--- b\n***************\n*** 1,3 ****\n  a\n! b\n  c\n--- 1,2 ----\n! B\n  c\n');
    expect(codes(file)).toEqual(['count@3', 'count@3']);
    expect(file.hunks.length).toBe(1);
  });

  test('a hunk before any header carries the errors of a file with no name', () => {
    const [file] = parse('@@ -1,9 +1,9 @@\n-a\n');
    expect(file.oldName).toBe('');
    expect(codes(file)).toEqual(['truncated@1', 'count@1']);
  });
});
