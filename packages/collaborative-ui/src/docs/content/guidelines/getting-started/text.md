Install `@jsonjoy.com/ui` package.

```
npm install @jsonjoy.com/ui
```

Install all peer dependencies.

```
npm install react react-dom rxjs tslib
```

In your React application you will want to set up the UI context provider.

```jsx
import {NiceUiProvider} from '@jsonjoy.com/ui';

const App = () => {
  return (
    <NiceUiProvider>
      <MyComponent />
    </NiceUiProvider>
  );
};
```

Now you can import and use components from the UI library.

```jsx
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';


<BasicButton>
  Click me!
</BasicButton>
```

You will import components directly from their `@jsonjoy.com/ui/lib/...` folder
to avoid importing the entire library.
