# Introducing fast RGA implementation that will power JSON CRDTs

First, a little note on JSON CRDT. JSON CRDT will be a specification and a JavaScript
implementation of JSON data type as a CRDT (Conflict-free Replicated Data Type). The
aim for JSON CRDT is to create a sound state-of-the-art CRDT specification which will
support all JSON values, including lists, for which this RGA algorithm is needed.

Now back to the RGA algorithm, what is that? RGA stands for [*Replicated Growable Array*][rga],
also known as CT ([*Causal Tree*][causal-tree]), sometimes you might find it abbreviated as CT/RGA. The
CT/RGA algorithm, or RGA for short, allows to implement conflict free list data
structures, such as strings, binary blobs, or arrays (think JSON arrays).

What is conflict-free, or CRDTs? Those are data types, which can be forked; then
two or more peers can edit their copies independently and at any point in time all the
forks can be merged back without conflicts. Also, forks can be merged in any order,
which does not change the contents of the final document.


## `json-joy` RGA implementation

Now `json-joy` implements and advanced version of the RGA algorithm (we will take a look
at it later what is advanced about it, but for now, just think about it as being very efficient
and fast). Great news is that it is ready, and you can use it, lets see how it can be done.

First, you will need to install the `json-joy` NPM package.

```
yarn add json-joy
```

`json-joy` implements an abstract version of the RGA algorithm in `AbstractRga` class, where
elements can be of any type. But below we will take a look at application of it to a string
data type, which is implemented in the `StringRga` class.

In general, RGAs support two operations: (1) insert; and (2) delete. Lets see how to use those
for string editing.

Import the `StringRga` class. Also, import the `ts` helper, which will allow us to create
"timestamps" (aka *operation IDs*). All elements in RGA (and usually in all CRDTs, for that
matter) have a unique ID. We will need the `ts` helper to generate those IDs.

```ts
import {StringRga} from 'json-joy/es2020/json-crdt/types/rga-string/StringRga';
import {ts} from 'json-joy/es2020/json-crdt-patch/clock';
```

Don't worry `StringRga` will not actually store an ID for every character, but more on that
later. IDs are 2-tuples of *Site ID* (aka *Process ID* or *Session ID*) and an ever
increasing sequence counter, i.e. "time"; essentially, and ID is a *Logical Timestamp*,
where each user will have their own *Logical Clock*, and the collection nof all Logical Clocks
of all users will for a *Vector Clock*.

Now create the text CRDT data type, you will need to give it a unique ID:

```ts
const sid = 123; // Site ID
let time = 0;  // "time"

const id = ts(sid, time++);
const str = new StringRga(id);
```

We can see what is storied in our string using the `.view()` method, lets verify that
it is empty:

```ts
console.log(str.view());
// ""
```

We can also print the internal state like so:

```ts
console.log(str + '');
// StringRga 123.0 { "" }
// └─ ∅
```

It shows that the string has ID `123.0` and empty contents.

Now lets insert somethign in to the string. A local insert can be performed using the
`.insAt()` method.

```ts
let content = 'Hell world!';
str.insAt(0, ts(sid, time), content);
time += content.length;
console.log(str + '');
// StringRga 123.0 { "Hell world!" }
// └─ StringChunk 123.1!11 len:11 { "Hell world!" }
```

You can see that a `StringChunk` was inserted, where `123.1!11` specifies the ID of
the first character of the chunk `123.1` and `!11` denotes the length of the chunk.

Lets perform another insert, to fix our text:

```ts
content = 'o,';
str.insAt(4, ts(sid, time), content);
time += content.length;

console.log(str + '');
// StringRga 123.0 { "Hello, world!" }
// └─ StringChunk 123.12!2 len:13 { "o," }
//    ← StringChunk 123.1!4 len:4 { "Hell" }
//    → StringChunk 123.5!7 len:7 { " world!" }

console.log(str.view());
// Hello, world!
```

