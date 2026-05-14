`CustomStyle` is a **per-field optional bag** of typography +
block-layout declarations, stored in various places along a strict
per-field cascade:

1. defaults (static global default)
2. editor render config (provided through mount props)
3. document stored (persisted for whole document)
4. block type global overrides (persisted per block type, e.g. h1 blocks have a specific style)
5. block-level instance overrides (persisted per block)
6. inline style overrides (inline marks, persisted per mark)
