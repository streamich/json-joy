# JSON Patch CLI tests

The `json-patch-test` CLI executable is designed to test [`json-patch` CLI
executable](./json-patch.md). Useful for testing `json-joy` JSON Patch
implementations in different programming languages.

It expects a single argument, which is a path to [`json-patch` executable](./json-patch.md). It
will run a test suite through that executable.

## Usage

```
json-patch-test <path_to_json_patch_cli>
```

## Example

```
json-patch-test json-patch
```

Sample output:

```
JSON Patch spec

✅ 4.1. Add with missing object
✅ A.1. Adding an object member
✅ A.2. Adding an array element
✅ A.3. Removing an object member
✅ A.4. Removing an array element
✅ A.5. Replacing a value
✅ A.6. Moving a value
✅ A.7. Moving an array element
✅ A.8. Testing a value: success
✅ A.9. Testing a value: error
✅ A.10. Adding a nested member object
✅ A.11. Ignoring unrecognized elements
✅ A.12. Adding to a non-existent target
✅ A.14. Escape ordering
✅ A.15. Comparing strings and numbers
✅ A.16. Adding an array value

JSON Patch smoke tests

✅ Empty dock, empty patch
✅ Empty patch
✅ Rearrange object keys
✅ Rearrange object keys in array
✅ Rearrange object keys in object
✅ Add replaces any existing field
✅ Top level array
✅ Top level array, no change
✅ Top level object, numeric string
✅ Top level object, integer
✅ Add, / target
✅ Add composite value at top level
✅ Add into composite value
✅ Array location out of bounds, inside object
✅ Array location negative, inside object
✅ Add object key equal to "true", first level object
✅ Add object key equal to "false", first level object
✅ Add object key equal to "null", first level object
✅ 0 can be an array index or object element name
✅ First level array, insert at second position in array with one element
✅ First level array, insert at second position in the middle of two element array
✅ First level array, insert at first position in array with two elements
✅ First level array, insert at third position in array with two element
✅ Test against implementation-specific numeric parsing
✅ Test with bad number should fail
✅ First level array, inserting using string index
✅ First level object, remove key containing array
✅ Value in array add not flattened
✅ Remove string key from object, three levels deep, in array and object
✅ Insert array into object at first level.
✅ Replace object key at three levels deep
✅ First level array with one element, replace that element with string
✅ First level array with one element, replace that element with 0
✅ First level array with one element, replace that element with true
✅ First level array with one element, replace that element with false
✅ First level array with one element, replace that element with null
✅ Value in array replace not flattened
✅ Replace whole document
✅ Allow spurious patch properties
✅ null value should be valid obj property
✅ null value should be valid obj property to be replaced with something truthy
✅ null value should be valid obj property to be moved
✅ null value should be valid obj property to be copied
✅ null value should be valid obj property to be removed
✅ null value should still be valid obj property replace other value
✅ Test should pass despite rearrangement
✅ Test should pass despite (nested) rearrangement
✅ Test should pass - no error
✅ Test operation shoul not match object for array
✅ Empty-string element
✅ JSON Pointer spec tests
✅ Move to same location has no effect
✅ Insert key into first level object
✅ Insert key into third level object
✅ Insert element into array at second level into first position
✅ Replacing the root of the document is possible with add
✅ Adding to "/-" adds to the end of the array
✅ Adding to "/-" adds to the end of the array, even n levels down
✅ Test remove with bad number should fail
✅ Test remove on array
✅ Repeated removes
✅ Remove with bad index should fail
✅ Replace with bad number should fail
✅ Test copy with bad number should fail
✅ Test move with bad number should fail
✅ Test add with bad number should fail
✅ Missing 'value' parameter to test
✅ Missing value parameter to test - where undef is falsy
✅ Missing from parameter to copy
✅ Unrecognized op should fail

JSON Patch "add" operation

✅ Can set root document
✅ Can set empty object key to string
✅ Can set empty object key to object
✅ Can update existing key
✅ Can insert into first level empty array using index "0"
✅ Can insert into first level empty array using index "-"
✅ Throws error when inserting into empty first level array at index "1"
✅ Can insert into second level empty array using index "0"
✅ Can insert into first level empty array using index "-"
✅ Throws error when inserting into empty first level array at index "1"
✅ Can execute multiple updates in a row

JSON Patch "replace" operation

✅ Replacing non-existing object key, first level
✅ Replace root "null" by "null"
✅ Replace root "null" by "false"
✅ Replace root "null" by integer
✅ Replace root "null" by string
✅ Replace root "null" by simple object
✅ Replace root "null" by simple array
✅ Replace root "false" by "null"
✅ Replace root "false" by "false"
✅ Replace root "false" by integer
✅ Replace root "false" by string
✅ Replace root "false" by simple object
✅ Replace root "false" by simple array
✅ Replace root integer by "null"
✅ Replace root integer by "false"
✅ Replace root integer by integer
✅ Replace root integer by string
✅ Replace root integer by simple object
✅ Replace root integer by simple array
✅ Replace root string by "null"
✅ Replace root string by "false"
✅ Replace root string by integer
✅ Replace root string by string
✅ Replace root string by simple object
✅ Replace root string by simple array
✅ Replace root simple object by "null"
✅ Replace root simple object by "false"
✅ Replace root simple object by integer
✅ Replace root simple object by string
✅ Replace root simple object by simple object
✅ Replace root simple object by simple array
✅ Replace root simple array by "null"
✅ Replace root simple array by "false"
✅ Replace root simple array by integer
✅ Replace root simple array by string
✅ Replace root simple array by simple object
✅ Replace root simple array by simple array
✅ Replace first level object "null" by "null"
✅ Replace first level object "null" by "false"
✅ Replace first level object "null" by integer
✅ Replace first level object "null" by string
✅ Replace first level object "null" by simple object
✅ Replace first level object "null" by simple array
✅ Replace first level object "false" by "null"
✅ Replace first level object "false" by "false"
✅ Replace first level object "false" by integer
✅ Replace first level object "false" by string
✅ Replace first level object "false" by simple object
✅ Replace first level object "false" by simple array
✅ Replace first level object integer by "null"
✅ Replace first level object integer by "false"
✅ Replace first level object integer by integer
✅ Replace first level object integer by string
✅ Replace first level object integer by simple object
✅ Replace first level object integer by simple array
✅ Replace first level object string by "null"
✅ Replace first level object string by "false"
✅ Replace first level object string by integer
✅ Replace first level object string by string
✅ Replace first level object string by simple object
✅ Replace first level object string by simple array
✅ Replace first level object simple object by "null"
✅ Replace first level object simple object by "false"
✅ Replace first level object simple object by integer
✅ Replace first level object simple object by string
✅ Replace first level object simple object by simple object
✅ Replace first level object simple object by simple array
✅ Replace first level object simple array by "null"
✅ Replace first level object simple array by "false"
✅ Replace first level object simple array by integer
✅ Replace first level object simple array by string
✅ Replace first level object simple array by simple object
✅ Replace first level object simple array by simple array
✅ Replace first level object "null" by "null"
✅ Replace first level object "null" by "false"
✅ Replace first level object "null" by integer
✅ Replace first level object "null" by string
✅ Replace first level object "null" by simple object
✅ Replace first level object "null" by simple array
✅ Replace first level object "false" by "null"
✅ Replace first level object "false" by "false"
✅ Replace first level object "false" by integer
✅ Replace first level object "false" by string
✅ Replace first level object "false" by simple object
✅ Replace first level object "false" by simple array
✅ Replace first level object integer by "null"
✅ Replace first level object integer by "false"
✅ Replace first level object integer by integer
✅ Replace first level object integer by string
✅ Replace first level object integer by simple object
✅ Replace first level object integer by simple array
✅ Replace first level object string by "null"
✅ Replace first level object string by "false"
✅ Replace first level object string by integer
✅ Replace first level object string by string
✅ Replace first level object string by simple object
✅ Replace first level object string by simple array
✅ Replace first level object simple object by "null"
✅ Replace first level object simple object by "false"
✅ Replace first level object simple object by integer
✅ Replace first level object simple object by string
✅ Replace first level object simple object by simple object
✅ Replace first level object simple object by simple array
✅ Replace first level object simple array by "null"
✅ Replace first level object simple array by "false"
✅ Replace first level object simple array by integer
✅ Replace first level object simple array by string
✅ Replace first level object simple array by simple object
✅ Replace first level object simple array by simple array
✅ Replace first level array "null" by "null", in the middle of array
✅ Replace first level array "null" by "false", in the middle of array
✅ Replace first level array "null" by integer, in the middle of array
✅ Replace first level array "null" by string, in the middle of array
✅ Replace first level array "null" by simple object, in the middle of array
✅ Replace first level array "null" by simple array, in the middle of array
✅ Replace first level array "false" by "null", in the middle of array
✅ Replace first level array "false" by "false", in the middle of array
✅ Replace first level array "false" by integer, in the middle of array
✅ Replace first level array "false" by string, in the middle of array
✅ Replace first level array "false" by simple object, in the middle of array
✅ Replace first level array "false" by simple array, in the middle of array
✅ Replace first level array integer by "null", in the middle of array
✅ Replace first level array integer by "false", in the middle of array
✅ Replace first level array integer by integer, in the middle of array
✅ Replace first level array integer by string, in the middle of array
✅ Replace first level array integer by simple object, in the middle of array
✅ Replace first level array integer by simple array, in the middle of array
✅ Replace first level array string by "null", in the middle of array
✅ Replace first level array string by "false", in the middle of array
✅ Replace first level array string by integer, in the middle of array
✅ Replace first level array string by string, in the middle of array
✅ Replace first level array string by simple object, in the middle of array
✅ Replace first level array string by simple array, in the middle of array
✅ Replace first level array simple object by "null", in the middle of array
✅ Replace first level array simple object by "false", in the middle of array
✅ Replace first level array simple object by integer, in the middle of array
✅ Replace first level array simple object by string, in the middle of array
✅ Replace first level array simple object by simple object, in the middle of array
✅ Replace first level array simple object by simple array, in the middle of array
✅ Replace first level array simple array by "null", in the middle of array
✅ Replace first level array simple array by "false", in the middle of array
✅ Replace first level array simple array by integer, in the middle of array
✅ Replace first level array simple array by string, in the middle of array
✅ Replace first level array simple array by simple object, in the middle of array
✅ Replace first level array simple array by simple array, in the middle of array
✅ Replace deeply nested array "null" by "null", at the first position
✅ Replace deeply nested array "null" by "false", at the first position
✅ Replace deeply nested array "null" by integer, at the first position
✅ Replace deeply nested array "null" by string, at the first position
✅ Replace deeply nested array "null" by simple object, at the first position
✅ Replace deeply nested array "null" by simple array, at the first position
✅ Replace deeply nested array "false" by "null", at the first position
✅ Replace deeply nested array "false" by "false", at the first position
✅ Replace deeply nested array "false" by integer, at the first position
✅ Replace deeply nested array "false" by string, at the first position
✅ Replace deeply nested array "false" by simple object, at the first position
✅ Replace deeply nested array "false" by simple array, at the first position
✅ Replace deeply nested array integer by "null", at the first position
✅ Replace deeply nested array integer by "false", at the first position
✅ Replace deeply nested array integer by integer, at the first position
✅ Replace deeply nested array integer by string, at the first position
✅ Replace deeply nested array integer by simple object, at the first position
✅ Replace deeply nested array integer by simple array, at the first position
✅ Replace deeply nested array string by "null", at the first position
✅ Replace deeply nested array string by "false", at the first position
✅ Replace deeply nested array string by integer, at the first position
✅ Replace deeply nested array string by string, at the first position
✅ Replace deeply nested array string by simple object, at the first position
✅ Replace deeply nested array string by simple array, at the first position
✅ Replace deeply nested array simple object by "null", at the first position
✅ Replace deeply nested array simple object by "false", at the first position
✅ Replace deeply nested array simple object by integer, at the first position
✅ Replace deeply nested array simple object by string, at the first position
✅ Replace deeply nested array simple object by simple object, at the first position
✅ Replace deeply nested array simple object by simple array, at the first position
✅ Replace deeply nested array simple array by "null", at the first position
✅ Replace deeply nested array simple array by "false", at the first position
✅ Replace deeply nested array simple array by integer, at the first position
✅ Replace deeply nested array simple array by string, at the first position
✅ Replace deeply nested array simple array by simple object, at the first position
✅ Replace deeply nested array simple array by simple array, at the first position

JSON Patch "remove" operation

✅ Can remove object at root
✅ Can remove array at root
✅ Can remove string at root
✅ Can remove first level object key
✅ Can remove second level object key
✅ Can remove array element at third level
✅ Can remove array element in first position
✅ Can remove array element in second position
✅ Can remove array element in third position
✅ Can remove array element in fourth position
✅ Can remove array element in fifth position
✅ Throws error when removing array element out of bounds
✅ Throws error when removing array element at negative index "-2"
✅ Throws error when removing array element at string index "str"

JSON Patch "move" operation

✅ Can copy value to key of the same object
✅ Can overwrite object key of the same object
✅ Can copy value from parent object to child array
✅ Can copy value from child object to adjacent child array
✅ Can copy value from deep object to adjacent child array
✅ Can copy value from array into object
✅ Can copy values between two arrays
✅ Can copy value and return it back

JSON Patch "copy" operation

✅ Can move values between keys of the same object
✅ Can overwrite object key of the same object
✅ Can move value from parent object to child array
✅ Can move value from child object to adjacent child array
✅ Can move value from deep object to adjacent child array
✅ Can move value from array into object
✅ Can move values between two arrays
✅ Can move value and return it back

JSON Patch "test" operation

✅ Correctly tests root primitive
✅ Correctly tests root complex object
✅ Correctly tests first level array
✅ Throws error on invalid deep comparison
✅ Throws error on invalid primitive comparison

JSON Patch Extended "str_ins" operation

✅ Can add text to empty string at root
✅ Can add text to empty string in object on first level
✅ Returns error if target is not a string - 1
✅ Returns error if target is not a string - 2
✅ Returns error if target is not a string - 3
✅ Returns error if target is not a string - 4
✅ Returns error if target is not a string - 5
✅ Can add text to empty string at position greater than host string length
✅ Can insert text into a string
✅ Can insert text at the end of the string
✅ Can insert text into a string at position greater than host string length
✅ Can add text to empty string in array
✅ Can add text to empty string at position greater than host string length in array
✅ Can insert text into a string in array
✅ Can insert text at the end of the string in array
✅ Can insert text into a string at position greater than host string length in array
✅ Can create new string key and add content to it (if pos = 0 and there was nothing before)
✅ Throws if new string is create at position other than 0 (pos != 0)

JSON Patch Extended "str_del" operation

✅ At root, can remove characters
✅ At root, can remove characters by value
✅ At root, length can be arbitrary long
✅ At root, pos=1 leaves only first character
✅ In object, can remove last character
✅ In object, can remove middle character
✅ In object, can remove middle character by value
✅ In object, can remove first character
✅ In array, can remove last character
✅ In array, can remove middle character
✅ In array, can remove first character

JSON Patch Extended "flip" operation

✅ Casts values and them flips them
✅ At root, flips true to false
✅ At root, flips false to true
✅ At root, flips truthy number to false
✅ At root, flips zero to true
✅ In object, flips true to false
✅ In object, flips false to true
✅ In array, flips true to false and back

JSON Patch Extended "inc" operation

✅ Casts values and them increments them
✅ Can use arbitrary increment value, and can decrement
✅ Increment can be a floating point number
✅ At root, increments from 0 to 5
✅ At root, increments from -0 to 5
✅ In object, increments from 0 to 5
✅ In object, casts string to number
✅ In object, can increment twice
✅ In array, increments from 0 to -3

JSON Patch for Slate.js "split" operation

✅ Slate.js, split a single "ab" paragraphs into two
✅ Slate.js, split two element blocks into one
✅ Slate.js, can split paragraph in two and insert a character
✅ At root, string, can split string in two
✅ At root, string, can split string in two at pos=1
✅ At root, string, can split string in two from beginning
✅ At root, string, can split string in two from end
✅ At root, string, can split string in two when pos is greater than string length
✅ At root, string, takes characters from end if pos is negative
✅ At root, string, takes characters from end if pos is negative - 2
✅ At root, string, when negative pos overflows, first element is empty
✅ At root, SlateTextNode, splits simple SlateTextNode
✅ At root, SlateTextNode, preserves text node attributes
✅ At root, SlateTextNode, can add custom attributes
✅ At root, SlateTextNode, custom attributes can overwrite node attributes
✅ At root, SlateElementNode, splits simple node
✅ At root, SlateElementNode, can provide custom attributes
✅ At root, SlateElementNode, carries over node attributes
✅ At root, SlateElementNode, can overwrite node attributes
✅ In object, can split string in two
✅ In object, if attribute are specified, wraps strings into nodes
✅ In object, splits SlateTextNode
✅ In object, crates a tuple if target is a boolean value
✅ In object, divides number into two haves if target is a number
✅ In array, splits SlateElementNode into two
✅ In array, adds custom props and preserves node props

JSON Patch for Slate.js "merge" operation

✅ Can merge two nodes in an array
✅ Cannot target first array element when merging
✅ Can merge slate element nodes
✅ Cannot merge root
✅ Cannot merge object element
✅ Can merge two Slate.js paragraphs

JSON Patch for Slate.js "extend" operation

✅ At root, can extend an object
✅ In array, can extend an object
✅ In array, can set null
✅ In array, can use null to delete a key
✅ In object, can extend an object
✅ In object, can set null
✅ In object, can use null to delete a key

JSON Predicate "contains" operation

✅ At root, succeeds when matches correctly a substring
✅ At root, succeeds when matches start of the string
✅ At root, throws when matches substring incorrectly
✅ In object, succeeds when matches correctly a substring
✅ In object, throws when matches substring incorrectly
✅ In array, succeeds when matches correctly a substring
✅ In array, throws when matches substring incorrectly

JSON Predicate "defined" operation

✅ At root, succeeds when target exists
✅ In object, succeeds when target exists
✅ In object, throws when target does not exist
✅ In object, throws when path to target does not exist
✅ In array, succeeds when target exists
✅ In array, throws when target does not exist

JSON Predicate "ends" operation

✅ At root, succeeds when matches correctly a substring
✅ At root, can ignore case
✅ At root, can ignore case - 2
✅ At root, throws when case does not match
✅ In object, succeeds when matches correctly a substring
✅ In object, throws when matches substring incorrectly
✅ In array, succeeds when matches correctly a substring
✅ In array, throws when matches substring incorrectly

JSON Predicate "in" operation

✅ At root, should find object
✅ At root, returns error when object list not match
✅ At root, returns error when object list not match - 2

JSON Predicate "less" operation

✅ At root, succeeds when value is lower than requested
✅ At root, fails when value is not lower than requested
✅ At root, fails when value is not lower than requested - 2

JSON Predicate "more" operation

✅ At root, succeeds when value is higher than requested
✅ At root, fails when value is not higher than requested
✅ At root, fails when value is not higher than requested - 2

JSON Predicate "starts" operation

✅ At root, succeeds when matches correctly a substring
✅ At root, can ignore case
✅ At root, can ignore case - 2
✅ At root, throws when case does not match
✅ At root, throws when matches substring incorrectly
✅ In object, succeeds when matches correctly a substring
✅ In object, throws when matches substring incorrectly
✅ In array, succeeds when matches correctly a substring
✅ In array, throws when matches substring incorrectly

JSON Predicate "type" operation

✅ Succeeds when target has correct type
✅ Fails when type does not match

JSON Predicate "undefined" operation

✅ At root, fails when target exists
✅ At root, fails when target exists
✅ In object, fails when target exists
✅ In object, succeeds when target does not exist
✅ In object, succeeds when target does not exist on multiple levels
✅ In array, fails when target exists
✅ In array, succeeds when target does not exist

Successful = 446, Failed = 0, Total = 446

Done in 22.51s.
```
