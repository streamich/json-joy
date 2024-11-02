## [17.9.1](https://github.com/streamich/json-joy/compare/v17.9.0...v17.9.1) (2024-11-02)


### Bug Fixes

* 🐛 correct simple linter errors ([4f85e09](https://github.com/streamich/json-joy/commit/4f85e09eb4dd1e142fa22d49ba3c3c962646c3e6))
* 🐛 fix more risky linter warnings ([c1b04f1](https://github.com/streamich/json-joy/commit/c1b04f1576e6a47f0c91acfddcae975798a330f7))

# [17.9.0](https://github.com/streamich/json-joy/compare/v17.8.1...v17.9.0) (2024-11-01)


### Features

* **json-crdt:** 🎸 improve chunk print formatting ([e57437e](https://github.com/streamich/json-joy/commit/e57437e51098e0f8b786c168462a94509bf25e0d))

## [17.8.1](https://github.com/streamich/json-joy/compare/v17.8.0...v17.8.1) (2024-10-31)


### Reverts

* Revert "chore(json-crdt-peritext-ui): 🤖 remove ui surface" ([3eba2fa](https://github.com/streamich/json-joy/commit/3eba2fa32c13bf9151bba14130385e93cff354a0))

# [17.8.0](https://github.com/streamich/json-joy/compare/v17.7.0...v17.8.0) (2024-10-31)


### Features

* **json-crdt-peritext-ui:** 🎸 add Peritext DOM event handlers to the main line ([b3554aa](https://github.com/streamich/json-joy/commit/b3554aa19291461cdfc99e896a986e72a05bcc27))

# [17.7.0](https://github.com/streamich/json-joy/compare/v17.6.0...v17.7.0) (2024-10-31)


### Features

* **json-crdt-peritext-ui:** 🎸 add main Peritext event implementations ([20a6d61](https://github.com/streamich/json-joy/commit/20a6d619e992f4ae3f3d7e98877cee46b202b22a))

# [17.6.0](https://github.com/streamich/json-joy/compare/v17.5.0...v17.6.0) (2024-10-31)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly execute cursor movement ([9022f90](https://github.com/streamich/json-joy/commit/9022f90ea95bba446223aa5d8fba65eb0a7e37bc))
* **json-crdt-extensions:** 🐛 support end attributes only at ABS end ([8219b20](https://github.com/streamich/json-joy/commit/8219b20386053e499f0e7a01408aa76677bea9a2))
* **json-crdt-extensions:** 🐛 update block hashes when a slice is inserted ([68a32d4](https://github.com/streamich/json-joy/commit/68a32d4609c2e94e2eeba6725e1dcacbf42fce5a))
* **json-crdt-extensions:** 🐛 update EOL iterators ([524ce7e](https://github.com/streamich/json-joy/commit/524ce7e55fac922ea40ab93d123ab9a8c1c6d36f))
* **json-crdt-peritext-ui:** 🐛 keep reference to inline objects from text chunks ([b1158f5](https://github.com/streamich/json-joy/commit/b1158f58f5a3414da2e45fcda2dc61438a87b8bd))
* **json-crdt-peritext-ui:** 🐛 make inline/pos detection more robust ([415ff7d](https://github.com/streamich/json-joy/commit/415ff7d1ff8cf024e0412257bb8336724d84acbb))


### Features

* **json-crdt-extensions:** 🎸 improve cursor iteration methods ([ed6bbcb](https://github.com/streamich/json-joy/commit/ed6bbcb27be055884b6b8a1d2d2960e7368171b4))
* **json-crdt-extensions:** 🎸 improve how inline key is generated ([27b6092](https://github.com/streamich/json-joy/commit/27b609266371938e5a8613b8575dbecb309dab9c))
* **json-crdt-extensions:** 🎸 support caret at ABS end ([b45afb0](https://github.com/streamich/json-joy/commit/b45afb0e9242eb660f1d975e830db53a9c48da95))
* **json-crdt-peritext-ui:** 🎸 add "select all" support ([12ca6b4](https://github.com/streamich/json-joy/commit/12ca6b4ba44a7019a8574b8d4bf1fbfafee99662))
* **json-crdt-peritext-ui:** 🎸 add a wayt to select the a full block ([fdecb88](https://github.com/streamich/json-joy/commit/fdecb88ae5a9aeeb687e30b1d7bc8bf6a13f6116))
* **json-crdt-peritext-ui:** 🎸 add ability to define custom renderers ([21b566a](https://github.com/streamich/json-joy/commit/21b566a5c3959f4718590947fa8a8cfb277d6bd7))
* **json-crdt-peritext-ui:** 🎸 add ability to delete multiple words at a time ([ab6aa5d](https://github.com/streamich/json-joy/commit/ab6aa5d1875a43c387f24e89c4921f64034cf96b))
* **json-crdt-peritext-ui:** 🎸 add ability to delete words ([a671342](https://github.com/streamich/json-joy/commit/a6713423d576b2a955d429c2278d930502b71a1d))
* **json-crdt-peritext-ui:** 🎸 add ability to select a word ([ff07038](https://github.com/streamich/json-joy/commit/ff070384f03cfb2f48963edc95b52eac68d7c228))
* **json-crdt-peritext-ui:** 🎸 add ability to slant cursor ([4bfdf06](https://github.com/streamich/json-joy/commit/4bfdf0682e34a5e797d1253a7144128e5f476a4e))
* **json-crdt-peritext-ui:** 🎸 add basic inline formatting ([fb980e9](https://github.com/streamich/json-joy/commit/fb980e91e63779158ce6b1ed6daf8d086591d4fd))
* **json-crdt-peritext-ui:** 🎸 add block and peritext custom renderers support ([a49f8ac](https://github.com/streamich/json-joy/commit/a49f8ac482834b39ebd57fb0021814eb02d8d3ec))
* **json-crdt-peritext-ui:** 🎸 add caret ticks ([891cf90](https://github.com/streamich/json-joy/commit/891cf9064f3f2b3eace99560ddff91a70b2eb47a))
* **json-crdt-peritext-ui:** 🎸 add constants for class names ([bb7b43c](https://github.com/streamich/json-joy/commit/bb7b43c1fa9f823f00bbc18cdbfff4d8e3f7db1a))
* **json-crdt-peritext-ui:** 🎸 add controller scaffolding ([3420f2d](https://github.com/streamich/json-joy/commit/3420f2d83bd063b1590ead0714b6710c31eb2854))
* **json-crdt-peritext-ui:** 🎸 add demo React UI ([13af94f](https://github.com/streamich/json-joy/commit/13af94ff1d0c94fcce792d57dbf5ae2be462ff41))
* **json-crdt-peritext-ui:** 🎸 add initial multi-cursor support ([16933d3](https://github.com/streamich/json-joy/commit/16933d375000a68b511f0a73936ff947d7ac4876))
* **json-crdt-peritext-ui:** 🎸 add renderer for inline elements ([9ad15c9](https://github.com/streamich/json-joy/commit/9ad15c91eedfb54fe05ccfb3a7f540397f68c40b))
* **json-crdt-peritext-ui:** 🎸 add support for line deletion events ([5267056](https://github.com/streamich/json-joy/commit/52670567fe4c6b2eee10083386848945ca931ae6))
* **json-crdt-peritext-ui:** 🎸 better cursor click treatment ([2899a0a](https://github.com/streamich/json-joy/commit/2899a0a256bca36ea1735432b2ddcb55a4fe521d))
* **json-crdt-peritext-ui:** 🎸 cleanup block rendering, unify components ([0aedffd](https://github.com/streamich/json-joy/commit/0aedffd19f794cf7d78a3aa5123c96b92e6c4ebf))
* **json-crdt-peritext-ui:** 🎸 create anchor renderer ([3434a3b](https://github.com/streamich/json-joy/commit/3434a3b20c089671004d4fefcf3bf74c0a5f3557))
* **json-crdt-peritext-ui:** 🎸 create PeritextDomController class ([200ed30](https://github.com/streamich/json-joy/commit/200ed30a00ce68f94b97dcd924217b22718cf45a))
* **json-crdt-peritext-ui:** 🎸 create wrappers for attribute types ([edcb531](https://github.com/streamich/json-joy/commit/edcb5311e0ce978cdb74e583f34f6c2b411650b6))
* **json-crdt-peritext-ui:** 🎸 do not process "mousemove" event on the same coordinates ([06170e8](https://github.com/streamich/json-joy/commit/06170e8f23b1f183b7ecdbec1d6825ce960b3cd8))
* **json-crdt-peritext-ui:** 🎸 do not update cursor if there is no change ([d306dff](https://github.com/streamich/json-joy/commit/d306dff87fea9087352cc3285149e8e8cacf9629))
* **json-crdt-peritext-ui:** 🎸 generalize char and word deletion ([afe00c9](https://github.com/streamich/json-joy/commit/afe00c9e9bd9e3ab11d647285c37a10be83cce53))
* **json-crdt-peritext-ui:** 🎸 improve anchor and focus views ([9402fb0](https://github.com/streamich/json-joy/commit/9402fb0c711b872ddb4e4bc5168e3ba11d8becc3))
* **json-crdt-peritext-ui:** 🎸 improve char deletion setup ([38debd4](https://github.com/streamich/json-joy/commit/38debd4e5fd56cc2ac154e1a0cb57066ef53feac))
* **json-crdt-peritext-ui:** 🎸 improve cursor movement, add editor.move() method ([0b6ce9f](https://github.com/streamich/json-joy/commit/0b6ce9f0e7eaf58acfbd2e0cff7eb659a4a6ee1d))
* **json-crdt-peritext-ui:** 🎸 improve cursor presentation ([beb6755](https://github.com/streamich/json-joy/commit/beb6755f83e774ff44dc972a9b7f3cc882727df5))
* **json-crdt-peritext-ui:** 🎸 improve display of selection anchor ([3f8ff93](https://github.com/streamich/json-joy/commit/3f8ff93745d3df4d36daf1ab23738307d27ccdc8))
* **json-crdt-peritext-ui:** 🎸 improve editor selection setup ([53c34ee](https://github.com/streamich/json-joy/commit/53c34ee607c3dbb71866a1d13e0f6bc03efba164))
* **json-crdt-peritext-ui:** 🎸 improve event types ([bdc4399](https://github.com/streamich/json-joy/commit/bdc4399bc9d32229dbd062030708df73a6947083))
* **json-crdt-peritext-ui:** 🎸 improve focus view ([63230ee](https://github.com/streamich/json-joy/commit/63230ee1e8a53b135838a6f11c4e3ca3f6dd5720))
* **json-crdt-peritext-ui:** 🎸 improve inline and cursor view ([cd44f4a](https://github.com/streamich/json-joy/commit/cd44f4a9c32875697f8b55a3111405c5ba4441de))
* **json-crdt-peritext-ui:** 🎸 improve Peritext UI setup ([004af38](https://github.com/streamich/json-joy/commit/004af388552e0d66129b71910f5ad10d2bb7c0b9))
* **json-crdt-peritext-ui:** 🎸 improve range selection methods ([3c3a16e](https://github.com/streamich/json-joy/commit/3c3a16eb2a4b720f99e12712e3fad7e17cdc771e))
* **json-crdt-peritext-ui:** 🎸 improve selection computation ([82c16f4](https://github.com/streamich/json-joy/commit/82c16f404837d1df7acfc030506cefd0ce9dd322))
* **json-crdt-peritext-ui:** 🎸 improve selection endpoint rendering ([85c0042](https://github.com/streamich/json-joy/commit/85c00420d65653755e9a86c89f58d42491f0e9fa))
* **json-crdt-peritext-ui:** 🎸 improve selection view ([7c3bdab](https://github.com/streamich/json-joy/commit/7c3bdab596b4f920fa69cb8fd30ca56bcd9abee0))
* **json-crdt-peritext-ui:** 🎸 improve single character deletions ([9d0a92c](https://github.com/streamich/json-joy/commit/9d0a92c30ea1fd12d11ea79fe54d00c6ca3da351))
* **json-crdt-peritext-ui:** 🎸 improve surface rendering setup ([8365116](https://github.com/streamich/json-joy/commit/8365116ad4c2922b425acb4d8e993d0bd3f5dd5b))
* **json-crdt-peritext-ui:** 🎸 improve view of hash ([9646c20](https://github.com/streamich/json-joy/commit/9646c205d7f7fd6c6a61a22f1210f80273828571))
* **json-crdt-peritext-ui:** 🎸 make cursor always visible initially ([93f58b2](https://github.com/streamich/json-joy/commit/93f58b2de80d076667f60402be46d8937ebe79f0))
* **json-crdt-peritext-ui:** 🎸 make debug mode rendering self-contained ([f3f5267](https://github.com/streamich/json-joy/commit/f3f52679e3cfeff12c3db6a5eb25bd39e3737f44))
* **json-crdt-peritext-ui:** 🎸 make hashes non-content editable ([1726f6b](https://github.com/streamich/json-joy/commit/1726f6b6f14cb132c8582c6e7243a8ec286732d2))
* **json-crdt-peritext-ui:** 🎸 make multi-click selection work ([7600e7b](https://github.com/streamich/json-joy/commit/7600e7b526276fe21bb2756f1221067899356583))
* **json-crdt-peritext-ui:** 🎸 make word and line events more robust ([6aa837b](https://github.com/streamich/json-joy/commit/6aa837ba95c14b1147fafb8cff733cc054fc7a90))
* **json-crdt-peritext-ui:** 🎸 move cursor rendering into inline element ([2f1d3aa](https://github.com/streamich/json-joy/commit/2f1d3aaa9cdceece1fd9cf25fc0f37e28366fc91))
* **json-crdt-peritext-ui:** 🎸 move debug overlay rendering into the debug mode ([d22373c](https://github.com/streamich/json-joy/commit/d22373ca9692d0d0bcf4408cb636d1764a6e2835))
* **json-crdt-peritext-ui:** 🎸 move font ligatures to the inline element ([e8e22f8](https://github.com/streamich/json-joy/commit/e8e22f84040c3a5567dd848b25fc98239d28180f))
* **json-crdt-peritext-ui:** 🎸 normalize cursor event shape ([3a285b9](https://github.com/streamich/json-joy/commit/3a285b9933920d4bb91eadfe6de8b0321baf1c4f))
* **json-crdt-peritext-ui:** 🎸 remove [debug] prop ([ade6f79](https://github.com/streamich/json-joy/commit/ade6f7960fbdd6b63e46356d2de873a50b799a1d))
* **json-crdt-peritext-ui:** 🎸 rename renderer components ([0ed5fa6](https://github.com/streamich/json-joy/commit/0ed5fa6005a7e9325c0df94c05cc2c3ba7b8c624))
* **json-crdt-peritext-ui:** 🎸 render different views for focus and caret ([87be5bb](https://github.com/streamich/json-joy/commit/87be5bb571aa90acc593252495535e98c05a47cf))
* **json-crdt-peritext-ui:** 🎸 render inlines in custom view layer ([8a0de80](https://github.com/streamich/json-joy/commit/8a0de80b9a2fa0e214349b73438f56d39d19519d))
* **json-crdt-peritext-ui:** 🎸 render selection anchor as a dot ([915752e](https://github.com/streamich/json-joy/commit/915752ebdf768b990f3ccdff01c76fbf4c7d8c81))
* **json-crdt-peritext-ui:** 🎸 rerender peritext on debug mode change ([2b655b3](https://github.com/streamich/json-joy/commit/2b655b353f15e9c0f357796f37d20d5cbf1b56ab))
* **json-crdt-peritext-ui:** 🎸 select text on mousedown event ([724380e](https://github.com/streamich/json-joy/commit/724380e5b8d0dbe7120b9fdb470ccf7e66dba66f))
* **json-crdt-peritext-ui:** 🎸 set blend mode on caret ([9004e47](https://github.com/streamich/json-joy/commit/9004e47517d58cb08727017ec6e9032f60cce64c))
* **json-crdt-peritext-ui:** 🎸 show selection ([8071d96](https://github.com/streamich/json-joy/commit/8071d96b2f41d48f2202aca5730397f78060911b))
* **json-crdt-peritext-ui:** 🎸 start event implementation ([73beaf7](https://github.com/streamich/json-joy/commit/73beaf79159eb3b383f61a47ad076880f46e19e5))
* **json-crdt-peritext-ui:** 🎸 stop text shifts because of kerning ([c030975](https://github.com/streamich/json-joy/commit/c030975fe6a08ffdf2e7446c9479010656f65277))
* **json-crdt-peritext-ui:** 🎸 synchronize cursor blinking ([c3d7537](https://github.com/streamich/json-joy/commit/c3d7537dc0cc9c14db9feb629a256d3146e55e41))
* **json-crdt-peritext-ui:** 🎸 track pressed keys ([916dea2](https://github.com/streamich/json-joy/commit/916dea2f2184078aacf12f8b28f68503fdbfedfa))
* **json-crdt-peritext-ui:** 🎸 update class names ([0c2e8a4](https://github.com/streamich/json-joy/commit/0c2e8a47f4b0bafcdd22d36cba01cbdbd0869727))


### Performance Improvements

* **json-crdt-peritext-ui:** ⚡️ use memoization in block view ([188e7c3](https://github.com/streamich/json-joy/commit/188e7c3444b712e662edc2e51665d64cac9e5dc8))

# [17.5.0](https://github.com/streamich/json-joy/compare/v17.4.0...v17.5.0) (2024-10-29)


### Features

* **json-crdt-extensions:** 🎸 improve .eob() end codition handling ([14a69b8](https://github.com/streamich/json-joy/commit/14a69b84dee61ab1110c0c29b327507eef1b2b7c))
* **json-crdt-extensions:** 🎸 improve edge condition handling in .bob() call ([e1973b7](https://github.com/streamich/json-joy/commit/e1973b71d0a82551b304c563bcdebf4b90274889))
* **json-crdt-extensions:** 🎸 improve Editor .move() method ([5b4bc9b](https://github.com/streamich/json-joy/commit/5b4bc9b3efc70dd51bd8d935eaf7bf14ffa9207b))
* **json-crdt-extensions:** 🎸 improve end treatment in line iterators ([bb9aabe](https://github.com/streamich/json-joy/commit/bb9aabe1f1f09bad01b7b95a3ad32e9eec1168ab))

# [17.4.0](https://github.com/streamich/json-joy/compare/v17.3.0...v17.4.0) (2024-10-28)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 correct skipping behavior ([d25bd3c](https://github.com/streamich/json-joy/commit/d25bd3cab35a6a5aa2499d307ba1c18506303f6a))


### Features

* **json-crdt-extensions:** 🎸 improve Cursor object ([149fc4f](https://github.com/streamich/json-joy/commit/149fc4f6f97d41c4d1f0cc7bbcfc12d52cfedf4a))
* **json-crdt-extensions:** 🎸 improve Editor class ([d819cb1](https://github.com/streamich/json-joy/commit/d819cb14eef59eadaf6e347c0868c6d4a321041e))
* **json-crdt-extensions:** 🎸 improve Editor cursor APIs ([df2a5e2](https://github.com/streamich/json-joy/commit/df2a5e265fce79ce91d30e9cedbf17b22221ef29))
* **json-crdt-extensions:** 🎸 introduce halfstep iteration ([da3abc3](https://github.com/streamich/json-joy/commit/da3abc35f193577159a7df9d202157857e51bf7a))
* **json-crdt-extensions:** 🎸 print the exact Point character in debug view ([b33b4da](https://github.com/streamich/json-joy/commit/b33b4da04f3fc49f23fc22830249b8b87679ebc1))
* **json-crdt-extensions:** 🎸 rename text char-by-char iteration method ([0fe582c](https://github.com/streamich/json-joy/commit/0fe582ceff4c41b5d0d3e0e5473ff79133d32dba))

# [17.3.0](https://github.com/streamich/json-joy/compare/v17.2.0...v17.3.0) (2024-10-12)


### Features

* **json-crdt-patch:** 🎸 allow combining multiple patches at once ([bb52208](https://github.com/streamich/json-joy/commit/bb522088f1ca445b673297d94a0f9e5eccf035b3))
* **json-crdt-patch:** 🎸 implement `combine()` for joining two adjacent patches ([427c7c9](https://github.com/streamich/json-joy/commit/427c7c9acf0740f4be1ae1bd0b114b4da75886cc))
* **json-crdt-patch:** 🎸 implement consecutive string insert compaction ([67feb63](https://github.com/streamich/json-joy/commit/67feb631445d623e7524e5670db1fb13e014ad81))

# [17.2.0](https://github.com/streamich/json-joy/compare/v17.1.0...v17.2.0) (2024-10-10)


### Bug Fixes

* **json-crdt-extensions:** 🐛 if position is specified, return EOS point ([a617ebb](https://github.com/streamich/json-joy/commit/a617ebbf0d5c57b9e84d5aae82717b0c51031fcb))


### Features

* **json-crdt-extensions:** 🎸 improve .fwd() and .bwd() string iterators, and implify ([3ed7057](https://github.com/streamich/json-joy/commit/3ed7057dab93e44de5603afbf11f761fa1909ed3))
* **json-crdt-extensions:** 🎸 improve point iteration ([70210ae](https://github.com/streamich/json-joy/commit/70210ae690755528a358c56354c9ac51c73f7bbc))

# [17.1.0](https://github.com/streamich/json-joy/compare/v17.0.1...v17.1.0) (2024-10-10)


### Features

* **json-crdt-extensions:** 🎸 add editor backward iteration ([0358fdd](https://github.com/streamich/json-joy/commit/0358fdd1f9d0425265279560ea90bda0df656896))
* **json-crdt-extensions:** 🎸 implement semantic forward movement in the editor ([4cff1b7](https://github.com/streamich/json-joy/commit/4cff1b7aff55a638db7195e9a04929325a9d5e4e))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ improve backward iteration end condition check ([4f8c968](https://github.com/streamich/json-joy/commit/4f8c968257d8c959625eda45003004d8fc47ae67))

## [17.0.1](https://github.com/streamich/json-joy/compare/v17.0.0...v17.0.1) (2024-10-07)


### Bug Fixes

* **json-text:** 🐛 classify null as primitive ([a0ef6e7](https://github.com/streamich/json-joy/commit/a0ef6e7a841a310d2b96533c4452caf236b7ddfa))

# [17.0.0](https://github.com/streamich/json-joy/compare/v16.27.2...v17.0.0) (2024-10-06)


### Bug Fixes

* 🐛 correct library imports ([8e12deb](https://github.com/streamich/json-joy/commit/8e12deb0bd217155e7975c7e44cb0edef9e18480))


### chore

* 🤖 remove migrated sub-libraries ([a04825a](https://github.com/streamich/json-joy/commit/a04825a073a2ac2be1f1565082e1511ae710a9b0))


### BREAKING CHANGES

* 🧨 A number of sub-libraries have been externalized

## [16.27.2](https://github.com/streamich/json-joy/compare/v16.27.1...v16.27.2) (2024-10-05)


### Bug Fixes

* 🐛 move json-expression library externally ([3d62c55](https://github.com/streamich/json-joy/commit/3d62c5598ee1272f7b751f4072a027bea175d73f))

## [16.27.1](https://github.com/streamich/json-joy/compare/v16.27.0...v16.27.1) (2024-10-05)


### Bug Fixes

* 🐛 switch to using [@jsonjoy](https://github.com/jsonjoy).com/json-pointer library ([56bb18c](https://github.com/streamich/json-joy/commit/56bb18c0523abcb4afbe7480de221a33b9c4a97b))

# [16.27.0](https://github.com/streamich/json-joy/compare/v16.26.0...v16.27.0) (2024-10-01)


### Bug Fixes

* **json-crdt:** 🐛 correctly handle deletes ([f7af05b](https://github.com/streamich/json-joy/commit/f7af05b0f5f59cb23fb58c88f9c6f542d001de84))
* **json-crdt:** 🐛 return undefined view on empty document ([14a5e42](https://github.com/streamich/json-joy/commit/14a5e42227d5e6e77799af24af47bddf1c00a483))


### Features

* **json-crdt:** 🎸 add store convenience API ([760da9c](https://github.com/streamich/json-joy/commit/760da9c3fef7928cfee340f377a10391e077f90c))
* **json-crdt:** 🎸 improve view selector ([5a433a6](https://github.com/streamich/json-joy/commit/5a433a6b3a5ed71cab95b1baf85b565529832b5a))
* **json-crdt:** 🎸 return undefined on missing sub view ([d88f762](https://github.com/streamich/json-joy/commit/d88f762bdbaaaeb9a1833a338ede5bb47a0195af))

# [16.26.0](https://github.com/streamich/json-joy/compare/v16.25.0...v16.26.0) (2024-10-01)


### Features

* 🎸 remove usage of constructor name property ([857c8d3](https://github.com/streamich/json-joy/commit/857c8d365d82f802c1fcf06880f212c52e8ab6f8))

# [16.25.0](https://github.com/streamich/json-joy/compare/v16.24.0...v16.25.0) (2024-09-24)


### Features

* **json-crdt:** 🎸 introduce .applyLocalPatch() method ([24ba067](https://github.com/streamich/json-joy/commit/24ba06786b29281cab357e14d023a5578be50a72))

# [16.24.0](https://github.com/streamich/json-joy/compare/v16.23.2...v16.24.0) (2024-09-19)


### Features

* 🎸 make array check more robust ([40e8705](https://github.com/streamich/json-joy/commit/40e8705c0aa30e06268fe24485dffc687ac3203a))


### Performance Improvements

* ⚡️ update deep equal benchmarks ([0cde6cc](https://github.com/streamich/json-joy/commit/0cde6cc72f9946207ea78cc68879d398056d5f51))

## [16.23.2](https://github.com/streamich/json-joy/compare/v16.23.1...v16.23.2) (2024-09-17)


### Bug Fixes

* **json-crdt:** 🐛 do not detach builder clock on .reset() ([e668d84](https://github.com/streamich/json-joy/commit/e668d84c0e0447bfd89339ff82785874118ba8ac))

## [16.23.1](https://github.com/streamich/json-joy/compare/v16.23.0...v16.23.1) (2024-08-19)


### Bug Fixes

* **json-crdt:** 🐛 make change flush safe ([91a37ae](https://github.com/streamich/json-joy/commit/91a37ae67bfed5aceba923f67004ca7eda5115d7))

# [16.23.0](https://github.com/streamich/json-joy/compare/v16.22.1...v16.23.0) (2024-08-08)


### Bug Fixes

* **json-type-value:** 🐛 show value encoding problemsn in development mode ([24d5adb](https://github.com/streamich/json-joy/commit/24d5adb96622b3f146a05a597cd2a61fd84c8ed9))


### Features

* **json-type:** 🎸 improve type builder import method ([544188a](https://github.com/streamich/json-joy/commit/544188a8d439f5493576ff8e97a4bc9ae2d9d337))

## [16.22.1](https://github.com/streamich/json-joy/compare/v16.22.0...v16.22.1) (2024-08-01)


### Bug Fixes

* **json-type-value:** 🐛 add default type for values ([ee36743](https://github.com/streamich/json-joy/commit/ee367432dad787cc51775f0e98cd2721d973a17f))

# [16.22.0](https://github.com/streamich/json-joy/compare/v16.21.0...v16.22.0) (2024-07-29)


### Features

* **json-crdt-patch:** 🎸 allow readin patches sequentially ([ad98179](https://github.com/streamich/json-joy/commit/ad9817974bc573116fd1bf6a40be163bd5e1a35a))

# [16.21.0](https://github.com/streamich/json-joy/compare/v16.20.0...v16.21.0) (2024-07-29)


### Features

* 🎸 bump upstream dependencies ([f8a507f](https://github.com/streamich/json-joy/commit/f8a507f1c532f0fdd7957fa533415f25b0ffc731))

# [16.20.0](https://github.com/streamich/json-joy/compare/v16.19.0...v16.20.0) (2024-07-28)


### Features

* **json-crdt-patch:** 🎸 improve Patch .rebase() operation ([2bd08bc](https://github.com/streamich/json-joy/commit/2bd08bc7275fae2524494a153edec4004a8ae400))
* **json-crdt:** 🎸 when forking, detect if sid was already used ([6d3cdf7](https://github.com/streamich/json-joy/commit/6d3cdf7dea10d8c87f302c9e5361f8fe7719a4ce))

# [16.19.0](https://github.com/streamich/json-joy/compare/v16.18.1...v16.19.0) (2024-07-24)


### Features

* **json-crdt:** 🎸 add ability to deeply select value in store ([2c55b24](https://github.com/streamich/json-joy/commit/2c55b24e161513f049fe12f2986517be689fd29c))
* **json-crdt:** 🎸 add support "reset" events JSON Patch store ([71c80a8](https://github.com/streamich/json-joy/commit/71c80a8daf52395b2c0de6ea2506ccd0f697fb20))

## [16.18.1](https://github.com/streamich/json-joy/compare/v16.18.0...v16.18.1) (2024-07-24)


### Bug Fixes

* **json-crdt-patch:** 🐛 correct "obj" and "vec" text dumps ([d601792](https://github.com/streamich/json-joy/commit/d60179284c8ad0be3cd394667b5b0c6ccff16781))
* **json-crdt-patch:** 🐛 remove extra space ([f3c2fea](https://github.com/streamich/json-joy/commit/f3c2fea47df63e94d28de65b4d5b1768a40d3cdc))

# [16.18.0](https://github.com/streamich/json-joy/compare/v16.17.1...v16.18.0) (2024-07-23)


### Features

* **json-crdt:** 🎸 make JSON Patch JSON CRDT store events synchronous ([c43305e](https://github.com/streamich/json-joy/commit/c43305e924ffa33091fa4b58dcaf71c4f5ed8c10))

## [16.17.1](https://github.com/streamich/json-joy/compare/v16.17.0...v16.17.1) (2024-07-22)


### Bug Fixes

* **json-crdt:** 🐛 allow nested transactions ([d687561](https://github.com/streamich/json-joy/commit/d687561b62a22f5a3fc9820081ac8e803f3df9f4))

# [16.17.0](https://github.com/streamich/json-joy/compare/v16.16.0...v16.17.0) (2024-07-22)


### Features

* **json-crdt:** 🎸 add ability to bind to sub-state ([b012c6a](https://github.com/streamich/json-joy/commit/b012c6aa156cb0f03d5b2a7ccba6f77e5594cb92))
* **json-crdt:** 🎸 allow string pointers ([680d47f](https://github.com/streamich/json-joy/commit/680d47ff31560208b4f9407b4151766f4519e022))

# [16.16.0](https://github.com/streamich/json-joy/compare/v16.15.0...v16.16.0) (2024-07-22)


### Features

* **json-crdt:** 🎸 apply JSON Patch operations in a tracsaction ([b377d7c](https://github.com/streamich/json-joy/commit/b377d7c0ea4bf3cd0dd6fa2bd6495743f54573d5))
* **json-crdt:** 🎸 inprove JsonPatchStore interface ([dcbbc54](https://github.com/streamich/json-joy/commit/dcbbc548bf9ab7fc5c603094bbf9e142eb037065))

# [16.15.0](https://github.com/streamich/json-joy/compare/v16.14.0...v16.15.0) (2024-07-22)


### Bug Fixes

* **json-crdt-extensions:** 🐛 include text changes in hash ([99936dc](https://github.com/streamich/json-joy/commit/99936dc7b90ca18f66a658bf7a386805a274babe))


### Features

* **json-crdt-extensions:** 🎸 preserve object indentities in extension views ([0996683](https://github.com/streamich/json-joy/commit/099668338ee9b1b3ad838fb973edb5a364244a0b))
* **json-crdt:** 🎸 add ability to prefix JsonPatch operations ([34d3188](https://github.com/streamich/json-joy/commit/34d3188aa256e8f10f074462b1a6af99684a6ecb))
* **json-crdt:** 🎸 implement JsonPatchStore class ([dc0e6f3](https://github.com/streamich/json-joy/commit/dc0e6f340d9081b16decd1c2dd01deea59f25ba8))
* **json-crdt:** 🎸 shorten and make declarative all JSON Patch methods for JSON CRDT ([cf437b8](https://github.com/streamich/json-joy/commit/cf437b83df7b613563e07bff4cf9d5f41fc73b4b))

# [16.14.0](https://github.com/streamich/json-joy/compare/v16.13.2...v16.14.0) (2024-07-22)


### Features

* **json-crdt-extensions:** 🎸 add sample collected Quill fuzzer traces to tests ([1512870](https://github.com/streamich/json-joy/commit/151287098bcfa812f135b75961802e76eaed10a4))

## [16.13.2](https://github.com/streamich/json-joy/compare/v16.13.1...v16.13.2) (2024-07-20)


### Bug Fixes

* **json-crdt-extensions:** 🐛 do not miss second half of the contents ([dce7924](https://github.com/streamich/json-joy/commit/dce7924783e0cc37b96cbb57be3273e893ed8054))
* **json-crdt-extensions:** 🐛 find contained slice when there is no leading point in index ([f3d64ee](https://github.com/streamich/json-joy/commit/f3d64eea708bdf51657a6f53281dbee31b027b67))
* **json-crdt-extensions:** 🐛 find overlapping slices when there are no leads in index ([f630d85](https://github.com/streamich/json-joy/commit/f630d85bb39f9c1c18fad6a77c1a817525975738))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ proactively check for empty attributes ([b4d719c](https://github.com/streamich/json-joy/commit/b4d719c463276ead0a59aa2e0416195da48e7720))

## [16.13.1](https://github.com/streamich/json-joy/compare/v16.13.0...v16.13.1) (2024-07-15)


### Bug Fixes

* **json-crdt:** 🐛 make log start use correct logical time ([019883d](https://github.com/streamich/json-joy/commit/019883d0a9b10a4321276335a48a6f13f1befd92))

# [16.13.0](https://github.com/streamich/json-joy/compare/v16.12.0...v16.13.0) (2024-07-10)


### Features

* **json-crdt-extensions:** 🎸 add Quill extension inference types ([c21e15b](https://github.com/streamich/json-joy/commit/c21e15b249211e7aee1824e4fa5db83c3f0bc48a))
* **json-crdt-extensions:** 🎸 add Quill types ([524ae1b](https://github.com/streamich/json-joy/commit/524ae1be8976a94f930ed1df33b2242b1d91cb0d))
* **json-crdt-extensions:** 🎸 add QuillDeltaApi implementation ([656728e](https://github.com/streamich/json-joy/commit/656728ee6fe1e45fca97e47555cc051dbc586484))
* **json-crdt-extensions:** 🎸 add slice manipulation helpers ([ba2254c](https://github.com/streamich/json-joy/commit/ba2254cd726b2cd7bc77546adad2ea2e3db807c9))
* **json-crdt-extensions:** 🎸 implement Quill Delta view computation ([c643543](https://github.com/streamich/json-joy/commit/c6435431446f7511b5d6cd2711fb2d5cf8440fa2))
* **json-crdt-extensions:** 🎸 improve Quill Delta extension setup ([10e7721](https://github.com/streamich/json-joy/commit/10e77219f1a9034211bcd446db39a50891c65086))
* **json-crdt-extensions:** 🎸 setup Quill Delta extension ([d6a4111](https://github.com/streamich/json-joy/commit/d6a4111c20b5e2b5350f09e7bb9b1fce721c8837))

# [16.12.0](https://github.com/streamich/json-joy/compare/v16.11.0...v16.12.0) (2024-06-29)


### Bug Fixes

* **json-crdt-extensions:** 🐛 do not create stray slice deletion patches ([c769945](https://github.com/streamich/json-joy/commit/c76994544b125538ec01a41768ba0555068e98c8))


### Features

* **json-crdt-extensions:** 🎸 improve slice deletions ([6359951](https://github.com/streamich/json-joy/commit/6359951aa9a5f1d06d9b3e4ee69b71a1451ea635))

# [16.11.0](https://github.com/streamich/json-joy/compare/v16.10.0...v16.11.0) (2024-06-24)


### Features

* **json-expression:** 🎸 add ability to execute expressions without extra try-catch ([a8498ec](https://github.com/streamich/json-joy/commit/a8498ec368eca8619f8205604ab863233937afdc))
* **json-type:** 🎸 use new expession execution syntax ([43cd177](https://github.com/streamich/json-joy/commit/43cd1771bc9e48e98370ffc7f5870cf8d3a5a5f9))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ do not wrap Vars into an extra object ([4dbc780](https://github.com/streamich/json-joy/commit/4dbc7800089af84e90e06f48baf227e9ee069291))

# [16.10.0](https://github.com/streamich/json-joy/compare/v16.9.0...v16.10.0) (2024-06-21)


### Features

* **json-expression:** 🎸 implement "push" operator ([edbd128](https://github.com/streamich/json-joy/commit/edbd1288cf338861249be664dff8d7f70e9bbb6d))

# [16.9.0](https://github.com/streamich/json-joy/compare/v16.8.0...v16.9.0) (2024-06-17)


### Bug Fixes

* **json-expression:** 🐛 evaluate prop expressions ([9eb2035](https://github.com/streamich/json-joy/commit/9eb20352baf17286b3b7fff5f87f429d60382c7d))


### Features

* **json-expression:** 🎸 add JSON Patch add "jp.add" implementation ([2bbe3cd](https://github.com/streamich/json-joy/commit/2bbe3cddb25de9df79a7b19459542a8fbd6183bf))
* **json-expression:** 🎸 implement "o.set" operator ([bd05779](https://github.com/streamich/json-joy/commit/bd05779782546e73ed8f04f90926f0163513c458))
* **json-expression:** 🎸 implement object "o.del" operator ([20c7aff](https://github.com/streamich/json-joy/commit/20c7affc307974b359902c6d136870deee77d871))
* **json-expression:** 🎸 prevent protoptype chain mutation in "o.set" ([b676b55](https://github.com/streamich/json-joy/commit/b676b55f982919deb861231e72b00ad2e51bdc1e))


### Performance Improvements

* **json-expression:** ⚡️ pre-cast Literals to string ([84c5aeb](https://github.com/streamich/json-joy/commit/84c5aebff1e24aa98287ced3eebcb3086ebd49cb))

# [16.8.0](https://github.com/streamich/json-joy/compare/v16.7.0...v16.8.0) (2024-06-08)


### Features

* **json-crdt-extensions:** 🎸 chop off block sentinel text from inline node materializati ([d1ee62c](https://github.com/streamich/json-joy/commit/d1ee62c80a86792c0f18cce82ec18d682ee8d32d))
* **json-crdt-extensions:** 🎸 improve Inline attribute construction ([3ef2fe6](https://github.com/streamich/json-joy/commit/3ef2fe603fff4a7650aa5197f92bed9127c3dcb9))
* **json-crdt-extensions:** 🎸 report slice position relative to the inline ([2f960db](https://github.com/streamich/json-joy/commit/2f960dbd114b95cf6d4c4d336d1677056b99850d))
* **json-crdt-extensions:** 🎸 use undefined as data if no slice data specified ([e5c4992](https://github.com/streamich/json-joy/commit/e5c49922353956d7a7c8e18e3f0846bf3a201007))

# [16.7.0](https://github.com/streamich/json-joy/compare/v16.6.0...v16.7.0) (2024-06-08)


### Features

* **json-crdt-extensions:** 🎸 add inter-block iteration for inline elements ([22f6fe8](https://github.com/streamich/json-joy/commit/22f6fe8cbe0f56970a009747f48737f39db7a92c))
* **json-crdt-extensions:** 🎸 add inter-block iteration using point tuples ([edf19ac](https://github.com/streamich/json-joy/commit/edf19acaaecf731f7171806816525c173a3c25b6))
* **json-crdt-extensions:** 🎸 add iteration over block points ([19dcc68](https://github.com/streamich/json-joy/commit/19dcc68e564539c48beddb141e5ee59b12ed9fe2))
* **json-crdt-extensions:** 🎸 can return block marker when iterating ([0e66aa6](https://github.com/streamich/json-joy/commit/0e66aa63821963d67b56b4ed412897270cf1e775))
* **json-crdt-extensions:** 🎸 improve how blocks are printed to console, add Block.text() ([4a68cda](https://github.com/streamich/json-joy/commit/4a68cdaac2345910388847c868ccefc8fd619305))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ speed up range text materialization ([ac56314](https://github.com/streamich/json-joy/commit/ac563148feb70c963079b39c7687280f31d797dc))

# [16.6.0](https://github.com/streamich/json-joy/compare/v16.5.0...v16.6.0) (2024-06-07)


### Features

* **json-crdt-extensions:** 🎸 add initial Block class implementation ([69ef39d](https://github.com/streamich/json-joy/commit/69ef39dcea3c064d49861748b8e44e1b34c49f96))
* **json-crdt-extensions:** 🎸 construct a blocks layer out of Overlay ([067fed6](https://github.com/streamich/json-joy/commit/067fed6962ceb2d2c178730d0ee1ffb5c023fc14))

# [16.5.0](https://github.com/streamich/json-joy/compare/v16.4.0...v16.5.0) (2024-05-11)


### Features

* **json-crdt-extensions:** 🎸 add initial Inline class implementation ([9994f2a](https://github.com/streamich/json-joy/commit/9994f2abd0da082e7e36bda50f89506f5b38a483))
* **json-crdt-extensions:** 🎸 improve Inline.attr() implementation ([c6c5b62](https://github.com/streamich/json-joy/commit/c6c5b621e9f934903cc5b6393c73708c2afac752))
* **json-crdt-extensions:** 🎸 improve Inline.key() implementation ([4f5f012](https://github.com/streamich/json-joy/commit/4f5f012f3dc812058270ec5b1977ba3debd6e792))

# [16.4.0](https://github.com/streamich/json-joy/compare/v16.3.0...v16.4.0) (2024-05-10)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly store extra and local slices ([636a166](https://github.com/streamich/json-joy/commit/636a16622f8b9037cca18eee008b99dc9e375cde))
* **json-crdt-extensions:** 🐛 recompute different `Overlay` state hash when text changes ([d64b8ab](https://github.com/streamich/json-joy/commit/d64b8ab977bcd42b07da02471d5b554cde5d8703))


### Features

* **json-crdt-extensions:** 🎸 add markers only overlay tree ([9f090f7](https://github.com/streamich/json-joy/commit/9f090f71b18010bb71d0f5ea82bd1303957bb414))
* **json-crdt-extensions:** 🎸 improve text hash calculation ([ed6ce96](https://github.com/streamich/json-joy/commit/ed6ce960851bc8f57f3135c3b2329656ff13a56c))

# [16.3.0](https://github.com/streamich/json-joy/compare/v16.2.0...v16.3.0) (2024-05-08)


### Features

* **json-crdt-extensions:** 🎸 improve .points() iteration at offset ([8de8676](https://github.com/streamich/json-joy/commit/8de86766519c5e3dfbf28e0fd4943c00d2f0b277))
* **json-crdt-extensions:** 🎸 improve Overlay.pairs() iterator ([b095301](https://github.com/streamich/json-joy/commit/b095301aa285ff49ecedc7790911a71071522fb2))

# [16.2.0](https://github.com/streamich/json-joy/compare/v16.1.0...v16.2.0) (2024-05-07)


### Bug Fixes

* **json-crdt-extensions:** 🐛 improve .getOrNextHigher() ([fdf0744](https://github.com/streamich/json-joy/commit/fdf07446b08948f53d3a17e8d6b56086afb14fa6))


### Features

* **json-crdt-extensions:** 🎸 add Overlay.getOrNextHigher() impelemntation ([f3784b0](https://github.com/streamich/json-joy/commit/f3784b083392a9fc7e9bd2d64b173f074963ff63))
* **json-crdt-extensions:** 🎸 display slice behaviors ([eda567d](https://github.com/streamich/json-joy/commit/eda567dbde891b1f342c9274ccd6d940a7f6cc70))
* **json-crdt-extensions:** 🎸 handle abs end in getOrNextHigher() ([0d1254b](https://github.com/streamich/json-joy/commit/0d1254b07dd791ed1bebb5777911c93556568919))
* **json-crdt-extensions:** 🎸 implement Overlay traversal methods ([cb98052](https://github.com/streamich/json-joy/commit/cb98052b1d33cba95a9d5aa8c75c5c4ca76cea22))
* **json-crdt-extensions:** 🎸 improve editor interfaces ([a76291c](https://github.com/streamich/json-joy/commit/a76291c7b54a157de11fc6d21bdb17d80da7df4c))
* **json-crdt-extensions:** 🎸 improve how Point handles absolute end position ([7702e98](https://github.com/streamich/json-joy/commit/7702e9847907828c177d0902dfa9fd0a5b571aea))
* **json-crdt-extensions:** 🎸 improve marker point treatment in overlay ([32b481d](https://github.com/streamich/json-joy/commit/32b481dd309c32a2fe689a66e57514d7349819b5))
* **json-crdt-extensions:** 🎸 make Overlay an iterable ([8716cfa](https://github.com/streamich/json-joy/commit/8716cfa901a216037fe0477a09e369e6745f2b84))
* **json-crdt-extensions:** 🎸 support absolut positions in higher/lower iteration ([a88f9d8](https://github.com/streamich/json-joy/commit/a88f9d8937efad4b2495b6ac029816a92be8aff6))

# [16.1.0](https://github.com/streamich/json-joy/compare/v16.0.0...v16.1.0) (2024-05-05)


### Features

* **json-crdt-extensions:** 🎸 abstract saved slices into a standalone EditorSlices class ([444a9ae](https://github.com/streamich/json-joy/commit/444a9ae08ed4611fc7d41b09d163bdf2b4d283b2))
* **json-crdt-extensions:** 🎸 improve Editor and Cursor APIs ([fd1177f](https://github.com/streamich/json-joy/commit/fd1177fc8ea717cff26c5a13bc1e131efef442ae))
* **json-crdt-extensions:** 🎸 improve multi-cursor support ([7a6850b](https://github.com/streamich/json-joy/commit/7a6850b8740b99c919cd2eafd22cb44aacbf1f7f))
* **json-crdt-extensions:** 🎸 instantiate Peritext contenxt and Editor on PeritextApi ([5a22ffc](https://github.com/streamich/json-joy/commit/5a22ffc003d75c495aaad1ba93170b681e93749a))
* **json-crdt-extensions:** 🎸 make all Peritext classes generic to the RGA item ([55969b8](https://github.com/streamich/json-joy/commit/55969b88100c5c4eaf0b67b7ef20ea7604ccd325))

# [16.0.0](https://github.com/streamich/json-joy/compare/v15.11.0...v16.0.0) (2024-05-05)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly encode cnt extension sid key ([264d45c](https://github.com/streamich/json-joy/commit/264d45c4ad46938d18282db72b687da7c5bff4cd))
* **json-crdt:** 🐛 allow extension API selection through path selector ([c09dc8f](https://github.com/streamich/json-joy/commit/c09dc8fc2034da4a086b40292ee329b9f2cc3f32))
* **json-crdt:** 🐛 make extension schema copyable ([7bbee8f](https://github.com/streamich/json-joy/commit/7bbee8f12eda12168e512476c7b22a764424c35a))


### Features

* **json-crdt-extensions:** 🎸 add ability to access Peritext "str" node API ([41ec564](https://github.com/streamich/json-joy/commit/41ec5645c78d27cb4aecd28b45f0ba328c03f680))
* **json-crdt-extensions:** 🎸 add ability to access Peritext slices "arr" node ([2ea4f34](https://github.com/streamich/json-joy/commit/2ea4f3441e0c7a281b2ed432fb8f7d30e3f1cc57))
* **json-crdt-extensions:** 🎸 add type safety when accessing Peritext nodes ([7401ac5](https://github.com/streamich/json-joy/commit/7401ac5b7fdeb45682e23fe07b2b1f31ef6040aa))
* **json-crdt-extensions:** 🎸 define Peritext extension ([032bab1](https://github.com/streamich/json-joy/commit/032bab1ec3fc65d20f5670cc7566b34bb457c93b))
* **json-crdt-extensions:** 🎸 infer sessin ID from builder ([f0435a1](https://github.com/streamich/json-joy/commit/f0435a15a013eb541f471e3226937efadafc7816))
* **json-crdt-extensions:** 🎸 setup ModelWithExt static class ([69e1200](https://github.com/streamich/json-joy/commit/69e120048d5132bfcc7141243cdfbaaf7d6e9971))
* **json-crdt-extensions:** 🎸 simplify cnt extension definition ([3ef93cd](https://github.com/streamich/json-joy/commit/3ef93cd4cb2743cbf744d02faf93e3f9e204d58f))
* **json-crdt-patch:** 🎸 add node.json schema builder class ([ed6a558](https://github.com/streamich/json-joy/commit/ed6a55827100209aba432cdabcdf5c07a0603283))
* **json-crdt-patch:** 🎸 add s.ext() schema builder ([0f7910b](https://github.com/streamich/json-joy/commit/0f7910b938301f4025ed2067824085cde7aefe67))
* **json-crdt-patch:** 🎸 improve schema types and value preservatin ([7ebc049](https://github.com/streamich/json-joy/commit/7ebc04962e3904a608638a7c0e10daafa9460254))
* **json-crdt:** 🎸 ability to select extension api directly ([8af589c](https://github.com/streamich/json-joy/commit/8af589ce8effb1126af4823d2120332aeed75f4c))
* **json-crdt:** 🎸 add abstract ExtNode class ([5a79cec](https://github.com/streamich/json-joy/commit/5a79cec92871e9899d0206e5ff964445f30b0287))
* **json-crdt:** 🎸 construct extension API nodes when accessing by proxy ([ef5c581](https://github.com/streamich/json-joy/commit/ef5c5819517786072a7bc30fa7c3b5df8c2b1e5f))
* **json-crdt:** 🎸 improve extension node selection by proxy ([ebf1eea](https://github.com/streamich/json-joy/commit/ebf1eea0ff2c5761f3b184d07a2ec32e74e963ab))
* **json-crdt:** 🎸 improve extension presentation ([d13cc65](https://github.com/streamich/json-joy/commit/d13cc658e56e23be27acb2d21b09ff9e730e4b4d))
* **json-crdt:** 🎸 make extenion object optional when calling .asExt() ([fe7e6a9](https://github.com/streamich/json-joy/commit/fe7e6a9ad997f0d32fe6bc778d12ab2373d7b89f))
* **json-crdt:** 🎸 remove chaining from node APIs ([1fb6f11](https://github.com/streamich/json-joy/commit/1fb6f11f47400f06cd1d0b1d07584eb5c9af24a1))
* **json-crdt:** 🎸 start Extension implementation ([7da9262](https://github.com/streamich/json-joy/commit/7da926277dff314b51ac6adfeb358c3d0a3a3597))
* **json-crdt:** 🎸 use Extension class to construct extensions ([273d013](https://github.com/streamich/json-joy/commit/273d013821af614c746ef532f1c0363d1c9d7f4c))


### BREAKING CHANGES

* **json-crdt:** 🧨 A number of JSON CRDT NodeApi methods have been changed.

# [15.11.0](https://github.com/streamich/json-joy/compare/v15.10.0...v15.11.0) (2024-05-02)


### Bug Fixes

* **json-crdt-extensions:** 🐛 allow setting non-constant slice data ([2f87b8a](https://github.com/streamich/json-joy/commit/2f87b8a00640ec0f8ab6cb2c0e7802b883ffca8f))


### Features

* **json-crdt-extensions:** 🎸 allow passing in extra slice and local slice models ([b10d1cf](https://github.com/streamich/json-joy/commit/b10d1cf29f7b1dd53ce42dff9b2601f95bfc124c))
* **json-crdt-extensions:** 🎸 improve mutations in persisted slices ([d6d0193](https://github.com/streamich/json-joy/commit/d6d01935d7066317eb5b45d6920e3bff9f53dd97))
* **json-crdt-extensions:** 🎸 improve Pertiext .toString() presentation ([c529aaf](https://github.com/streamich/json-joy/commit/c529aaf33a4505d1167064b879c8a2c140464f3d))
* **json-crdt-extensions:** 🎸 improve slice typing and schema ([ce6eb34](https://github.com/streamich/json-joy/commit/ce6eb34080150cd64e76a81b1639f4f8d5be6d01))
* **json-crdt:** 🎸 add Model.create() method ([8fc8fc0](https://github.com/streamich/json-joy/commit/8fc8fc06ec08e3a82c88c3b6e0adcbfcad2d2e3a))
* **json-crdt:** 🎸 improve model creation flow ([89daf03](https://github.com/streamich/json-joy/commit/89daf03d4151ba4d205175d2984e884f0d9c740d))
* **json-crdt:** 🎸 improve model initialization APIs ([e0474d1](https://github.com/streamich/json-joy/commit/e0474d1279ccb9207e52c6c374ae243302c6515f))

# [15.10.0](https://github.com/streamich/json-joy/compare/v15.9.0...v15.10.0) (2024-05-01)


### Bug Fixes

* 🐛 bump tree-dump dependency ([553c9ee](https://github.com/streamich/json-joy/commit/553c9ee6b93e0b6515954ffe884423d2163146d0))


### Features

* **json-crdt-extensions:** 🎸 add more slice layers ([7971f21](https://github.com/streamich/json-joy/commit/7971f217c7c27e70a76e95220144ef6892a1371c))
* **json-crdt-extensions:** 🎸 cleanup internal data structures after local changes ([232457b](https://github.com/streamich/json-joy/commit/232457bc3db6839df9130f1cbae9e27284d548f4))


### Performance Improvements

* **json-crdt:** ⚡️ improve first chunk finding implementation ([5e7e661](https://github.com/streamich/json-joy/commit/5e7e66120233120d5fc8f9fc0dab3da0d7396299))

# [15.9.0](https://github.com/streamich/json-joy/compare/v15.8.0...v15.9.0) (2024-04-30)


### Features

* **json-crdt-extensions:** 🎸 add higher-level API for inserting markers ([7789ced](https://github.com/streamich/json-joy/commit/7789cedc104316ed4a0f3230fc1e648b9f105467))
* **json-crdt-extensions:** 🎸 add initial Overlay implementatin ([2cd0174](https://github.com/streamich/json-joy/commit/2cd017425905aa66097be76768e191ae2b64b65e))
* **json-crdt-extensions:** 🎸 improve how cursor is displayed ([ceadbdd](https://github.com/streamich/json-joy/commit/ceadbdd3898e5f4d48e8d9b3e4f26a6d2a00a32b))
* **json-crdt-extensions:** 🎸 improve how slices are presented ([a83518d](https://github.com/streamich/json-joy/commit/a83518d7c1c499730198427fe2477c9d2a4f3825))
* **json-crdt-extensions:** 🎸 improve overlay layer insertions ([75e2620](https://github.com/streamich/json-joy/commit/75e26209007676b2d8ee022bad7a5a142b02ddfb))

# [15.8.0](https://github.com/streamich/json-joy/compare/v15.7.0...v15.8.0) (2024-04-29)


### Features

* **json-crdt:** 🎸 add typing support for Log ([bcb84a1](https://github.com/streamich/json-joy/commit/bcb84a1383bdf2d39e6438e5a8be3fb2d698ff9b))

# [15.7.0](https://github.com/streamich/json-joy/compare/v15.6.0...v15.7.0) (2024-04-28)


### Features

* **json-crdt-extensions:** 🎸 implement OverlayPointMarker ([4612bd4](https://github.com/streamich/json-joy/commit/4612bd4ce746ecc73203d8a25528818c27959752))
* **json-crdt-extensions:** 🎸 improve MarkerOverlayPoint presentation ([b6b6521](https://github.com/streamich/json-joy/commit/b6b6521199ae5419d49d99294b5831c248c2d75c))

# [15.6.0](https://github.com/streamich/json-joy/compare/v15.5.0...v15.6.0) (2024-04-28)

### Bug Fixes

- **json-crdt:** 🐛 store golbal session in clock vector ([407c383](https://github.com/streamich/json-joy/commit/407c38321ea43916cc8ccd0ce0ff3f678e5be76e))

### Features

- **json-crdt:** 🎸 use SESSION.GLOBAL for default value and schema setup ([4813bc9](https://github.com/streamich/json-joy/commit/4813bc99d91e5a7287fc23b51ad29b0a37a18d91))

# [15.5.0](https://github.com/streamich/json-joy/compare/v15.4.1...v15.5.0) (2024-04-26)

### Features

- **json-crdt-extensions:** 🎸 add block tag type ([120ba2f](https://github.com/streamich/json-joy/commit/120ba2f56be87640fe8eff09918eef55a609f56f))
- **json-crdt-extensions:** 🎸 add OverlayPoint implementation ([ca037e6](https://github.com/streamich/json-joy/commit/ca037e6a0d3a3a94511755c06c4d8a350a339649))
- **json-crdt-extensions:** 🎸 implement overlay "ref" concept ([7c31a6f](https://github.com/streamich/json-joy/commit/7c31a6fadb84c391a7ede68dd094bb8dd63bd0bd))
- **json-crdt-extensions:** 🎸 improve overlay point layer insertion ([70748ac](https://github.com/streamich/json-joy/commit/70748ac60fc15b8f35e5ed5361011c873d46753b))
- **json-crdt-extensions:** 🎸 improve OverlayPoint marker operations ([7aea094](https://github.com/streamich/json-joy/commit/7aea094eaefc5a8ce6a0691e4a189b3a96718ef6))
- **json-crdt-extensions:** 🎸 improve OverlayPoint ref operations ([8a23776](https://github.com/streamich/json-joy/commit/8a237760a999987c5e00baaa40ccc1110faeb5cf))

### Performance Improvements

- **json-crdt-extensions:** ⚡️ remove immediately from the right bucket ([faf466f](https://github.com/streamich/json-joy/commit/faf466f71f3a1c8d68702f58181cd85b11981c4b))
