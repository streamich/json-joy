# Testing

To execute all tests, build the project and then run all tests:

```
yarn build
yarn test:all
```

This `/src/__tests__` is a root folder for all test related concerns.

- `json-documents.ts` file contains a collection of various JSON documents.
- `util.ts` file contains utility functions that can be used in tests.

## Unit testing

You can execute only the unit tests with the following command:

```
yarn test
```

To run a specific file `<filename>` tests prepend it to the command:

```
yarn test <filename>
```

To continuously re-run tests in interactive watch mode prepend `--watch` flag:

```
yarn test <filename> --watch
```

## End-to-end testing

Before running any end-to-end tests you first need to build the project:

```
yarn build
```

### CLI tests

You can execute all CLI test suites with:

```
yarn test:cli
```

Or execute each CLI test suite one-by-one:

```
yarn test:cli:pointer
yarn test:cli:patch
yarn test:cli:pack
```
