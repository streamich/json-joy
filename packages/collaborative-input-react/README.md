# `<CollaborativeInput>` React Component

A React component that binds DOM `<input>` and `<textarea>` elements to JSON CRDT str nodes, enabling seamless collaborative editing with automatic synchronization across multiple users.

## Features

- **Collaborative Editing**: Bind HTML `<input>` or `<textarea>` elements to JSON CRDT data structures for real-time multi-user editing
- **Automatic Synchronization**: Changes in the DOM automatically sync to the CRDT model and vice versa
- **Flexible Integration**: Use as a controlled component or with custom input elements
- **Polling Support**: Optional polling for detecting third-party modifications to input elements

## Installation

```bash
npm install @jsonjoy.com/collaborative-input-react
```

## Basic Usage

### Simple Input Example

```tsx
import React from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';

export const MyComponent = () => {
  const model = React.useMemo(() => Model.create(), []);

  return (
    <CollaborativeInput
      str={() => model.api.str(['myText'])}
      placeholder="Type here..."
    />
  );
};
```

### Textarea Example

```tsx
<CollaborativeInput
  str={() => model.api.str(['description'])}
  multiline
  placeholder="Enter multi-line text..."
/>
```

### Custom Input Element

You can provide a custom React component which renders the `<input>` or `<textarea>` elements,
you just need to connect the ref to the underlying DOM element using the `input` prop:

```tsx
<CollaborativeInput
  str={() => model.api.str(['myText'])}
  input={(connect) => (
    <input
      ref={connect}
      type="text"
      className="my-custom-input"
    />
  )}
/>
```

## Props

### CollaborativeInputProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `str` | `() => CollaborativeStr` | **required** | Function returning the JSON CRDT str node to bind |
| `multiline` | `boolean` | `false` | When `input` prop is not provided, determines whether to render `<input>` or `<textarea>` |
| `polling` | `boolean` | `false` | Enable polling for updates when third-party code modifies the input element's value |
| `input` | `(ref) => React.ReactNode` | - | Custom render function for the input element |
| `inp` | `(el) => void` | - | Callback ref to access the DOM element |
| `...rest` | `React.InputHTMLAttributes` | - | Standard HTML input/textarea attributes (className, placeholder, etc.) |


## Advanced Usage

### With Polling

Normally you never need polling. But if you know some JavaScript can modify the underlying
input DOM element, you can enable polling to detect such changes:

```tsx
<CollaborativeInput
  str={() => model.api.str(['myText'])}
  polling={true}
/>
```

### Accessing the DOM Element

```tsx
const inputRef = React.useRef<HTMLInputElement>(null);

<CollaborativeInput
  str={() => model.api.str(['myText'])}
  inp={(el) => {
    if (inputRef.current) {
      inputRef.current = el;
    }
  }}
/>
```

### Programmatic Updates

```tsx
const handleClick = () => {
  const str = model.api.str(['myText']);
  str.ins(str.view().length, '!');
};
```


## How It Works

The `CollaborativeInput` component:

1. Creates a binding between the HTML input/textarea element and a JSON CRDT str node
2. Listens to DOM input events and synchronizes changes to the CRDT model
3. Subscribes to model updates and reflects them in the DOM element
4. Automatically unbinds when the component unmounts
5. Optionally polls for changes detected by external code


## Related Packages

- [@jsonjoy.com/collaborative-input](../collaborative-input) - DOM input binding logic
- [@jsonjoy.com/collaborative-str](../collaborative-str) - Generic plain text binding logic
- [json-joy](../json-joy) - CRDT model and synchronization


## See Also

- [Demo](https://streamich.github.io/collaborative-input)
- [GitHub Repository](https://github.com/streamich/json-joy)
