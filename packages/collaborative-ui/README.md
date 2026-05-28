# `@jsonjoy.com/collaborative-ui`

A library of React components for building real-time collaborative editing
experiences powered by [JSON CRDT](https://jsonjoy.com). Includes ready-made
integrations for popular code and rich-text editors, and a visual toolkit for
inspecting and debugging JSON CRDT documents.

## Installation

```bash
npm install json-joy @jsonjoy.com/collaborative-ui
```

## Usage

Import components directly from their directories:

```tsx
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {JsonCrdtModel} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtModel';
import {SideBySideSync} from '@jsonjoy.com/collaborative-ui/lib/SideBySideSync';
```

### Collaborative Text Input

```tsx
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';

const model = Model.create(s.obj({text: s.str('Hello!')}));

<CollaborativeInput str={() => model.s.text.$} />
```
