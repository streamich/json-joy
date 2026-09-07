/**
 * The wire model. A `LinePatch` is index-based, so it only means anything next
 * to the `src`/`dst` arrays it was computed from: enough to *write* a diff,
 * useless to *read* one, where the hunks are all there is. These types are what
 * crosses the wire, and what the parsers produce.
 */

/** Operation of a {@link HunkLine}. Values match `LINE_PATCH_OP_TYPE`. */
export const enum HUNK_OP_TYPE {
  /** Present in the source file only. Rendered `-` (unified) or `<` (normal). */
  DEL = -1,
  /** Context: present in both files, unchanged. Rendered `' '`. */
  EQL = 0,
  /** Present in the destination file only. Rendered `+` or `>`. */
  INS = 1,
}

/** The marker every text style spells the missing final newline with. */
export const NO_NEWLINE = '\\ No newline at end of file';

/** One line of a {@link Hunk}. */
export class HunkLine {
  constructor(
    public op: HUNK_OP_TYPE,
    /** Line content, without its terminator. */
    public text: string,
    /**
     * Whether the file this line came from ends here, without a newline. A
     * flag rather than a property of the text: a file that does not end in a
     * newline is common in generated output, and it has to survive a
     * serialize/parse round-trip.
     */
    public noEol: boolean = false,
  ) {}
}

/** A run of changes with its surrounding context, as one unit of a diff. */
export class Hunk {
  constructor(
    /**
     * 1-based number of the first source line of the hunk. When `oldCount` is
     * `0` this is instead the number of the line *before* the empty range -
     * `0` at the start of the file - which is what `patch` reads and what
     * `-N,0` means.
     */
    public oldStart: number,
    /** Source lines covered, deletions plus context. */
    public oldCount: number,
    /** As {@link oldStart}, for the destination file. */
    public newStart: number,
    /** Destination lines covered, insertions plus context. */
    public newCount: number,
    public lines: HunkLine[],
    /** The `@@ ... @@` trailer: enclosing function name, from `diff -p`/`-F`. */
    public section?: string,
  ) {}
}

export const enum GROUP_TYPE {
  UNCHANGED = 0,
  OLD = 1,
  NEW = 2,
  CHANGED = 3,
}

export class Group {
  constructor(
    public type: GROUP_TYPE,
    /** First `src` line. */
    public srcFrom: number,
    /** One past its last source line, equal to {@link srcFrom} for a pure insert. */
    public srcUpto: number,
    public dstFrom: number,
    public dstUpto: number,
  ) {}
}

/** Git-extended header fields, as written by `git diff`. Parsed by `format.parse`. */
export interface GitMeta {
  /** `old mode 100644`. */
  oldMode?: string;
  /** `new mode 100755`. */
  newMode?: string;
  /** `new file mode 100644` - the file is created by this patch. */
  newFileMode?: string;
  /** `deleted file mode 100644` - the file is removed by this patch. */
  deletedFileMode?: string;
  /** `rename from` / `rename to`. */
  renameFrom?: string;
  renameTo?: string;
  /** `copy from` / `copy to`. */
  copyFrom?: string;
  copyTo?: string;
  /** `similarity index 95%` / `dissimilarity index 5%`, as a percentage. */
  similarity?: number;
  dissimilarity?: number;
  /** `index abc1234..def5678 100644`. */
  oldHash?: string;
  newHash?: string;
  indexMode?: string;
  /** `GIT binary patch` - recognized so it can be rejected, never misparsed as text. */
  binary?: boolean;
}

/** Wire style of a patch: what `format.parse` detected, or what it was told. */
export type PatchStyle = 'unified' | 'context' | 'normal' | 'ed';

/**
 * What went wrong in a patch, coarse enough for a command to route on.
 *
 * - `header` - a header or command line that does not parse.
 * - `range` - line numbers that cannot be right: `0` on a non-empty range, a
 *   descending one, a second address where the format allows none.
 * - `body` - an unexpected character where a hunk body line was due.
 * - `truncated` - the input ended inside a hunk.
 * - `count` - the header's counts disagree with the body it carries.
 * - `overlap` - a hunk starts at or before the end of the one before it.
 * - `binary` - `GIT binary patch`, which this package does not decode.
 */
export type ParseErrorCode = 'header' | 'range' | 'body' | 'truncated' | 'count' | 'overlap' | 'binary';

/**
 * A malformed piece of a patch. Reported on the {@link FilePatch} it was found
 * in rather than thrown: POSIX `patch` rejects the hunks it cannot use and
 * applies the rest, and a parser that throws on the first bad hunk cannot write
 * a `.rej` file at all.
 */
export class ParseError {
  constructor(
    public code: ParseErrorCode,
    /** Human-readable, in the package's voice; a command may print it or not. */
    public message: string,
    /** 1-based line number in the parsed text. */
    public line: number,
    /** The offending line, as read, for a diagnostic that can quote it. */
    public text?: string,
  ) {}
}