You can see we fixed the text to be `Hello, world!`, now you might also notice that
the string now has three `StringChunk` nodes arranged in a binary tree, where `←`
and `→` represent the left and right children. More on that later, but that is the
secret source which makes the `json-joy` RGA implementation really fast: the text
chunks follow what is known in academia *block-wise* storage, where chunks of text
are stored in blocks with a small metadata piece allocated for each block, instead of
storing each character separately, with metadata allocated for each character. And
binary tree represents a custom [rope-like][rope] data structure, specifically
designed for the RGA algorithm.

[rope]: https://en.wikipedia.org/wiki/Rope_(data_structure)

All of this might sound overwhelming, but that is expected, you will not need to
know or use any of this; this is the lower-level (under-the-hood-workings) that will
power the JSON CRDT implementation, for you&mdash;as a developer&mdash;it will be exposed
in a nicely packaged API where you don't need to know anything about the inner workings
of the CRDT algorithms.

For the sake of completeness, lets briefly take a look at other public methods that
the `StringRga` class exposes. Above I mentioned that RGA usually supports two operations;
insert and delete. That is true, but actually, in CRDTs, those are usually sub-divided
into *remote* and *local* operations. So, essentially `StringRga` supports four
main operations: (1) remote insert; (2) remote delete; (3) local insert; and (4) local
delete.

What are those local vs remote operations? Local operations are the ones that user
performs on their machine, where operations contain the offset position in the text,
for example:

- `insertAt(position, text)`
- `deleteAt(position, length)`

Remote operations are the ones received from other peers, and those don't reference the
position in text, instead they reference one or more IDs of the CRDT after which to
perform the operation, for example:

- `insert(afterId, text)`
- `delete(...ids)`

We have already seen the local insert operation of the `StringRga`, it was `.insAt()`.
Now lets take a look at the remote insert operation `.ins()`. It works similar to
`.insAt()`, but instead of the insertion position, we will need to specify the ID of
the character after which we want to apply our insert.

Consider we have three users: User 1 will create a new string `"js"`, then they will
fork it and send the that string to two other users: (1) User 2 will insert `"on"` at
the end of it; (2) User 3 will concurrently (at the same time) insert `" joy"` at the
same position. Regardless in which order we apply the two remote operations of
User 2 and User 3, we will receive the same final result.

Lets create a new string `str1` with contents `"js"`, we will use the local `.insAt()`
method to do that:

```ts
const user1 = 123;
const user2 = 345;
const user3 = 789;

// User 1 creates a new string
const str1 = new StringRga(ts(user1, 0));
str1.insAt(0, ts(user1, 1), 'js');
```

Nothing new here, just one thing to note that the IDs of characters `j` and `s` will
be `123.1` and `123.2`, respectively. (And ID of the string is `123.0`.)

Now imagine that this string was sent to two other users, who concurrently appended
`" joy"` and `"on"` to it. Then those users would send their operations back to
user 1, which will use the remote `.ins()` method to apply those operations, lets
do that:

```ts
// User 2 and 3 insert their changes at the same time "ts(user1, 2)"
str1.ins(ts(user1, 2), ts(user2, 3), ' joy');
str1.ins(ts(user1, 2), ts(user3, 3), 'on');

console.log(str1 + '');
// StringRga 123.0 { "json joy" }
// └─ StringChunk 789.3!2 len:8 { "on" }
//    ← StringChunk 123.1!2 len:2 { "js" }
//    → StringChunk 345.3!4 len:4 { " joy" }
```

The final string is `"json joy"`. You can see that `.ins()` first inserted `" joy"`
and then `"on"`, lets try to reverse the order and see if we still get the same
result:

```ts
// User 1 creates a new string "js"
const str2 = new StringRga(ts(user1, 0));
str2.insAt(0, ts(user1, 1), 'js');

// User 2 and 3 insert their changes at the same time "ts(user1, 2)"
str2.ins(ts(user1, 2), ts(user3, 3), 'on');
str2.ins(ts(user1, 2), ts(user2, 3), ' joy');

console.log(str2 + '');
// StringRga 123.0 { "json joy" }
// └─ StringChunk 345.3!4 len:8 { " joy" }
//    ← StringChunk 789.3!2 len:4 { "on" }
//      ← StringChunk 123.1!2 len:2 { "js" }
```

