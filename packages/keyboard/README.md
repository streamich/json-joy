# `@jsonjoy.com/keyboard`

Keyboard input tracking: key bindings, chords, nested contexts, and pluggable sources.

## Installation

```bash
npm install @jsonjoy.com/keyboard
```

## Concepts

| Term | Description |
|---|---|
| **KeySource** | Produces raw key events (DOM `document`, an `HTMLElement`, or a manual test source). |
| **KeyContext** | Consumes key events, holds a binding map, tracks pressed keys, and propagates unhandled events to a parent context. |
| **KeyMap** | Stores press / release / chord / sequence bindings for a context. |
| **Signature** | A string that identifies a single key press, e.g. `'a'`, `'Control+s'`, `'Shift+F5:R'`. |
| **Chord** | Two or more keys held simultaneously, e.g. `'a+b'` or `'Control+j+k'`. |
| **Sequence** | Two or more key presses in order within a timeout, e.g. `'g g'` or `'Control+k Control+d'`. |
| **KeySet** | The live set of currently-pressed keys. |

---

## Quick start

```ts
import { KeyContext } from '@jsonjoy.com/keyboard';

// Bind to document/window key events
const [ctx, unbind] = KeyContext.global();

// Register a key binding
ctx.map.setPress('Control+s', () => save());
ctx.map.setPress('Escape', () => cancel());

// Clean up
unbind();
```

---

## Signatures

A `Signature` is a compact string that uniquely identifies a key gesture.

```
[<ModPrefix>+]<Key>[:R]
```

| Part | Values | Meaning |
|---|---|---|
| `ModPrefix` | `Alt` `Control` `Meta` `Shift` and `+`-separated combinations | Alt, Ctrl, Meta/Cmd, Shift |
| `Key` | Letter, digit, symbol, or named key | The physical key |
| `:R` | optional suffix | Key is auto-repeating |

### Examples

| Signature | Gesture |
|---|---|
| `'a'` | Press A |
| `'Control+s'` | Ctrl + S |
| `'Meta+z'` | Meta/Cmd + Z |
| `'Control+Shift+k'` | Ctrl + Shift + K |
| `'F5'` | Function key 5 |
| `'Shift+F5:R'` | Shift + F5 held (repeating) |
| `'ArrowUp'` | Up arrow |
| `'Space'` | Spacebar |
| `'Alt'` | Alt pressed alone |
| `'Shift'` | Shift pressed alone |

### Named keys

`ArrowUp` `ArrowRight` `ArrowDown` `ArrowLeft` `Enter` `Escape` `Tab`
`Backspace` `Delete` `Home` `End` `PageUp` `PageDown` `Space`
`F1`–`F12`  `,` `.` `/` `;` `'` `[` `]` `\` `-` `=`

### Wildcard signatures

| Signature | Behaviour |
|---|---|
| `''` (empty string) | Fires for **every** key — useful for logging or global interceptors. |
| `'?'` | Fires only when **no exact binding** matched — useful as a fallback / unhandled-key handler. |

Both wildcards can coexist. For an unmatched key both fire; for a matched key only `''` fires (alongside the exact match).

---

## `KeyContext`

### Creating a root context

```ts
// Attached to document/window
const [ctx, unbind] = KeyContext.global('myApp');

// Manual (unit tests, custom event loops)
import { KeySourceManual } from '@jsonjoy.com/keyboard';
const ctx = new KeyContext();
const src = new KeySourceManual();
const unbind = src.bind(ctx);
```

### Registering bindings with `ctx.bind()`

`bind()` accepts an array of bindings in either shorthand or object form and
returns an `unbind` function.

```ts
const unbind = ctx.bind([
  // shorthand: [signature, action, options?]
  ['Control+s', () => save()],
  ['Control+z', () => undo(), { propagate: true }],

  // sequence (space-separated steps)
  ['g g',                   () => goToTop()],
  ['Control+k Control+d',   () => formatDocument()],

  // object form
  { sig: 'Escape', action: () => cancel() },
  { sig: 'Enter',  action: () => confirm(), release: true },
]);

// Remove all the above bindings at once
unbind();
```

#### Options

| Option | Default | Description |
|---|---|---|
| `propagate` | `false` | When `true`, the event continues up to the parent context after the handler runs. |
| `release` | `false` | When `true`, the binding fires on key **release** instead of press. |

### Low-level `KeyMap` API

```ts
ctx.map.setPress('a', (key) => { /* ... */ });
ctx.map.delPress('a', handler);

ctx.map.setRelease('a', (key) => { /* ... */ });
ctx.map.delRelease('a', handler);
```

### Pressed keys & history

```ts
ctx.pressed.keys;    // Key[] — currently held keys
ctx.history;         // Key[] — last N pressed keys (default 25)
ctx.historyLimit = 10;
```

### Pause / resume

```ts
ctx.pause();   // stop dispatching (events are still tracked for `pressed`)
ctx.resume();
```

### Sequence timeout

```ts
ctx.seqTimeout = 800; // ms between consecutive steps (default: 1000)
```

### Change notifications

```ts
ctx.onChange.listen(() => {
  console.log('pressed:', ctx.pressed.keys.map(k => k.sig()));
});
```

---

## Key sequences

A sequence fires when key steps are pressed **in order** within a configurable
timeout. Steps are space-separated `Signature` values.

```ts
// g then g
ctx.map.setSequence('g g', () => goToTop());