/** Options of `format.parse`. */
export interface ParseOptions {
  /**
   * Parse as this style instead of auto-detecting. Detection is what real
   * `patch` does - a patch file declares nothing about what it is - but it can
   * be wrong on input that quotes one style inside another, so it is overridable.
   */
  style?: PatchStyle;
  /**
   * Drop a trailing CR from hunk *content*, as `patch --strip-trailing-cr` does.
   * Off by default: a CRLF-terminated patch of a CRLF file carries the CR as
   * data, and only the caller knows which of the two it has. Structural lines -
   * headers, ranges, the `.` closing an ed block - are read CR-insensitively
   * either way, so a CRLF patch file always parses.
   */
  stripTrailingCr?: boolean;
}

/** One file's worth of changes, as exchanged on the wire. */
export class FilePatch {
  constructor(
    public oldName: string,
    public newName: string,
    public hunks: Hunk[] = [],
    public oldTime?: string,
    public newTime?: string,
    public meta?: GitMeta,
    /** Style this file was read from; unset on a patch that was written, not parsed. */
    public style?: PatchStyle,
    /** Everything `format.parse` could not make sense of, in the order it was found. */
    public errors: ParseError[] = [],
    /**
     * The `Index:` header this file was announced by, when it carried one. Kept
     * beside the two names rather than replacing them: POSIX's filename
     * determination tries it **after** both context names, so a reader that
     * overwrote it with the `---`/`+++` pair leaves step 3 with nothing to fall
     * back to.
     */
    public indexName?: string,
  ) {}
}

/**
 * Where the two files end without a newline.
 *
 * These flags only place the `\ No newline at end of file` markers; they do not
 * make the diff itself see `"a"` and `"a\n"` as different lines, which is a
 * property of the arrays handed to `lines.diff`. GNU treats them as different
 * lines, so a caller that wants GNU's output must encode the distinction in the
 * line data - keep the terminator on each line, or mark the unterminated one -
 * and pass arrays without it here, since the text of a line is emitted verbatim.
 */
export interface EolOptions {
  /** The last element of `src` is not newline-terminated in the source file. */
  srcNoEol?: boolean;
  /** The last element of `dst` is not newline-terminated in the destination file. */
  dstNoEol?: boolean;
}

/**
 * Options every style takes: where the files end, and which changed lines do
 * not count as a difference.
 */
export interface ScriptOptions extends EolOptions {
  /**
   * Whether a changed line is *ignorable* - `diff -B`'s blank lines and
   * `diff -I`'s matching ones. Given per line, applied per change run: a run
   * counts as a difference unless **every** line it deletes and inserts is
   * ignorable, and a hunk is emitted only when at least one of its runs counts.
   *
   * This is a filter over the script, not over the input, which is the whole
   * point: an ignorable line still occupies its line numbers, still prints as a
   * `-`/`+` line inside a hunk that some other run kept, and still separates two
   * change runs. Dropping such lines from the arrays instead moves every line
   * number after them.
   *
   * It also moves the merge threshold, as GNU's `find_hunk` does: a following
   * run that does not count is merged into the current hunk only when it is
   * within `context` lines, where one that counts is merged within
   * `2 * context + 1`. Without that, an ignorable run just outside the merge
   * distance would form a hunk of its own, be dropped, and take its context
   * lines with it.
   *
   * @param op {@link HUNK_OP_TYPE.DEL} for a source line, {@link HUNK_OP_TYPE.INS}
   *     for a destination one. Never {@link HUNK_OP_TYPE.EQL}.
   * @param index 0-based index into `src` for a `DEL`, into `dst` for an `INS`.
   */
  ignorable?: (op: HUNK_OP_TYPE, index: number) => boolean;
}

/** Options of {@link hunks}, shared by every context-bearing style. */
export interface HunkOptions extends ScriptOptions {
  /**
   * Lines of context around each change; a non-negative integer, `3` by
   * default, and `0` is meaningful - `diff -U0` is a real thing.
   *
   * Anything else is clamped rather than rejected: a negative or `NaN` width
   * becomes `0` and a fractional one is floored. That is not politeness, it is
   * what keeps the grouping loop structurally unable to stall - a negative
   * width used to make a hunk end before it began and spin forever. A caller
   * that must *reject* a bad width, as `diff(1)` does with "invalid context
   * length", has to do it at its own argv boundary; this is a library and it
   * always terminates.
   */
  context?: number;
  /**
   * Supplies the `@@ ... @@` trailer for a hunk, given the 0-based source index
   * of its first line. For `diff -p`/`-F`; no trailer without it.
   *
   * `undefined` means no trailer at all; `''` means a trailer that is empty,
   * which still prints its separating space - GNU emits `@@ -6,3 +6,3 @@ ` when
   * `-F` matched a line that is nothing but white space.
   */
  section?: (srcIndex: number) => string | undefined;
}

