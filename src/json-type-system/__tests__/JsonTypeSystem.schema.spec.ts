import {types, customValidators} from '../../demo/json-type/samples';
import {JsonTypeSystem} from '../JsonTypeSystem';

test('generates JSON schema for simple string type', () => {
  const system = new JsonTypeSystem({types, customValidators});
  const schema = system.toJsonSchema('ID');
  expect(schema).toStrictEqual({
    type: 'string',
    title: types.ID.title,
    description: types.ID.description,
  });
});

test('generates JSON schema with refs', () => {
  const system = new JsonTypeSystem({types, customValidators});
  const schema = system.toJsonSchema('CreateUserResponse');
  expect(schema).toMatchInlineSnapshot(`
    Object {
      "description": "The response to a create user request.",
      "properties": Object {
        "user": Object {
          "description": "Users are entities in the system that represent a human.",
          "properties": Object {
            "email": Object {
              "type": "string",
            },
            "gid": Object {
              "description": "Unique identifier for any resource in the system regardless of its type.",
              "title": "Global resource ID",
              "type": "string",
            },
            "id": Object {
              "type": "number",
            },
            "name": Object {
              "type": "string",
            },
            "timeCreated": Object {
              "type": "integer",
            },
            "timeUpdated": Object {
              "type": "integer",
            },
          },
          "required": Array [
            "gid",
            "id",
            "email",
            "timeCreated",
            "timeUpdated",
          ],
          "title": "A user object",
          "type": "object",
        },
      },
      "required": Array [
        "user",
      ],
      "title": "A response to a create user request",
      "type": "object",
    }
  `);
});

test('generates JSON schema with refs resolved to $defs', () => {
  const system = new JsonTypeSystem({types, customValidators});
  const schema = system.toJsonSchema('CreateUserResponse', true);
  expect(schema).toMatchInlineSnapshot(`
    Object {
      "$defs": Object {
        "ID": Object {
          "description": "Unique identifier for any resource in the system regardless of its type.",
          "title": "Global resource ID",
          "type": "string",
        },
        "User": Object {
          "description": "Users are entities in the system that represent a human.",
          "properties": Object {
            "email": Object {
              "type": "string",
            },
            "gid": Object {
              "$ref": "#/$defs/ID",
            },
            "id": Object {
              "type": "number",
            },
            "name": Object {
              "type": "string",
            },
            "timeCreated": Object {
              "type": "integer",
            },
            "timeUpdated": Object {
              "type": "integer",
            },
          },
          "required": Array [
            "gid",
            "id",
            "email",
            "timeCreated",
            "timeUpdated",
          ],
          "title": "A user object",
          "type": "object",
        },
      },
      "$id": "CreateUserResponse",
      "description": "The response to a create user request.",
      "properties": Object {
        "user": Object {
          "$ref": "#/$defs/User",
        },
      },
      "required": Array [
        "user",
      ],
      "title": "A response to a create user request",
      "type": "object",
    }
  `);
});
