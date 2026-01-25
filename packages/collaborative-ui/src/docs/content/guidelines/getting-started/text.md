Install `nice-ui` package.

```
npm install nice-ui
```

Install all peer dependencies.

```
npm install react react-dom rxjs tslib
```

In your React application you will want to set up the Nice UI context provider.

```jsx
import {NiceUiProvider} from 'nice-ui';

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
import {Button} from 'nice-ui/lib/2-inline-block/BasicButton';


<BasicButton>
  Click me!
</BasicButton>
```

You will import components directly from their `nice-ui/lib/...` folder
to avoid importing the entire library.
