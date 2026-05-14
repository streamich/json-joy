import {convert} from '../convert';
import {
  ukTranslit,
  bgTranslit,
  beTranslit,
  mkTranslit,
  srTranslit,
  elTranslit,
  heTranslit,
  hyTranslit,
  kaTranslit,
  eoXsystem,
  viTelex,
  arArabizi,
  ipaTranslit,
} from '../schemes';

describe('Cyrillic family — Ukrainian', () => {
  test.each([
    ['privit', 'прівіт'],
    ['Yij', 'Їй'],
    ['ye', 'є'],
    ['ghedz', 'ґедз'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, ukTranslit)).toBe(expected);
  });
});

describe('Cyrillic family — Bulgarian', () => {
  test.each([
    ['shte', 'ще'],
    ['mlyako', 'мляко'],
    ["p'ten", 'пьтен'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, bgTranslit)).toBe(expected);
  });
  test('sh alone is the digraph for ш', () => {
    expect(convert('sh', bgTranslit)).toBe('ш');
  });
});

describe('Cyrillic family — Belarusian', () => {
  test.each([
    ['ivan', 'іван'],
    ['budowa', 'будоўа'],
    ['jeshche', 'эшче'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, beTranslit)).toBe(expected);
  });
});

describe('Cyrillic family — Macedonian', () => {
  test.each([
    ['ljubov', 'љубов'],
    ['njega', 'њега'],
    ['gjorgji', 'ѓорѓи'],
    ['kjuche', 'ќуче'],
    ['dzvezda', 'ѕвезда'],
    ['djezva', 'џезва'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, mkTranslit)).toBe(expected);
  });
});

describe('Cyrillic family — Serbian', () => {
  test.each([
    ['djordje', 'ђорђе'],
    ['ljubav', 'љубав'],
    ['njega', 'њега'],
    ['cetnja', 'цетња'],
    ['dzep', 'џеп'],
    ['cetiri', 'цетири'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, srTranslit)).toBe(expected);
  });
});

describe('Greek (with final sigma)', () => {
  test.each([
    ['logos', 'λογος'],
    ['theos', 'θεος'],
    ['anthropos', 'ανθροπος'],
    ['anthrwpos', 'ανθρωπος'],
  ])('convert(%j) === %j (end-of-input final form applied)', (input, expected) => {
    expect(convert(input, elTranslit)).toBe(expected);
  });
  test('boundary final form: σ → ς before space', () => {
    expect(convert('logos kosmos', elTranslit)).toBe('λογος κοσμος');
  });
  test('mid-word σ stays medial', () => {
    expect(convert('sa', elTranslit)).toBe('σα');
  });
});

describe('Hebrew (with final letters)', () => {
  test.each([
    ['shalom', 'שלום'],
    ['malek', 'מלך'],
    ['yom', 'יום'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, heTranslit)).toBe(expected);
  });
  test('boundary final form: נ → ן before space', () => {
    expect(convert('ben ', heTranslit)).toBe('בן ');
  });
  test('non-final letter stays medial', () => {
    expect(convert('peh ', heTranslit)).toBe('פה ');
  });
});

describe('Armenian', () => {
  test.each([
    ['barev', 'բարեվ'],
    ['shnorhakal', 'շնորհակալ'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, hyTranslit)).toBe(expected);
  });
});

describe('Georgian', () => {
  test.each([
    ['gamarjoba', 'გამარჯობა'],
    ['madloba', 'მადლობა'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, kaTranslit)).toBe(expected);
  });
});

describe('Esperanto x-system', () => {
  test.each([
    ['cxu', 'ĉu'],
    ['gxojo', 'ĝojo'],
    ['scxio', 'sĉio'],
    ['saluton', 'saluton'],
    ['Cxapo', 'Ĉapo'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, eoXsystem)).toBe(expected);
  });
});

describe('Vietnamese Telex', () => {
  test.each([
    ['aa', 'â'],
    ['aas', 'ấ'],
    ['ows', 'ớ'],
    ['dd', 'đ'],
    ['as', 'á'],
    ['oof', 'ồ'],
    ['uw', 'ư'],
    ['uws', 'ứ'],
    ['vieejt', 'việt'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, viTelex)).toBe(expected);
  });
});

describe('Arabic Arabizi (digits-as-letters)', () => {
  test.each([
    ['3rb', 'عرب'],
    ['7mz', 'حمز'],
    ['mr7b', 'مرحب'],
    ['mr7baa', 'مرحبا'],
    ['6lbT', 'طلبط'],
    ['salaam', 'سلام'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, arArabizi)).toBe(expected);
  });
  test('digits work mid-word — engine treats them as letters here', () => {
    expect(convert('m3', arArabizi)).toBe('مع');
  });
  test('short vowels are silently absorbed', () => {
    expect(convert('ktb', arArabizi)).toBe('كتب');
    expect(convert('katab', arArabizi)).toBe('كتب');
  });
});

describe('IPA (basic)', () => {
  test.each([
    ['shop', 'ʃop'],
    ['thing', 'θiŋ'],
    ['chair', 'tʃair'],
    ['nation', 'nation'],
    ['ngga', 'ŋga'],
  ])('convert(%j) === %j', (input, expected) => {
    expect(convert(input, ipaTranslit)).toBe(expected);
  });
  test('uppercase vowels map to lax variants', () => {
    expect(convert('chAt', ipaTranslit)).toBe('tʃɑt');
  });
});
