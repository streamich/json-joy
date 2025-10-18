import {t} from '../../..';

test('can use convenience methods to define type schema fields', () => {
  const number = t.Number();
  expect(number.getSchema()).toEqual({kind: 'num'});
  number.title('My Number');
  expect(number.getSchema()).toEqual({kind: 'num', title: 'My Number'});
  number.intro('This is a number type');
  expect(number.getSchema()).toEqual({
    kind: 'num',
    title: 'My Number',
    intro: 'This is a number type',
  });
  number.description('A detailed description of the number type');
  expect(number.getSchema()).toEqual({
    kind: 'num',
    title: 'My Number',
    intro: 'This is a number type',
    description: 'A detailed description of the number type',
  });
  number.gt(5);
  expect(number.getSchema()).toEqual({
    kind: 'num',
    title: 'My Number',
    intro: 'This is a number type',
    description: 'A detailed description of the number type',
    gt: 5,
  });
  number.lte(10);
  expect(number.getSchema()).toEqual({
    kind: 'num',
    title: 'My Number',
    intro: 'This is a number type',
    description: 'A detailed description of the number type',
    gt: 5,
    lte: 10,
  });
  number.format('i32');
  expect(number.getSchema()).toEqual({
    kind: 'num',
    title: 'My Number',
    intro: 'This is a number type',
    description: 'A detailed description of the number type',
    gt: 5,
    lte: 10,
    format: 'i32',
  });
});
