Install `@onp4/ui/` package.

```
npm install @onp4/ui/
```

Install all peer dependencies.

```
npm install react react-dom rxjs tslib
```

In your React application you will want to set up the Nice UI context provider.

```jsx
import {NiceUiProvider} from '@onp4/ui/';

const App = () => {
  return (
    <NiceUiProvider>
      <MyComponent />
    </NiceUiProvider>
  );
};
```

Now you can import and use components from Nice UI.

```jsx
import {Button} from '@onp4/ui/lib/2-inline-block/BasicButton';


<BasicButton>
  Click me!
</BasicButton>
```

You will import components directly from their `@onp4/ui/lib/...` folder
to avoid importing the entire library.
