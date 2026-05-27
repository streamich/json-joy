This section is describes how to contribute to the `json-joy` library. Skip this
section if you are not planning to contribute.

First you need ot `git clone ...` the repo and then install the dependencies
using `yarn`:

```
git clone https://github.com/streamich/json-joy.git
cd json-joy
yarn
```


## Building

To quickly build the library run:

```
yarn build
```

To build for all targets run:

```
yarn build:all
```

You will also want to run the linter and fix any errors it reports:

```
yarn lint
```

Once you are done with the changes, you will need to format the code with Prettier:

```
yarn prettier
```


## Running tests

You can run just the unit tests with the following command:

```
yarn test
```

You can also run tests in a watch mode and only for specific files:

```
yarn test --watch src/json-patch/__tests__/json-patch.test.ts
```

To run all the tests you will first need to build the project and then
execute `yarn test:all`:

```
yarn build
yarn test:all
```


## Committing changes

Use [Angular-type semantic commit messages](https://www.conventionalcommits.org/en/v1.0.0-beta.4/)
for commit messages. Those are used in determining the version bump of the
library for the next release. Optional, you can use `git-cz` for that:

```bash
npm install -g git-cz
```

Then instead of `git commit` use:

```bash
git-cz
```


## What can I contribute?

There are always a number of [open issues](https://github.com/streamich/json-joy/issues) which
your can help with. There are also [issues marked with `good first issues`](https://github.com/streamich/json-joy/labels/good%20first%20issue) label, which should
be self-contained and easier to start with for first-time contributors. If you have an idea for a new feature, please open an issue
first to discuss it with the maintainers.
