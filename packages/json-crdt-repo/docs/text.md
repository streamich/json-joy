## JSON CRDT repo

A local-first browser client for [json-crdt-server](/libs/json-crdt-server). It
persists documents in the browser, lets you edit offline, and synchronizes with
the server when back online.


## Installation

```
npm install @jsonjoy.com/json-crdt-repo
```


## Usage

```ts
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';

const repo = new JsonCrdtRepo();
const session = repo.make('my-document');

// session.model is a JSON CRDT model that can be read and edited.
console.log(session.model.view());
```
