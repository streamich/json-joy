import {wordWrap} from '../wordWrap';

test('does not format a short line', () => {
  expect(wordWrap('Hello')).toStrictEqual(['Hello']);
});

const text =
  'Acclaimed Harvard professor and entrepreneur Dr. David Sinclair believes that we will see human life expectancy increase to at least 100 years within this century. A world in which humans live significantly longer will have a major impact on economies, policies, healthcare, education, ethics, and more. Sinclair joined  Bridgewater Portfolio Strategist Atul Lele to discuss the science and societal, political, systemic and ethical implications of humans living significantly longer lives.';

test('wraps long text', () => {
  const result = wordWrap(text);
  expect(result).toMatchInlineSnapshot(`
    [
      "Acclaimed Harvard professor and entrepreneur Dr. ",
      "David Sinclair believes that we will see human ",
      "life expectancy increase to at least 100 years ",
      "within this century. A world in which humans live ",
      "significantly longer will have a major impact on ",
      "economies, policies, healthcare, education, ",
      "ethics, and more. Sinclair joined  Bridgewater ",
      "Portfolio Strategist Atul Lele to discuss the ",
      "science and societal, political, systemic and ",
      "ethical implications of humans living ",
      "significantly longer lives.",
    ]
  `);
});

test('can specify line width', () => {
  const result = wordWrap(text, {width: 80});
  expect(result).toMatchInlineSnapshot(`
    [
      "Acclaimed Harvard professor and entrepreneur Dr. David Sinclair believes that we ",
      "will see human life expectancy increase to at least 100 years within this ",
      "century. A world in which humans live significantly longer will have a major ",
      "impact on economies, policies, healthcare, education, ethics, and more. Sinclair ",
      "joined  Bridgewater Portfolio Strategist Atul Lele to discuss the science and ",
      "societal, political, systemic and ethical implications of humans living ",
      "significantly longer lives.",
    ]
  `);
});
