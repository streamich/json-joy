import type {TranslitScheme} from '../types';

/**
 * Greek (monotonic) translit. Uses common ASCII conventions; final-sigma
 * (σ → ς) handled via `finalForms`.
 *
 *   a→α  b→β  g→γ  d→δ  e→ε  z→ζ  h→η  th→θ  i→ι  k→κ
 *   l→λ  m→μ  n→ν  x→ξ  o→ο  p→π  r→ρ  s→σ  t→τ  u→υ  y→υ
 *   f→φ  ph→φ  ch→χ  ps→ψ  w→ω
 */
export const elTranslit: TranslitScheme = {
  id: 'el-translit',
  name: 'Greek (translit)',
  short: 'EL',
  language: 'el',
  script: 'Grek',
  kind: 'alphabet',
  rules: [
    // Digraphs.
    {in: 'th', out: 'θ'},
    {in: 'ph', out: 'φ'},
    {in: 'ch', out: 'χ'},
    {in: 'ps', out: 'ψ'},

    // Single chars.
    {in: 'a', out: 'α'},
    {in: 'b', out: 'β'},
    {in: 'g', out: 'γ'},
    {in: 'd', out: 'δ'},
    {in: 'e', out: 'ε'},
    {in: 'z', out: 'ζ'},
    {in: 'h', out: 'η'},
    {in: 'i', out: 'ι'},
    {in: 'k', out: 'κ'},
    {in: 'l', out: 'λ'},
    {in: 'm', out: 'μ'},
    {in: 'n', out: 'ν'},
    {in: 'x', out: 'ξ'},
    {in: 'o', out: 'ο'},
    {in: 'p', out: 'π'},
    {in: 'r', out: 'ρ'},
    {in: 's', out: 'σ'},
    {in: 't', out: 'τ'},
    {in: 'u', out: 'υ'},
    {in: 'y', out: 'υ'},
    {in: 'f', out: 'φ'},
    {in: 'w', out: 'ω'},
  ],
  finalForms: {
    σ: 'ς',
  },
};
