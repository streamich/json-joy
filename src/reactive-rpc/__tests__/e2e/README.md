# Reactive-RPC E2E tests

This folder contains E2E tests for Reactive-RPC. You can run the tests with a
single command:

```
yarn test:reactive-rpc
```

Or you can start the server in one terminal window:

```
yarn demo:reactive-rpc:server
```

And run the test cases in another terminal window:

```
yarn test:reactive-rpc:jest
```

To run a specific test suite use this command:

```
TEST_E2E=1 npx jest --no-cache src/reactive-rpc/__tests__/e2e/uws/ws/RpcPersistentClient.spec.ts
```
