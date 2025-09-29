// Examples from RFC 9535 Table 2
export const bookstore = {
  store: {
    book: [
      {category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95},
      {category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99},
      {category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99},
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99,
      },
    ],
    bicycle: {color: 'red', price: 399},
  },
};

export const data0 = {
  store: {
    book: [
      {title: 'Harry Potter', author: 'J.K. Rowling', price: 8.95},
      {title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 12.99},
    ],
    bicycle: {
      color: 'red',
      price: 399,
    },
  },
};

export const arrayData = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

export const complexData = {
  a: [3, 5, 1, 2, 4, 6, {b: 'j'}, {b: 'k'}, {b: {}}, {b: 'kilo'}],
  o: {p: 1, q: 2, r: 3, s: 5, t: {u: 6}},
  e: 'f',
};

export const testData = {
  store: {
    book: [
      {
        category: 'reference',
        author: 'Nigel Rees',
        title: 'Sayings of the Century',
        price: 8.95,
      },
      {
        category: 'fiction',
        author: 'Evelyn Waugh',
        title: 'Sword of Honour',
        price: 12.99,
      },
      {
        category: 'fiction',
        author: 'Herman Melville',
        title: 'Moby Dick',
        isbn: '0-553-21311-3',
        price: 8.99,
      },
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99,
      },
    ],
    bicycle: {
      color: 'red',
      price: 19.95,
    },
  },
  authors: ['John', 'Jane', 'Bob'],
  info: {
    name: 'Test Store',
    location: 'City',
    contacts: {
      email: 'test@store.com',
      phone: '123-456-7890',
    },
  },
};