Again, we get the `"json joy"` final result. The reason that results are the same
in both cases is because we use the unique character IDs to order the inserts.
User 3 has site ID `789`, but user User 2 has `345`, hence for conflict
concurrent inserts User 3's inserts will appear to the left of User 2's inserts.
No magic here, that is just how CT/RGA algorithm is specified.


## The Block-wise CT/RGA-Split Splay Rope with Identifier Table

The `json-joy` RGA implementation is very fast, we will see that in the next section.
But in this section we will take a look at the data structure that powers the
`StringRga` class. The `StringRga` class is fast because it uses a custom
state-of-the-art data structure that is specifically designed for the
RGA algorithm. It implements what can be describe as
*Block-wise CT/RGA-Split Rope with Identifier Table* algorithm. It is
a mouthful, but the purpose of this section is to decipher it for the reader.

- **Block-wise** means that the text is stored in blocks (`StringChunk` in `json-joy`),
  where each block contains a small metadata piece, instead of storing each character
  separately, with metadata allocated for each character. This is a well known technique
  in academia, however, it is not commonly used in practice, because it is
  difficult to implement. The canonical RGA algorithm is just a linked list of
  single characters, which is very easy to implement, but it is not efficient.
  Block-wise representation is more efficient, but it is more difficult to implement,
  as implicitly each character still has a unique ID and can be referenced by that ID.
  So, the blocks can be split and merged, which requires a lot of bookkeeping.
- **CT/RGA** simply means that the base algorithm is *Causal Trees/Replicated Growable Array*.
  This is currently the best known algorithm for list (strings, arrays) CRDTs, it
  has formal proofs of correctness, it is efficient, and is probably most cited
  list CRDT algorithm in academic papers.
- **Split** refers to the optimization described in the
  [*"High Responsiveness for Group Editing CRDTs"* (Briot et al., 2006) paper][high-responsiveness-crdts],
  a "split link" is stored to the the other part of the block that was split. This allows
  to perform search and delete operations on blocks more efficiently, when the block was
  split.
- **Splay Rope** means that the RGA blocks are stored in a rope-like binary splay tree.
  Unlike the canonical RGA algorithm, where the blocks are stored in a linked list.
  This allows for faster than `O(log n)` lookups of text by position.
- **Identifier Table** is another splay tree, which stores the mapping of character IDs
  to the blocks. This allows to perform lookups of characters by ID in less than
  `O(log n)` time.

A novelty of the `json-joy` implementation is that it uses Splay trees for both
the Chunk Rope and the Identifier Table. In practice this results into a very fast
tree traversals, because the trees are splayed on every insert, which results into
*likely* faster than `O(log n)` access time, for all operations, as users usually:
(1) type multiple characters at the same position (for the Text Rope); and
(2) reference the most recent IDs (for the Identifier Table). When the trees are
un-serialized from storage, they can be balanced, which results into *exactly*
`O(log n)` complexity, for all operations for freshly hydrated trees (say, when
opening the document from a file).

There are many more minor optimizations that make `json-joy` fast, but another one
worth mentioning is the insert in the middle of the block situation described in
[(Briot et al., 2006)][high-responsiveness-crdts], which results
into two block splits. The insert is performed such that the new block is rotated
to the top, while the other two blocks are rotated to the bottom.

