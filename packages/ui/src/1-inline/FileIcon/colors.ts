/** All recognized extension labels. */
export type FileIconExtension =
  | 'astro'
  | 'bash'
  | 'c'
  | 'cfg'
  | 'cjs'
  | 'conf'
  | 'cpp'
  | 'c++'
  | 'c#'
  | 'cs'
  | 'css'
  | 'csv'
  | 'dockerfile'
  | 'env'
  | 'fish'
  | 'gif'
  | 'go'
  | 'gql'
  | 'graphql'
  | 'gz'
  | 'htm'
  | 'html'
  | 'ico'
  | 'ini'
  | 'java'
  | 'jpeg'
  | 'jpg'
  | 'js'
  | 'json'
  | 'json5'
  | 'jsonc'
  | 'jsx'
  | 'kt'
  | 'less'
  | 'lock'
  | 'makefile'
  | 'md'
  | 'mdx'
  | 'mjs'
  | 'mov'
  | 'mp3'
  | 'mp4'
  | 'ogg'
  | 'pdf'
  | 'php'
  | 'png'
  | 'ps1'
  | 'py'
  | 'rb'
  | 'rs'
  | 'sass'
  | 'scss'
  | 'sh'
  | 'sql'
  | 'svelte'
  | 'svg'
  | 'swift'
  | 'tar'
  | 'toml'
  | 'ts'
  | 'tsx'
  | 'txt'
  | 'vue'
  | 'wasm'
  | 'wav'
  | 'webm'
  | 'webp'
  | 'xml'
  | 'yaml'
  | 'yml'
  | 'zip'
  | 'zsh';

const ALIASES = 'c++:cpp,c#:cs,cjs:js,mjs:js,graphql:gql';
const COLORS =
  'ts#5ac,tsx#5aa,js#cbcb41,jsx#cbcb41,mjs#cbcb41,cjs#cbcb41,' +
  'css#519aba,scss#f55385,sass#f55385,less#519aba,html#e37933,htm#e37933,' +
  'json#cbcb41,jsonc#cbcb41,json5#cbcb41,md#519aba,mdx#519aba,txt#d4d7d6,' +
  'py#519aba,rb#cc3e44,rs#6d8086,go#519aba,java#cc3e44,' +
  'kt#e37933,swift#e37933,c#519aba,cpp#519aba,cs#519aba,' +
  'php#a074c4,vue#8dc149,svelte#cc3e44,astro#a074c4,' +
  'sh#8dc149,bash#8dc149,zsh#8dc149,fish#8dc149,ps1#519aba,' +
  'yml#a074c4,yaml#a7c,toml#6d8086,env#6d8086,ini#6d8086,cfg#6d8086,conf#6d8086,' +
  'sql#f55385,graphql#f55385,gql#f55385,xml#e37933,csv#8dc149,' +
  'pdf#cc3e44,png#a074c4,jpg#a074c4,jpeg#a074c4,gif#a074c4,webp#a074c4,svg#a074c4,ico#cbcb41,' +
  'mp4#f55385,mov#f55385,webm#f55385,mp3#a074c4,wav#a074c4,ogg#a074c4,' +
  'zip#6d8086,tar#6d8086,gz#6d8086,lock#6d8086,wasm#a074c4,' +
  'dockerfile#519aba,makefile#e37933';

const ColorMap: Record<FileIconExtension, string> = {} as Record<FileIconExtension, string>;

for (const entry of COLORS.split(',')) {
  const [label, color] = entry.split('#');
  ColorMap[label as FileIconExtension] = '#' + color;
}

for (const entry of ALIASES.split(',')) {
  const [alias, target] = entry.split(':');
  ColorMap[alias as FileIconExtension] = ColorMap[target as FileIconExtension];
}

export const getColor = (label: FileIconExtension): string => ColorMap[label] || '';
