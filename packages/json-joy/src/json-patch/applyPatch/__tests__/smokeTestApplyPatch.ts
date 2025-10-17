import type {ApplyPatch} from '../types';
import type {Operation} from '../..';

interface Options {
  dontTestResultHistory?: boolean;
}

export const smokeTestApplyPatch = (applyPatch: ApplyPatch, {dontTestResultHistory = false}: Options = {}) => {
  describe('applyPatch [smoke tests]', () => {
    describe('root replacement', () => {
      describe('add', () => {
        it('should `add` an object (on a json document of type object) - in place', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).doc;

          expect(newObj).toEqual({hello: 'universe'});
        });

        it('should `add` an object (on a json document of type object) - and return', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({
            hello: 'universe',
          });
        });

        it('should `add` an object (on a json document of type array) - and return', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({
            hello: 'universe',
          });
        });

        it('should `add` an array (on a json document of type array) - in place', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: [
                  {
                    hello: 'universe',
                  },
                ],
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([
            {
              hello: 'universe',
            },
          ]);
        });

        it('should `add` an array (on a json document of type array) - and return', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: [
                  {
                    hello: 'universe',
                  },
                ],
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([
            {
              hello: 'universe',
            },
          ]);
        });

        it('should throw when adding prop to array', () => {
          const obj: any = [];
          expect(() =>
            applyPatch(
              obj,
              [
                {
                  op: 'add',
                  path: '/prop',
                  value: 'arrayProp',
                },
              ],
              {mutate: true},
            ),
          ).toThrowErrorMatchingInlineSnapshot(`"INVALID_INDEX"`);
        });

        it('should `add` an array (on a json document of type object) - and return', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: [
                  {
                    hello: 'universe',
                  },
                ],
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([
            {
              hello: 'universe',
            },
          ]);
        });

        it('should `add` a primitive (on a json document of type object) - and return', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: 1,
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(1);
        });

        it('should `add` with a primitive (on a json document of type array) - and return', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: 1,
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(1);
        });
      });

      describe('replace', () => {
        it('should `replace` with an object (on a json document of type object)', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({
            hello: 'universe',
          });
        });

        it('should `replace` with an object (on a json document of type array)', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({
            hello: 'universe',
          });
        });

        it('should `replace` with an array (on a json document of type array)', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: [
                  {
                    hello: 'universe',
                  },
                ],
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([
            {
              hello: 'universe',
            },
          ]);
        });

        it('should `replace` with an array (on a json document of type object)', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: [
                  {
                    hello: 'universe',
                  },
                ],
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([
            {
              hello: 'universe',
            },
          ]);
        });

        it('should `replace` with a primitive (on a json document of type object)', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: 1,
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(1);
        });

        it('should `replace` with a primitive (on a json document of type array)', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: 1,
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(1);
        });
      });

      describe('remove', () => {
        it('should `remove` root (on a json document of type array)', () => {
          const obj: any = [
            {
              hello: 'world',
            },
          ];
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'remove',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(null);
        });

        it('should `remove` root (on a json document of type object)', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'remove',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual(null);
        });
      });

      describe('move', () => {
        it('should `move` a child of type object to root (on a json document of type object)', () => {
          const obj: any = {
            child: {name: 'Charles'},
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'move',
                from: '/child',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({name: 'Charles'});
        });

        it('should `move` a child of type object to root (on a json document of type array)', () => {
          const obj: any = {
            child: [{name: 'Charles'}],
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'move',
                from: '/child/0',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({name: 'Charles'});
        });

        it('should `move` a child of type array to root (on a json document of type object)', () => {
          const obj: any = {
            child: [{name: 'Charles'}],
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'move',
                from: '/child',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([{name: 'Charles'}]);
        });
      });

      describe('copy', () => {
        it('should `copy` a child of type object to root (on a json document of type object) - and return', () => {
          const obj: any = {
            child: {name: 'Charles'},
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'copy',
                from: '/child',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({name: 'Charles'});
        });

        it('should `copy` a child of type object to root (on a json document of type array) - and return', () => {
          const obj: any = {
            child: [{name: 'Charles'}],
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'copy',
                from: '/child/0',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual({name: 'Charles'});
        });

        it('should `copy` a child of type array to root (on a json document of type object) - and return', () => {
          const obj: any = {
            child: [{name: 'Charles'}],
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'copy',
                from: '/child',
                path: '',
              },
            ],
            {mutate: true},
          ).doc;
          expect(newObj).toEqual([{name: 'Charles'}]);
        });
      });
    });

    describe('using applyPatch', () => {
      it("shouldn't touch original tree", () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        const _newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: false},
        ).doc;

        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        });
      });

      it('should apply add', () => {
        let obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        let newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: [1, 2, 3, 4],
        });
        newObj = applyPatch(
          newObj,
          [
            {
              op: 'add',
              path: '/baz/0/foo',
              value: 'world',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
              foo: 'world',
            },
          ],
          bar: [1, 2, 3, 4],
        });

        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: true,
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: true,
        });

        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: false,
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: false,
        });

        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: null,
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: null,
        });
      });

      it('should apply add on root', () => {
        const obj: any = {
          hello: 'world',
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '',
              value: {
                hello: 'universe',
              },
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          hello: 'universe',
        });
      });

      it('should apply remove', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: [1, 2, 3, 4],
        };

        let newObj = applyPatch(
          obj,
          [
            {
              op: 'remove',
              path: '/bar',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        });
        newObj = applyPatch(
          newObj,
          [
            {
              op: 'remove',
              path: '/baz/0/qux',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: 1,
          baz: [{}],
        });
      });

      it('should apply replace', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        let newObj = applyPatch(
          obj,
          [
            {
              op: 'replace',
              path: '/foo',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: [1, 2, 3, 4],
          baz: [
            {
              qux: 'hello',
            },
          ],
        });
        newObj = applyPatch(
          newObj,
          [
            {
              op: 'replace',
              path: '/baz/0/qux',
              value: 'world',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          foo: [1, 2, 3, 4],
          baz: [
            {
              qux: 'world',
            },
          ],
        });
      });

      it('should apply replace on root', () => {
        const obj: any = {
          hello: 'world',
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'replace',
              path: '',
              value: {
                hello: 'universe',
              },
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          hello: 'universe',
        });
      });

      it('should apply test', () => {
        const obj: any = {
          foo: {
            bar: [1, 2, 5, 4],
          },
          bar: {
            a: 'a',
            b: 42,
            c: null,
            d: true,
          },
        };

        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/foo',
                value: {
                  bar: [1, 2, 5, 4],
                },
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);

        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/foo',
                value: 1,
              },
            ],
            {mutate: true},
          ),
        ).toThrow();

        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar',
                value: {
                  d: true,
                  b: 42,
                  c: null,
                  a: 'a',
                },
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar',
                value: obj.bar,
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/a',
                value: 'a',
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/b',
                value: 42,
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/c',
                value: null,
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/d',
                value: true,
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/d',
                value: false,
              },
            ],
            {mutate: true},
          ),
        ).toThrow();
        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar',
                value: {
                  d: true,
                  b: 42,
                  c: null,
                  a: 'a',
                  foo: 'bar',
                },
              },
            ],
            {mutate: true},
          ),
        ).toThrow();
      });

      it('should apply test on root', () => {
        const obj: any = {
          hello: 'world',
        };
        expect(
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '',
                value: {
                  hello: 'world',
                },
              },
            ],
            {mutate: true},
          ).doc,
        ).toEqual(obj);
        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '',
                value: 1,
              },
            ],
            {mutate: true},
          ),
        ).toThrow();
      });

      it('should apply move', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };

        let newObj = applyPatch(
          obj,
          [
            {
              op: 'move',
              from: '/foo',
              path: '/bar',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: 1,
        });

        newObj = applyPatch(
          newObj,
          [
            {
              op: 'move',
              from: '/baz/0/qux',
              path: '/baz/1',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          baz: [{}, 'hello'],
          bar: 1,
        });
      });

      it('should apply move on root', () => {
        // investigate if this test is right (https://github.com/Starcounter-Jack/JSON-Patch/issues/40)
        const obj: any = {
          hello: 'world',
          location: {
            city: 'Vancouver',
          },
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'move',
              from: '/location',
              path: '',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          city: 'Vancouver',
        });
      });

      it('should apply copy', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };

        let newObj = applyPatch(
          obj,
          [
            {
              op: 'copy',
              from: '/foo',
              path: '/bar',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: 1,
        });

        newObj = applyPatch(
          newObj,
          [
            {
              op: 'copy',
              from: '/baz/0/qux',
              path: '/baz/1',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
            'hello',
          ],
          bar: 1,
        });
      });

      it('should apply copy on root', () => {
        const obj: any = {
          hello: 'world',
          location: {
            city: 'Vancouver',
          },
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'copy',
              from: '/location',
              path: '',
            },
          ],
          {mutate: true},
        ).doc;
        expect(newObj).toEqual({
          city: 'Vancouver',
        });
      });
    });

    describe('core', () => {
      it("shouldn't touch original tree", () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        const _newObj = applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: false},
        ).doc;

        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        });
      });

      it('example from benchmark', () => {
        const patch: Operation[] = [
          {op: 'add', path: '/foo/baz', value: 666},
          {op: 'add', path: '/foo/bx', value: 666},
          {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
        ];
        const obj: any = {foo: {bar: 123}};
        const newObj = applyPatch(obj, patch, {mutate: true}).doc;
        expect(newObj).toEqual({
          foo: {bar: 123, baz: 666, bx: 666},
          asdf: 'asdfadf asdf',
        });
      });

      it('should apply add', () => {
        let obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: [1, 2, 3, 4],
        });

        applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/baz/0/foo',
              value: 'world',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
              foo: 'world',
            },
          ],
          bar: [1, 2, 3, 4],
        });
        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: true,
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: true,
        });

        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: false,
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: false,
        });

        obj = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };
        applyPatch(
          obj,
          [
            {
              op: 'add',
              path: '/bar',
              value: null,
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: null,
        });
      });

      if (!dontTestResultHistory) {
        it('should apply add on root', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObj = applyPatch(
            obj,
            [
              {
                op: 'add',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).res[0].doc;

          expect(newObj).toEqual({
            hello: 'universe',
          });
        });
      }

      it('should apply remove', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: [1, 2, 3, 4],
        };
        // jsonpatch.listenTo(obj,[]);

        applyPatch(
          obj,
          [
            {
              op: 'remove',
              path: '/bar',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        });

        applyPatch(
          obj,
          [
            {
              op: 'remove',
              path: '/baz/0/qux',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [{}],
        });
      });

      it('should apply replace', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };

        applyPatch(
          obj,
          [
            {
              op: 'replace',
              path: '/foo',
              value: [1, 2, 3, 4],
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: [1, 2, 3, 4],
          baz: [
            {
              qux: 'hello',
            },
          ],
        });

        applyPatch(
          obj,
          [
            {
              op: 'replace',
              path: '/baz/0/qux',
              value: 'world',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: [1, 2, 3, 4],
          baz: [
            {
              qux: 'world',
            },
          ],
        });
      });

      if (!dontTestResultHistory) {
        it('should apply replace on root', () => {
          const obj: any = {
            hello: 'world',
          };
          const newObject = applyPatch(
            obj,
            [
              {
                op: 'replace',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ).res[0].doc;

          expect(newObject).toEqual({
            hello: 'universe',
          });
        });
      }

      it('should apply test', () => {
        const obj: any = {
          foo: {
            bar: [1, 2, 5, 4],
          },
          bar: {
            a: 'a',
            b: 42,
            c: null,
            d: true,
          },
        };
        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/foo',
              value: {
                bar: [1, 2, 5, 4],
              },
            },
          ],
          {mutate: true},
        );

        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/foo',
                value: [1, 2],
              },
            ],
            {mutate: true},
          ),
        ).toThrow();

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar',
              value: {
                d: true,
                b: 42,
                c: null,
                a: 'a',
              },
            },
          ],
          {mutate: true},
        );

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar',
              value: obj.bar,
            },
          ],
          {mutate: true},
        );

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar/a',
              value: 'a',
            },
          ],
          {mutate: true},
        );

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar/b',
              value: 42,
            },
          ],
          {mutate: true},
        );

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar/c',
              value: null,
            },
          ],
          {mutate: true},
        );

        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '/bar/d',
              value: true,
            },
          ],
          {mutate: true},
        );

        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar/d',
                value: false,
              },
            ],
            {mutate: true},
          ),
        ).toThrow();

        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '/bar',
                value: {
                  d: true,
                  b: 42,
                  c: null,
                  a: 'a',
                  foo: 'bar',
                },
              },
            ],
            {mutate: true},
          ),
        ).toThrow();
      });

      it('should apply test on root', () => {
        const obj: any = {
          hello: 'world',
        };
        applyPatch(
          obj,
          [
            {
              op: 'test',
              path: '',
              value: {
                hello: 'world',
              },
            },
          ],
          {mutate: true},
        );
        expect(() =>
          applyPatch(
            obj,
            [
              {
                op: 'test',
                path: '',
                value: {
                  hello: 'universe',
                },
              },
            ],
            {mutate: true},
          ),
        ).toThrow();
      });

      it('should apply move', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };

        applyPatch(
          obj,
          [
            {
              op: 'move',
              from: '/foo',
              path: '/bar',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: 1,
        });

        applyPatch(
          obj,
          [
            {
              op: 'move',
              from: '/baz/0/qux',
              path: '/baz/1',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          baz: [{}, 'hello'],
          bar: 1,
        });
      });

      it('should apply move on root', () => {
        const obj: any = {
          hello: 'world',
          location: {
            city: 'Vancouver',
          },
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'move',
              from: '/location',
              path: '',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          city: 'Vancouver',
        });
      });

      it('should apply copy', () => {
        const obj: any = {
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
        };

        applyPatch(
          obj,
          [
            {
              op: 'copy',
              from: '/foo',
              path: '/bar',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
          ],
          bar: 1,
        });

        applyPatch(
          obj,
          [
            {
              op: 'copy',
              from: '/baz/0/qux',
              path: '/baz/1',
            },
          ],
          {mutate: true},
        );
        expect(obj).toEqual({
          foo: 1,
          baz: [
            {
              qux: 'hello',
            },
            'hello',
          ],
          bar: 1,
        });
      });

      it('should apply copy on root', () => {
        const obj: any = {
          hello: 'world',
          location: {
            city: 'Vancouver',
          },
        };
        const newObj = applyPatch(
          obj,
          [
            {
              op: 'copy',
              from: '/location',
              path: '',
            },
          ],
          {mutate: true},
        ).doc;

        expect(newObj).toEqual({
          city: 'Vancouver',
        });
      });

      it('should apply copy, without leaving cross-reference between nodes', () => {
        const obj: any = {};
        const patchset: any = [
          {op: 'add', path: '/foo', value: []},
          {op: 'add', path: '/foo/-', value: 1},
          {op: 'copy', from: '/foo', path: '/bar'},
          {op: 'add', path: '/bar/-', value: 2},
        ];

        applyPatch(obj, patchset, {mutate: true});

        expect(obj).toEqual({
          foo: [1],
          bar: [1, 2],
        });
      });

      it('should not use value object as a reference', () => {
        const obj1: any = {};
        const patch: any = [{op: 'add', path: '/foo', value: []}];

        applyPatch(obj1, patch, {mutate: true});

        expect(obj1.foo).not.toBe(patch[0].value);
      });

      if (!dontTestResultHistory) {
        describe('returning removed elements >', () => {
          let obj: any;
          beforeEach(() => {
            obj = {
              name: 'jack',
              languages: ['c#', 'haskell', 'python'],
              hobby: 'music',
            };
          });

          it('return removed element when removing from object', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'remove',
                  path: '/name',
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual('jack');
          });

          it('return removed element when replacing in object', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'replace',
                  path: '/name',
                  value: 'john',
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual('jack');
          });

          it('return removed element when removing from array', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'remove',
                  path: '/languages/1',
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual('haskell');
          });

          it('return removed element when replacing in array', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'replace',
                  path: '/languages/1',
                  value: 'erlang',
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual('haskell');
          });

          it('return root when removing root', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'remove',
                  path: '',
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual({
              name: 'jack',
              languages: ['c#', 'haskell', 'python'],
              hobby: 'music',
            });
          });

          it('return root when replacing root', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'replace',
                  path: '',
                  value: {
                    newRoot: 'yes',
                  },
                },
              ],
              {mutate: false},
            ).res;
            expect(result[0].old).toEqual({
              name: 'jack',
              languages: ['c#', 'haskell', 'python'],
              hobby: 'music',
            });
          });

          it('return root when moving to root', () => {
            const result = applyPatch(
              obj,
              [
                {
                  op: 'move',
                  from: '/languages',
                  path: '',
                },
              ],
              {mutate: false},
            ).res;

            expect(result[0].old).toEqual({
              name: 'jack',
              hobby: 'music',
            });
          });
        });
      }
    });

    it('should not allow __proto__ modifications', () => {
      function SomeClass(this: any) {
        this.foo = 'bar';
      }

      const doc = new (SomeClass as any)();
      const otherDoc = new (SomeClass as any)();

      const patch: any = [{op: 'replace', path: '/__proto__/x', value: 'polluted'}];

      expect(() => applyPatch(doc, patch, {mutate: true})).toThrow();

      expect(otherDoc.x).toEqual(undefined);
      expect(doc.x).toEqual(undefined);

      const arr: any = [];
      expect(() => applyPatch(arr, patch, {mutate: true})).toThrow();
      expect(arr.x).toEqual(undefined);
    });
  });
};