![insert-into-middle-of-block](https://streamich.github.io/json-joy/blog/images/blockwise-middle-split.png)

Lets look at an example of how this all works together.


### Block-wise CT/RGA-Split Rope with Identifier Table Example

This will be a simple example, which showcases a single insert. We will start with
a string `"GG WP"` and insert `"OOD "` in the middle of it. The final string will
be `"GOOD G WP"`.

Strings are represented by the RGA algorithm, so the simplest way of thinking about
it is to imagine the starting string as a linked list of characters, where each
character has a unique ID.

![RGA string](https://streamich.github.io/json-joy/blog/images/blogpost-001/rga-string.png)

A collaborative editing expert will notice that:

- At least two users `a` and `c` have edited the string.
  - User `a` inserted `"GGWP"`.
  - User `c` inserted the space `" "`.
- Also, the `a.3` and `c.3` edits were made concurrently, which means that user `a`
  inserted `"WP"` and user `c` inserted `" "` at the same time.

Those are not important trivia, now lets look at the same string, but represented
as a Block-wise RGA. In Block-wise RGA we don't waste memory on storing each
character separately, instead we store the characters in blocks. Each block has
a unique ID, which is the ID of the first character in the block. The blocks are
linked together in a linked list.

![Single character vs block-wise representation](https://streamich.github.io/json-joy/blog/images/blogpost-001/single-char-vs-blockwise.png)

Each character still has a unique ID, it is just the memory is not used to store
metadata about characters `a.2` and `a.4`.

We will insert another block in the middle of an existing block, which will result
into a block split. The `"OOD "` block with ID `d.5` will be inserted in between the two
`"G"` characters. (Note that `d` means that it is yet another user, and each character in
the `d.5` block still implicitly has an ID, which are `d.5`, `d.6`, `d.7`, `d.8`.)

![Block insert](https://streamich.github.io/json-joy/blog/images/blogpost-001/block-insert.png)

Block-wise representation is our first optimization, lets look at the second one.
The second important optimization is that we don't store the blocks in a linked
list, instead we store them in a binary tree, or more specifically in a [Rope][rope].
So, a little more precisely, the situation could look like this:

![Text Rope tree](https://streamich.github.io/json-joy/blog/images/blogpost-001/text-rope-tree.png)

Note, in the tree we see that there are two tombstones `b.1` and `b.2`, which means
it used to be text which was inserted concurrently with `a.1`, but was deleted. Also, there
is a *split link" between the `b.1` and `b.2` blocks, which means that the `a.1` block was
inserted in the middle of the `b.1` block, before `b.1` and `b.2` were deleted. The fact
that `b` nodes are deleted now is not important, but it is important to note that we keep
track of split links, which allow for faster traversal of the tree.

Now that we know the general setup, lets look at the actual insert, through a series
of a three step process. First, we need to split the `"GG"` block, which is done by
inserting a new block with ID `a2`.

![Insert step 1](https://streamich.github.io/json-joy/blog/images/blogpost-001/insert-step-1.png)

In the process a new split link `s3` is created, this will allow for faster traversal, for example,
when somebody will want to delete both `"GG"` characters, we will not need to traverse the
whole tree to find the second `"G"` character, we will just follow the split link `s3` to
the second `"G"` character. Also, note that when serializing the tree, we can remove all the
split links, because we can reconstruct them on the fly, when de-serializing the tree.

Second, we need to insert the `"OOD "` block, which is done by inserting a new block with
the ID `d.5`.

![Insert step 2](https://streamich.github.io/json-joy/blog/images/blogpost-001/insert-step-2.png)

Finally, we perform rotations such that the new block `d.5` is rotated to the top, while
the `a.1` and `a.2` blocks are rotated to the bottom.

![Insert step 3](https://streamich.github.io/json-joy/blog/images/blogpost-001/insert-step-3.png)

Now the example above is a bit simplified, because in reality we have two trees, one for
the Text Rope and one for the Identifier Table. Actually, for optimization purposes the same
nodes are used in both trees, so the trees are not separate, but rather they are different
sorted views of the same data, but that is an implementation detail. The important thing is
that we have two trees, one for the Text Rope and one for the Identifier Table, and here is
how both trees conceptually look like:

![Example with Identifier Table](https://streamich.github.io/json-joy/blog/images/blogpost-001/with-identifier-table.png)

Note that in both trees the newly inserted blocks are rotated to the top of the trees, which
for typical user interactions is a good thing. Users type sequentially whole sentences at a time.
Rotating recently accessed content to the top often leads to less then `O(log n)` insertion time
for the next character, because the next character is likely to be inserted in the same block
as the previous character, which is already at the top of the tree.

And this leads to the final optimization that I will mention: merging blocks. When a user
types a whole word, or a sentence, or a paragraph sequentially, we do not create a new block
for each character. Instead, a new block is created only when user changes the cursor position.
So, if a user types a whole word, or a sentence, or a paragraph sequentially, we will create
a single block for the whole word, or sentence, or paragraph. This is done by merging the
blocks with adjacent IDs.

![Character merging into block](https://streamich.github.io/json-joy/blog/images/blogpost-001/char-merging.png)


## Benchmarks

In this section we will benchmark `json-joy` implementation of `StringRga` against other
libraries. For that, lets first take a look at the datasets wi will use for benchmarking.


### Datasets

There will be no micro benchmarks, only real world large text documents will be tested. Five
realistic relatively long text documents will be used.

- The first one is the editing trace of this blog post, yes, the one you are reading now! It is
  called `json-joy-crdt`, the trace contains all inserts and deletes made to type this blog
  post. The trace was collected using the [`vscode-tracker`][vscode-tracker] VS Code extension.
- The other four traces are taken from the [CRDT benchmarks][crdt-benchmarks] repository, see this
  [description and license information](https://github.com/josephg/crdt-benchmarks/blob/7b0b90e912cfa88aff8c6336917343ee08653e51/README.md#data-sets).
  - The first trace is the canonical `automerge-paper` trace, made by Martin Kleppmann, the author
    of the [Automerge][automerge] library. The editing trace was collected while writing the
    ["A Conflict-Free Replicated JSON Datatype" paper](https://arxiv.org/abs/1608.03960). It
    contains 259,778 single character insert/delete operations, with the final document size
    of 104,852 bytes, which results in 12,387 `json-joy` RGA blocks in the tree.
  - The second one is `seph-blog1` trace, which is a trace by Seph Gentle collected while writing
    the ["5000x faster CRDTs: An Adventure in Optimization"][seph-blog1] blog post. The trace contains
    137,154 insert/delete operations, with the final document size of 56,769 bytes, which results
    in 18,222 `json-joy` RGA blocks in the tree.
  - The third one is `rustcode`. It contains 36,981
    insert/delete operations, with the final document size of 65,218 bytes, which results in
    12,505 `json-joy` RGA blocks in the tree.
  - The last one is `sveltecomponent`, it contains 18,335 insert/delete operations, with the
    final document size of 18,451 bytes, which results in 5,813 `json-joy` RGA blocks in
    the tree.

Each dataset contains a list of insert or delete operations, each operations specifies the position
in the document and whether text needs to be inserted or deleted at that position.

Here is the sample of the first operations of the `automerge-paper` editing trace:

``` js
[
  [ 0, 0, '\\' ],  [ 1, 0, 'd' ],   [ 2, 0, 'o' ],   [ 3, 0, 'c' ],
  [ 4, 0, 'u' ],   [ 5, 0, 'm' ],   [ 6, 0, 'e' ],   [ 7, 0, 'n' ],
  [ 8, 0, 't' ],   [ 9, 0, 'c' ],   [ 10, 0, 'l' ],  [ 11, 0, 'a' ],
  [ 12, 0, 's' ],  [ 13, 0, 's' ],  [ 14, 0, '[' ],  [ 15, 0, 'a' ],
  [ 16, 0, '4' ],  [ 17, 0, 'p' ],  [ 18, 0, 'a' ],  [ 19, 0, 'p' ],
  [ 20, 0, 'e' ],  [ 21, 0, 'r' ],  [ 22, 0, ',' ],  [ 23, 0, 't' ],
  [ 24, 0, 'w' ],  [ 25, 0, 'o' ],  [ 26, 0, 'c' ],  [ 27, 0, 'o' ],
  [ 28, 0, 'l' ],  [ 29, 0, 'u' ],  [ 30, 0, 'm' ],  [ 31, 0, 'n' ],
  [ 32, 0, ',' ],  [ 33, 0, '1' ],  [ 34, 0, '0' ],  [ 35, 0, 'p' ],
  [ 36, 0, 't' ],  [ 37, 0, ']' ],  [ 38, 0, '{' ],  [ 39, 0, 'a' ],
  [ 40, 0, 'r' ],  [ 41, 0, 't' ],  [ 42, 0, 'i' ],  [ 43, 0, 'c' ],
  [ 44, 0, 'l' ],  [ 45, 0, 'e' ],  [ 46, 0, '}' ],  [ 47, 0, '\n' ],
  [ 48, 0, '\\' ], [ 49, 0, 'u' ],  [ 50, 0, 's' ],  [ 51, 0, 'e' ],
  [ 52, 0, 'p' ],  [ 53, 0, 'a' ],  [ 54, 0, 'c' ],  [ 55, 0, 'k' ],
  [ 56, 0, 'a' ],  [ 57, 0, 'g' ],  [ 58, 0, 'e' ],  [ 59, 0, '{' ],
  [ 59, 1, '' ],   [ 59, 0, '[' ],  [ 60, 0, 'u' ],  [ 61, 0, 't' ],
  [ 62, 0, 'f' ],  [ 63, 0, '8' ],  [ 64, 0, ']' ],  [ 65, 0, '{' ],
  [ 66, 0, 'i' ],  [ 67, 0, 'n' ],  [ 68, 0, 'p' ],  [ 69, 0, 'u' ],
  [ 70, 0, 't' ],  [ 71, 0, 'e' ],  [ 72, 0, 'n' ],  [ 73, 0, 'c' ],
  [ 74, 0, '}' ],  [ 75, 0, '\n' ], [ 76, 0, '\\' ], [ 77, 0, 'u' ],
  [ 78, 0, 's' ],  [ 79, 0, 'e' ],  [ 80, 0, 'p' ],  [ 81, 0, 'a' ],
  [ 82, 0, 'c' ],  [ 83, 0, 'k' ],  [ 84, 0, 'a' ],  [ 85, 0, 'g' ],
  [ 86, 0, 'e' ],  [ 87, 0, '{' ],  [ 88, 0, 'm' ],  [ 89, 0, 'a' ],
  [ 90, 0, 't' ],  [ 91, 0, 'h' ],  [ 92, 0, 'p' ],  [ 93, 0, 't' ],
  [ 94, 0, 'm' ],  [ 95, 0, 'x' ],  [ 96, 0, '}' ],  [ 97, 0, ' ' ],
```

Each operation is a 3-tuple which contains: (1) the position in the document; (2) the length of
the text to be deleted; and (3) the text to be inserted at that position.


### Benchmarks against CRDT libraries

First we will benchmark `json-joy` against a peer group of other CRDT libraries:

- [Automerge][automerge] is probably the best known RGA algorithm implementation in JavaScript.
- [Y.js][yjs] is the most widely used JavaScript CRDT library, which implements YATA algorithm.
- [Y.rs][yrs] is a port of Y.js to Rust. We use the `ywasm` package, which is a WebAssembly
  module compiled from its Rust code.

Below is a sample output of running the benchmarks, numbers are in milliseconds it took to
execute the full trace:


```
============================================================================
Editing trace: "sveltecomponent" , Transactions: 18335 , End length: 18451
----------------------------------------------------------------------------
Automerge
#1: 7325.6
#2: 7281
#3: 7286.3
Correct: false Length: 18451 Chunks: 0
Best: 7281 Worst: 7325.6 Average: 7297.6 Tx/sec: 2,512
----------------------------------------------------------------------------
Y.js
#1: 381.2
#2: 358.6
#3: 360.1
Correct: true Length: 18451 Chunks: 4627
Best: 358.6 Worst: 381.2 Average: 366.6 Tx/sec: 50,008
----------------------------------------------------------------------------
Y.rs
#1: 272.5
#2: 256.6
#3: 255.9
Correct: true Length: 18451 Chunks: 0
Best: 255.9 Worst: 272.5 Average: 261.7 Tx/sec: 70,071
----------------------------------------------------------------------------
StringRga (json-joy)
#1: 19.1
#2: 8.1
#3: 6.2
Correct: true Length: 18451 Chunks: 5813
Best: 6.2 Worst: 19.1 Average: 11.1 Tx/sec: 1,650,406


============================================================================
Editing trace: "seph-blog1" , Transactions: 137154 , End length: 56769
----------------------------------------------------------------------------
Automerge
#1: 20531.4
#2: 22141.3
#3: 20786.2
Correct: false Length: 56769 Chunks: 0
Best: 20531.4 Worst: 22141.3 Average: 21153 Tx/sec: 6,484
----------------------------------------------------------------------------
Y.js
#1: 2661
#2: 2664.9
#3: 2652.8
Correct: true Length: 56769 Chunks: 15092
Best: 2652.8 Worst: 2664.9 Average: 2659.5 Tx/sec: 51,571
----------------------------------------------------------------------------
Y.rs
#1: 4534.2
#2: 4411.7
#3: 4488.2
Correct: false Length: 56777 Chunks: 0
Best: 4411.7 Worst: 4534.2 Average: 4478.1 Tx/sec: 30,628
----------------------------------------------------------------------------
StringRga (json-joy)
#1: 23.7
#2: 24.8
#3: 22.9
Correct: true Length: 56769 Chunks: 18222
Best: 22.9 Worst: 24.8 Average: 23.8 Tx/sec: 5,763,130


============================================================================
Editing trace: "rustcode" , Transactions: 36981 , End length: 65218
----------------------------------------------------------------------------
Y.js
#1: 720
#2: 717.4
#3: 710.7
Correct: true Length: 65218 Chunks: 10044
Best: 710.7 Worst: 720 Average: 716 Tx/sec: 51,647
----------------------------------------------------------------------------
Y.rs
#1: 856.8
#2: 862.2
#3: 857.9
Correct: false Length: 65235 Chunks: 0
Best: 856.8 Worst: 862.2 Average: 859 Tx/sec: 43,053
----------------------------------------------------------------------------
StringRga (json-joy)
#1: 19.4
#2: 17.9
#3: 12.5
Correct: true Length: 65218 Chunks: 12505
Best: 12.5 Worst: 19.4 Average: 16.6 Tx/sec: 2,225,405


============================================================================
Editing trace: "automerge-paper" , Transactions: 259778 , End length: 104852
----------------------------------------------------------------------------
Y.js
#1: 4787.8
#2: 4740
#3: 4739.7
Correct: true Length: 104852 Chunks: 10971
Best: 4739.7 Worst: 4787.8 Average: 4755.8 Tx/sec: 54,623
----------------------------------------------------------------------------
Y.rs
#1: 5923.9
#2: 5869.7
#3: 5904.8
Correct: true Length: 104852 Chunks: 0
Best: 5869.7 Worst: 5923.9 Average: 5899.5 Tx/sec: 44,034
----------------------------------------------------------------------------
StringRga (json-joy)
#1: 98.6
#2: 49.6
#3: 45.9
Correct: true Length: 104852 Chunks: 12387
Best: 45.9 Worst: 98.6 Average: 64.7 Tx/sec: 4,014,031
```

Notable observations:

- Automerge participated only it the first two traces, as it was not able to handle the
  larger traces.
- Y.js is about 10x faster than Automerge.
- Y.rs is slower than Y.js in all benchmarks, but `sveltecomponent`, which is the smallest
  trace.
- `json-joy` is about 50-100x faster than Y.js and 1,000x faster than Automerge.


### Benchmarks against non-CRDT libraries

`json-joy` RGA implementation i

- `V8 strings` is a benchmark against native JavaScript strings, which are implemented in V8
  JavaScript engine. It just uses `str.slice()` to perform insert and delete operations.



### A note on Rust fad among CRDT library authors

Firstly, we believe that Rust is a great language and would love to port `json-joy` to Rust some day.
This comment is not about the Rust language, but rather about the Rust fad among CRDT library authors.

It seems there is a pattern of JavaScript CRDT libraries being ported to Rust, and here are the
examples:

- [Automerge][automerge] is a JavaScript CRDT library, which has rewritten its lower-level API, what it
  calls "backend", into Rust. Now, the Rust backend is compiled into WebAssembly module and published as
  `@automerge/automerge-wasm` package, which the `@automerge/automerge` JavaScript
  code calls into through WebAssembly ABI for all its document operations. But, as you can see from
  the benchmarks above, Automerge is still 1,000x slower than `json-joy`.
- [Y.rs][yrs] is a Rust port of a JavaScript CRDT library [Y.js][yrs]. As you can see from the
  benchmarks above, Y.js is about 100x slower than `json-joy` and the Rust port (which is exposed to
  JavaScript through WebAssembly `ywasm` package) is about the same speed as the JavaScript version,
  also about 100x slower than `json-joy`.
- `diamond-types` is a Rust library which intends to implement various novel CRDT algorithms. It is
  written by Seph Gentle, the author of numerous JavaScript collaborative editing libraries. The Rust
  is chosen in search of performance, the library is exposed to JavaScript through WebAssembly ABI from
  the `diamond-types-node` NPM package.

As a rule of thumb, an equivalent algorithm implemented in Rust will be about 2-5x faster than the
same algorithm implemented in JavaScript. However, when compiling Rust to WebAssembly, it loses about
3-4x of its performance. So, net-net code ported from JavaScript to Rust and then compiled to WebAssembly
for consumption in JavaScript will be about the same speed as the original JavaScript code.

However, packaging code into WebAssembly modules has downsides. Firstly, WebAssembly modules limit
the data structures one can share between the JavaScript and WebAssembly code.

Secondly, WebAssembly modules result in larger bundle sizes, which is a problem for web applications.
WASM modules can easily reach 100 KB in size, sometimes even 1 MB. Below are the real-world sizes of the
WASM modules for the libraries mentioned above:

`@automerge/automerge-wasm` - 1.3 MB

![Character merging into block](https://streamich.github.io/json-joy/blog/images/wasm-sizes/automerge-wasm.png)

`ywasm` - 1 MB

![Character merging into block](https://streamich.github.io/json-joy/blog/images/wasm-sizes/ywasm.png)

`diamond-types-node` - 300 KB

![Character merging into block](https://streamich.github.io/json-joy/blog/images/wasm-sizes/diamond-types-node.png)





[rga]: https://www.sciencedirect.com/science/article/abs/pii/S0743731510002716
[causal-tree]: https://www.researchgate.net/publication/221367739_Deep_hypertext_with_embedded_revision_control_implemented_in_regular_expressions
[high-responsiveness-crdts]: https://pages.lip6.fr/Marc.Shapiro/papers/rgasplit-group2016-11.pdf
[rope]: https://en.wikipedia.org/wiki/Rope_(data_structure)
[crdt-benchmarks]: https://github.com/josephg/crdt-benchmarks
[datasets]: https://github.com/josephg/crdt-benchmarks/blob/7b0b90e912cfa88aff8c6336917343ee08653e51/README.md#data-sets
[automerge]: https://github.com/automerge/automerge
[yrs]: https://github.com/y-crdt/y-crdt
[yjs]: https://github.com/yjs/yjs
[vscode-tracker]: https://github.com/josephg/vscode-tracker
[seph-blog1]: https://josephg.com/blog/crdts-go-brrr/