// Ctrl+K then Ctrl+D
ctx.map.setSequence('Control+k Control+d', () => formatDocument());

// Three steps
ctx.map.setSequence('Escape g i', () => goToInbox());

// Remove
ctx.map.delSequence('g g', handler);
```

Or via `ctx.bind()` — any signature containing a space is treated as a sequence:

```ts
ctx.bind([
  ['g g',               () => goToTop()],
  ['Control+k Control+d', () => formatDocument()],
]);
```

### Sequence behaviour

- **Default timeout**: 1 000 ms between steps (configurable via `ctx.seqTimeout`).
- **Fire-and-track**: if a key also has a single-key binding, that binding fires
  immediately; the sequence continues tracking regardless.
- **Eager match**: when `g i` and `g i x` are both registered, `g i` fires as
  soon as `i` is pressed and the matcher stays alive for `x`.
- **Reset triggers**: timeout expiry, `window.blur`, focus change, composition
  start, or a non-matching key.

---

## Chords

A chord fires when **two or more keys are held simultaneously**. The chord
signature is the sorted, `+`-separated list of key names, optionally prefixed
by a shared modifier block.

```
[<ModPrefix>+]<key1>+<key2>[+<key3>…]
```

```ts
// Two-key chord
ctx.setChord('a+b', (pressed) => {
  console.log('a and b held together');
});

// Modifier chord
ctx.setChord('Control+j+k', () => {
  console.log('Ctrl+J+K');
});

// Remove
ctx.delChord('a+b', handler);
```

The action receives the full [`KeySet`](#keyset) of currently-pressed keys.

### Chord vs single-key dispatch

When a chord fires, the single-key binding for the key that **completed** the
chord is suppressed. The earlier keys' single-key bindings still fire normally
because the chord was not yet complete when they were pressed.

---

## Nested contexts

`KeyContext` can be nested. Events flow **down** to the deepest leaf context
and propagate back **up** to parent contexts unless consumed.

```ts
const [root, unbindRoot] = KeyContext.global();

// Child inherits the same key source as the parent
const child = root.child('modal');
child.map.setPress('Escape', () => closeModal());

// Replace child with a new one (the old child is detached automatically)
const subChild = child.child('tooltip');
```

### Custom key source for a child

A child can receive events from a different `HTMLElement` (or any `KeySource`)
rather than inheriting the parent's source:

```ts
const inputEl = document.querySelector('input')!;
const child = root.child('inputField', inputEl);
// inputEl's keydown/keyup events now drive `child` independently
```

---

## `KeySet`

The `KeySet` class tracks which keys are currently held.

```ts
ctx.pressed.keys;         // Key[]
ctx.pressed.start();      // timestamp of the earliest currently-pressed key
ctx.pressed.end();        // timestamp of the most recently pressed key
ctx.pressed.chordSig();   // canonical chord signature, e.g. 'a+b'
```

---

## `Key`

A `Key` object is passed to every action callback.

```ts
key.key        // raw DOM key name, e.g. 'a', 'Enter', ' '
key.mod        // modifier string, e.g. 'Control', 'Control+Shift', 'Alt+Control+Meta+Shift'
key.ts         // Date.now() timestamp
key.sig()      // full Signature string, e.g. 'Control+s', 'Space'
key.event      // original KeyboardEvent (if available)
key.propagate  // mutable — set to true inside a handler to bubble to parent
```

---

## Key remapping

`KeyContext` supports an optional remap table (`ctx.remap`) that translates raw
`event.key` values to canonical key names **before** any binding lookup or
history recording. This is useful for environments that emit non-standard key
names such as `'Esc'` instead of `'Escape'`, or `'Return'` instead of `'Enter'`.

```ts
// Register remappings
ctx.setRemap(' ',      'Space');
ctx.setRemap('Esc',    'Escape');
ctx.setRemap('Return', 'Enter');

// Now a binding for 'Escape' fires when 'Esc' (or 'Escape') is received
ctx.map.setPress('Escape', () => cancel());

// Modifiers are preserved: Ctrl+Esc → matches 'Control+Escape'
ctx.map.setPress('Control+Escape', () => closeAll());

// Remove a remapping
ctx.delRemap('Esc');
```

Remapping is **per-context**. When an event propagates to a parent, the parent
receives the original (pre-remap) key and applies its own `remap` independently.

Remapping applies to:
- Single-key press and release bindings.
- Sequence steps (`g Escape`, `C+k Escape`, …).
- The `key.key` value seen in action callbacks and `ctx.history`.

Chords use physical key names from `event.code` and are unaffected.

---

## Pluggable key sources

| Source | Description |
|---|---|
| `KeySourceDoc` | Listens to `document` keydown / keyup (default for `KeyContext.global()`). |
| `KeySourceEl` | Listens to a specific `HTMLElement`. |
| `KeySourceManual` | Programmatically sends events — designed for unit tests. |

### Implementing a custom source

```ts
import type { KeySource, KeySink } from '@jsonjoy.com/keyboard';

class MySource implements KeySource {
  bind(sink: KeySink): () => void {
    // wire up your event emitter → call sink.onPress / sink.onRelease / sink.onReset
    const cleanup = engine.on('key', (e) => {
      sink.onPress(new Key(e.name, Date.now()));
    });
    return cleanup;
  }
}
```