/** File names and timestamps for the styles that carry a header. */
export interface LabelOptions {
  /** Header name for the source file. Without it (and `newName`) no header is emitted. */
  oldName?: string;
  /** Header name for the destination file. */
  newName?: string;
  /** Header timestamp for the source file, tab-separated from the name. Never read from a clock here. */
  oldTime?: string;
  /** Header timestamp for the destination file. */
  newTime?: string;
}

/**
 * Escape sequences a writer wraps each kind of line in, for `diff --color`.
 * Modelled on GNU's own palette - its five capabilities are `hd`, `ln`, `ad`,
 * `de` and `rs`, and its default is `hd=1:ln=36:ad=32:de=31:rs=0` - so the
 * strings are opaque here and a caller that wants terminfo, HTML or nothing at
 * all supplies its own.
 *
 * An absent field leaves its lines plain, and lines no field names - the
 * `---` separator of normal format, a unified context line, the
 * `\ No newline at end of file` marker, the `***************` separator and its
 * `-p` trailer - are never painted, which is GNU's split and not an obvious one.
 */
export interface DiffColors {
  /** The `---`/`+++`/`***` file header lines, whole, timestamp included. */
  header?: string;
  /** The line-number lines: `@@ ... @@` (trailer excluded), `NcM`, `*** N ****`. */
  line?: string;
  /** An inserted line, prefix included. In context format, the whole second block. */
  add?: string;
  /** A deleted line, prefix included. In context format, the whole first block. */
  del?: string;
  /** Written after every painted piece; GNU's is `ESC[0m`. */
  reset?: string;
}

/** Shared by the three styles that can be colored; `ed` and RCS never are. */
export interface ColorOptions {
  /** Without it, and without a `reset`, every writer emits plain text. */
  colors?: DiffColors;
}

/** Shared by every style: they all write line content, and `diff -t` expands all of it. */
export interface TabOptions {
  /**
   * `diff -t`: expand tabs in line *content* to this stop, `8` in GNU. Absent
   * or `0` writes every line exactly as it was given, which is the default.
   * Headers, `@@` lines, `-p` trailers and the no-newline marker are never
   * expanded. See `expandLine`, which also documents the width model.
   */
  tabs?: number;
}

export interface FlagOptions {
  /** `diff -T`: a tab where a space would go. */
  initialTab?: boolean;
  /**
   * `diff --suppress-blank-empty`: write no separator at all before an **empty**
   * line, so a blank context line is a blank output line rather than one
   * holding a lone space.
   */
  suppressBlankEmpty?: boolean;
}

/** Options of {@link unified}. */
export interface UnifiedOptions extends HunkOptions, LabelOptions, ColorOptions, TabOptions, FlagOptions {}

/** Options of {@link context}. */
export interface ContextOptions extends HunkOptions, LabelOptions, ColorOptions, TabOptions, FlagOptions {}

/** Options of {@link normal}. Normal format carries no context and no labels. */
export interface NormalOptions extends ScriptOptions, ColorOptions, TabOptions, FlagOptions {}

/** Options of {@link ed}. An ed script carries no context, no labels and no color. */
export interface EdOptions extends ScriptOptions, TabOptions {}

/** Options of {@link rcs}. An RCS delta carries no context, no labels and no color. */
export interface RcsOptions extends ScriptOptions, TabOptions {}

export interface WidthOptions {
  /** `diff -W`: the whole line, both columns and the gutter. GNU's default 130. */
  width?: number;
  /** `diff --tabsize`: print columns per tab stop. GNU's default 8. */
  tabSize?: number;
}

/** Options of {@link sideBySide}, `diff -y`. */
export interface SideOptions extends EolOptions, ColorOptions, WidthOptions {
  /**
   * `diff -t`: write spaces where the layout would write tabs, and expand tabs
   * in line content.
   */
  expandTabs?: boolean;
  /** `diff --left-column`: print a common line in the left column only, marked `(`. */
  leftColumn?: boolean;
  /** `diff --suppress-common-lines`: write only the lines that differ. */
  suppressCommonLines?: boolean;
  /**
   * `diff --sdiff-merge-assist`: prefix each run with the `i<n>,<m>` /
   * `c<n>,<m>` counts `sdiff -o` reads.
   */
  mergeAssist?: boolean;
}

/**
 * Options of {@link ifdef}, `diff -D` and the `--*-format` family.
 */
export interface IfdefOptions extends EolOptions, TabOptions {
  groupFormat: [unchanged: string, old: string, new: string, changed: string];
  lineFormat: [unchanged: string, old: string, new: string];
}
