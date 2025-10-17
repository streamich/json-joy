# ot-json

## JSON OT Patch

### `json` encoding

```js
{
  pick: [
    {reg: 0, path: ['foo', 'bar']},
  ],
  drop: [
    {reg: 0, path: ['bar']},
  ],
  edit: [
    {type: 'str', path: ['bar'], operation: [4, 'hello']},
  ],
}
```

P.S. Pick/drop/edit are used because they are all short 4-letter words.

## JSON Patch compatibility

Add:

```js
{op: 'add', path: ['foo', 'bar'], value: 'hello'}

{
  pick: [],
  drop: [
    {value: 'hello', path: ['foo', 'bar']},
  ],
}
```

Replace:

```js
{op: 'replace', path: ['foo', 'bar'], value: 'hello'}

{
  pick: [
    {reg: -1, path: ['foo', 'bar']},
  ],
  drop: [
    {value: 'hello', path: ['foo', 'bar']},
  ],
}
```

Remove:

```js
{op: 'remove', path: ['foo', 'bar']}

{
  pick: [
    {reg: -1, path: ['foo', 'bar']},
  ],
  drop: [],
}
```

Move:

```js
{op: 'move', from: ['foo', 'a', 'b'], path: ['foo', 'bar']}

{
  pick: [
    {reg: 0, path: ['foo', 'a', 'b']},
  ],
  drop: [
    {reg: 0, path: ['foo', 'bar']},
  ],
}
```

Copy:

```js
{op: 'copy', from: ['foo', 'a', 'b'], path: ['foo', 'bar']}

{
  pick: [
    {reg: 0, path: ['foo', 'a', 'b']},
  ],
  drop: [
    {reg: 0, path: ['foo', 'a', 'b']},
    {reg: 0, path: ['foo', 'bar']},
  ],
}
```

An operation updates content which was moved:

```js
{op: 'replace', path: ['a', 'title'], value: 'hello'}
{
  pick: [
    {reg: -1, path: ['a', 'title']},
  ],
  drop: [
    {value: 'hello', path: ['a', 'title']},
  ],
}

{op: 'move', from: ['a'], path: ['b']}
{
  pick: [
    {reg: 0, path: ['a']},
  ],
  drop: [
    {reg: 0, path: ['b']},
  ],
}

[
  {op: 'replace', path: ['a', 'title'], value: 'hello'},
  {op: 'move', from: ['a'], path: ['b']},
]
{
  pick: [
    {reg: -1, path: ['a', 'title']},
    {reg: 0, path: ['a']},
  ],
  drop: [
    {reg: 0, path: ['b']},
    {value: 'hello', path: ['b', 'title']},
  ],
}

[
  {op: 'move', from: ['a'], path: ['b']},
  {op: 'replace', path: ['b', 'title'], value: 'hello'},
]
{
  pick: [
    {reg: -1, path: ['a', 'title']},
    {reg: 0, path: ['a']},
  ],
  drop: [
    {reg: 0, path: ['b']},
    {value: 'hello', path: ['b', 'title']},
  ],
}
```
