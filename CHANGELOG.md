# [17.41.0](https://github.com/streamich/json-joy/compare/v17.40.0...v17.41.0) (2025-05-10)


### Bug Fixes

* **json-crdt-diff:** 🐛 correct issues found by fuzzer ([c6fbe17](https://github.com/streamich/json-joy/commit/c6fbe17d3e71b3b78c383eb252b2e3f685e50062))
* **json-crdt-diff:** 🐛 improve array diff edge cases ([7d68bc1](https://github.com/streamich/json-joy/commit/7d68bc14202e229da54e4b17836bbb3fe2e8fde0))
* **json-crdt-diff:** 🐛 use unicode encoding for binary data ([1df2781](https://github.com/streamich/json-joy/commit/1df2781ce147385dadf6b496aa372b9ebea4f90a))
* **json-patch-diff:** 🐛 allow string node type change ([68b8b27](https://github.com/streamich/json-joy/commit/68b8b27a91921d2374458e9808d2eebb36b9e7ff))
* **util:** 🐛 correct line diff line beginning normalization ([a29b4b7](https://github.com/streamich/json-joy/commit/a29b4b770df838e78dc4602686f5766e39c40d41))
* **util:** 🐛 correctly assign last line patch operation ([20d1199](https://github.com/streamich/json-joy/commit/20d11994cff5fac370c37021069d23a744a5a6ff))
* **util:** 🐛 correctly compute diff source offset ([cb247c8](https://github.com/streamich/json-joy/commit/cb247c8980dac73be918c8c213a00e31e670a57c))
* **util:** 🐛 correctly determini line operation on last line no-newline op ([82a97fe](https://github.com/streamich/json-joy/commit/82a97fea844bdc819dac48bcc1d0d8fd562e3816))
* **util:** 🐛 do not emit empty operations ([7383d95](https://github.com/streamich/json-joy/commit/7383d954325643150796eb6dee517f154e76342e))
* **util:** 🐛 do not emit empty operations ([bdde345](https://github.com/streamich/json-joy/commit/bdde34547b060f58ee07137c3a5dccd92b50cc28))
* **util:** 🐛 handle correctly array shifts ([1cbc8a5](https://github.com/streamich/json-joy/commit/1cbc8a5063e2a093cafa3dcab35e33f20ff43737))
* **util:** 🐛 improve handling of line separators ([33a8316](https://github.com/streamich/json-joy/commit/33a83168f9cd3f63e9ca4e4d3378781331d9594e))
* **util:** 🐛 improve line diff assignment, use a newline char per line ([11eaaa8](https://github.com/streamich/json-joy/commit/11eaaa8f62a7d08f9ebbe29e8d262b0b439357c5))
* **util:** 🐛 keep new-line on line end fixes ([b5a9b99](https://github.com/streamich/json-joy/commit/b5a9b99c6f11a18686de47af6e6b1a9c3a05ca2a))


### Features

* **json-crdt-diff:** 🎸 handle case where "obj" value not compatible with dst value ([587d2c5](https://github.com/streamich/json-joy/commit/587d2c5264bb6d2b99132ad2834c110130776dec))
* **json-crdt-diff:** 🎸 implement "bin" node diffing ([c03ede5](https://github.com/streamich/json-joy/commit/c03ede50816ba7660e2eaac5a1c5e8aa8684b5c3))
* **json-crdt-diff:** 🎸 implement "val" node diff ([030023b](https://github.com/streamich/json-joy/commit/030023b0cfd1263e8ff47061e67e257ae06cc78a))
* **json-crdt-diff:** 🎸 implement array diff apply(), start using arrayd diff in CRDT ([bc25ff6](https://github.com/streamich/json-joy/commit/bc25ff6e56afb26fe3b7e70159bdeefc8147e768))
* **json-crdt-diff:** 🎸 implement diff for "vec" nodes ([4e3067e](https://github.com/streamich/json-joy/commit/4e3067ec6dc7532a50508599de339f12c6de97bf))
* **json-crdt-diff:** 🎸 implement initial "arr" node diff ([fd88982](https://github.com/streamich/json-joy/commit/fd88982f17978d44fe9fa6827d436b154156bca2))
* **json-crdt-diff:** 🎸 implement StrNode diff ([f1db4d8](https://github.com/streamich/json-joy/commit/f1db4d8eb2f0ebfb6a77afc16a2057dba00fd2fc))
* **json-crdt-diff:** 🎸 improve binary node handling ([9ae5c90](https://github.com/streamich/json-joy/commit/9ae5c9090934ca04b544f6c7357234f829d1837f))
* **json-crdt-diff:** 🎸 insert missing keys into "obj" ([14e64fb](https://github.com/streamich/json-joy/commit/14e64fbaa27fffacfa157167dea40159a98b892e))
* **json-crdt-diff:** 🎸 pass in source length on patch application ([5968a47](https://github.com/streamich/json-joy/commit/5968a473e6e69c254f3c0beb74dd249d211e57b8))
* **json-crdt-diff:** 🎸 remove deleted "obj" keys ([a0e148f](https://github.com/streamich/json-joy/commit/a0e148f0473137ffa59e263cbd794f108869d4de))
* **json-crdt-diff:** 🎸 support entering "obj" entries ([036b58e](https://github.com/streamich/json-joy/commit/036b58e90a47511e75ebe5e67a08184ef8f8aa4e))
* **json-crdt-diff:** 🎸 use line diff in JSON CRDT diff ([ff97192](https://github.com/streamich/json-joy/commit/ff9719248c2a3c189fcae84613835248088fe38a))
* **json-crdt-peritext-ui:** 🎸 implement text diff ([395b4db](https://github.com/streamich/json-joy/commit/395b4dbc3e6042732d27d5c07ea815add017e045))
* **json-hash:** 🎸 assert structural hash in variants ([9187472](https://github.com/streamich/json-joy/commit/9187472891fe91607497bbf5b46eedc0ac0bc473))
* **json-hash:** 🎸 implement structural hashing for CRDT nodes ([ada9067](https://github.com/streamich/json-joy/commit/ada9067690c83ecd7a1adef2975cde0e3d08b41b))
* **json-hash:** 🎸 produce hashes for binary data ([3abcfcf](https://github.com/streamich/json-joy/commit/3abcfcf980833fd89fc8391c6f6979b9b0bc9cc4))
* **json-patch-diff:** 🎸 add array node diff implementation ([a6a28ef](https://github.com/streamich/json-joy/commit/a6a28ef54303bfe6aff96e18209266c0cf729d56))
* **json-patch-diff:** 🎸 implement diff for object nodes ([d7066d3](https://github.com/streamich/json-joy/commit/d7066d383d22678731275347194af8c2e1261f58))
* **json-patch-diff:** 🎸 setup JSON Patch diff algorithm implementation ([0427a1a](https://github.com/streamich/json-joy/commit/0427a1a780c79d99f55f6c672eb436760e9a2d95))
* **json-patch-diff:** 🎸 use line diff in JSON Patch diff ([83694ad](https://github.com/streamich/json-joy/commit/83694adacd1828f089264c3253bee6619821a2b0))
* **util:** 🎸 add diff utility methods ([0fb9c7c](https://github.com/streamich/json-joy/commit/0fb9c7c0dd2a0f1b9033bb8a74c8a4d5c166e7dc))
* **util:** 🎸 add initial implementation of line matching ([d89fb9e](https://github.com/streamich/json-joy/commit/d89fb9ecf1cef5a0383a701a094de0186344d28e))
* **util:** 🎸 cleanup array diff ([64fc4b7](https://github.com/streamich/json-joy/commit/64fc4b789c8e2fcac78a9a9f182bc527834cffe9))
* **util:** 🎸 create line-by-line patch module ([ca9ae65](https://github.com/streamich/json-joy/commit/ca9ae6594ef53c6cc4c15c1ae225d8e57dc9fe7e))
* **util:** 🎸 handle new line chars ([5ff05bf](https://github.com/streamich/json-joy/commit/5ff05bfe26039bf0558dc4257da571839cccfa2a))
* **util:** 🎸 implement array diff child element entry ([1853633](https://github.com/streamich/json-joy/commit/18536339d01e5e08dc4ec3370752e964a8f6682e))
* **util:** 🎸 implement binary to hex transforms ([66c37c1](https://github.com/streamich/json-joy/commit/66c37c1e6523cb4c681a7329c453af2d9bdd79c1))
* **util:** 🎸 implement diff for binary data ([a740d02](https://github.com/streamich/json-joy/commit/a740d02676c100b216cf615224e16913fbc3f68a))
* **util:** 🎸 implement line matching ([b75cbfe](https://github.com/streamich/json-joy/commit/b75cbfe6906fadd9ebe237712e42358a639a5edf))
* **util:** 🎸 initial by-line diff implementation ([d786e53](https://github.com/streamich/json-joy/commit/d786e53ebfd5ec4a322aff8f23dedd7f0a976ce4))
* **util:** 🎸 initial, outer, implementation of array diff ([2a40471](https://github.com/streamich/json-joy/commit/2a40471cbbed24f6b283b3a50be667f2a52b9276))
* **util:** 🎸 match line in line patch ([68f131e](https://github.com/streamich/json-joy/commit/68f131e93d8c80712afbe7d8851163df127879a6))
* **util:** 🎸 normalize line beginnings across inserts ([b6f142a](https://github.com/streamich/json-joy/commit/b6f142a46f8af929536b32023466ac322e7ba386))


### Performance Improvements

* **json-hash:** ⚡️ use custom insertion sort implementation ([b55ff6a](https://github.com/streamich/json-joy/commit/b55ff6abc66d0a27f74acee010d8c231f2688a8a))
* **util:** ⚡️ cleanup line diff algorithm ([0330f0d](https://github.com/streamich/json-joy/commit/0330f0d4c1ce7c13b49926c249f50e844dd65d62))

# [17.40.0](https://github.com/streamich/json-joy/compare/v17.39.0...v17.40.0) (2025-04-18)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 on double-click make sure the focus is in front ([b4ec3d3](https://github.com/streamich/json-joy/commit/b4ec3d38330d9ae3487b7a562c5b2f4626a7349c))


### Features

* **json-crdt-peritext-ui:** 🎸 add actions to block type menu ([a3bb8df](https://github.com/streamich/json-joy/commit/a3bb8dfe8eac11fa6f20faa3dc53245fe1ddfdec))
* **json-crdt-peritext-ui:** 🎸 add heading renderers ([7f21ee7](https://github.com/streamich/json-joy/commit/7f21ee7b14c2dc9d9243265931124cab1a3a041b))
* **json-crdt-peritext-ui:** 🎸 allow to specify partial implementation in cboard action ([8f8ee78](https://github.com/streamich/json-joy/commit/8f8ee78382e497921bc696fe6e559467c205292a))
* **json-crdt-peritext-ui:** 🎸 create local expandable toolbar component ([253b541](https://github.com/streamich/json-joy/commit/253b541f6c15cff8c314a2b9d6a220b2cced154a))
* **json-crdt-peritext-ui:** 🎸 improve clipboard action behavior ([77bc14f](https://github.com/streamich/json-joy/commit/77bc14f591ab08de3d5bd28456142af76030b2a6))
* **json-crdt-peritext-ui:** 🎸 move focus toolbar into viewport ([4bfd16e](https://github.com/streamich/json-joy/commit/4bfd16ee5901459d9dde30a570c8c9d4d0e1c625))
* **json-crdt-peritext-ui:** 🎸 show only main cursor toolbar over focus caret ([2a5cdd8](https://github.com/streamich/json-joy/commit/2a5cdd882bddec16875ba3176ae11436b8b433c2))
* **json-crdt-peritext-ui:** 🎸 update block context menu ([c26aaab](https://github.com/streamich/json-joy/commit/c26aaab8881445fb5a155f30f0dc0f093f321ae3))

# [17.39.0](https://github.com/streamich/json-joy/compare/v17.38.0...v17.39.0) (2025-04-13)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correct various selection set edge cases ([0b72bc9](https://github.com/streamich/json-joy/commit/0b72bc907d14b32a10fb33348ce3e6805b26aaa2))
* **json-crdt-extensions:** 🐛 correctly return undefined when at ABS start ([97eebb6](https://github.com/streamich/json-joy/commit/97eebb666fdcb69888ca6d3ff8a108ba18f9fbac))
* **json-crdt-extensions:** 🐛 correctly return undefined when querying at ABS end ([b77ffe2](https://github.com/streamich/json-joy/commit/b77ffe256d5518bd9499d6f5000102e52dd7e515))
* **json-crdt-extensions:** 🐛 return all cursors even in presence of other slice types ([4c92831](https://github.com/streamich/json-joy/commit/4c92831c1641ef18aeff7b600969fbc0b16f5216))
* **json-crdt-extensions:** 🐛 return undefined overlay point and ABS start when needed ([a3ca966](https://github.com/streamich/json-joy/commit/a3ca96614ecffd6aa27c3f8dfb8a8c5e4619b219))
* **json-crdt-peritext-ui:** 🐛 adjust anchor point correctly as start-end points swap ([0c0f6c6](https://github.com/streamich/json-joy/commit/0c0f6c67e28897f15b959e0bb5885ccf74de61b2))
* **json-crdt-peritext-ui:** 🐛 correctly handle unit deletes ([79651ef](https://github.com/streamich/json-joy/commit/79651efdbf8264b0cae4ac5f4d29b872f193050e))
* **json-crdt-peritext-ui:** 🐛 handle line info retrieval and ABS end ([c844c69](https://github.com/streamich/json-joy/commit/c844c69b8d6a18b6dd889a2a736fb7364ec58032))
* **json-crdt-peritext-ui:** 🐛 make multi-cursor work again ([6d003de](https://github.com/streamich/json-joy/commit/6d003de1a84dfa4874faf1341b8bddf58e6810ca))
* **json-crdt-peritext-ui:** 🐛 safely detect text ABS ends ([4be2ab0](https://github.com/streamich/json-joy/commit/4be2ab0b8bbe6431920b5d021c96350c907937f6))
* **json-crdt-peritext-ui:** 🐛 update active block ID on any event ([1fc31bd](https://github.com/streamich/json-joy/commit/1fc31bd2f4768db2e647985b6e78e61360c037b8))


### Features

* **json-crdt-extensions:** 🎸 implement selection set construction ([cf739a1](https://github.com/streamich/json-joy/commit/cf739a13a3b7259593bfaf29f899490c5569b5a4))
* **json-crdt-peritext-ui:** 🎸 add "vline" movement unit ([2a50aed](https://github.com/streamich/json-joy/commit/2a50aedc53273f35590d63b226275b640fb64f96))
* **json-crdt-peritext-ui:** 🎸 add block clipboard menu ([087ded5](https://github.com/streamich/json-joy/commit/087ded59e4d9231bd04aa7e9c3358b95f14501a9))
* **json-crdt-peritext-ui:** 🎸 add block menu definition ([f5abe26](https://github.com/streamich/json-joy/commit/f5abe262126f85c4dd340dc88af4491a8205505f))
* **json-crdt-peritext-ui:** 🎸 add support for selections to "format" events ([8a8ac43](https://github.com/streamich/json-joy/commit/8a8ac43a81e11df329a0b21ef892b05b7fc9d49a))
* **json-crdt-peritext-ui:** 🎸 bump nice-ui dependency ([41cd50a](https://github.com/streamich/json-joy/commit/41cd50a32f4173955d8923a8c47c1eb315f603b8))
* **json-crdt-peritext-ui:** 🎸 connect basic block type actions to menu ([1773026](https://github.com/streamich/json-joy/commit/1773026a365e4f6ddb30dbe42a0591c4596030f0))
* **json-crdt-peritext-ui:** 🎸 enable point movements ([0d75e8c](https://github.com/streamich/json-joy/commit/0d75e8c10ffc8a22d3676020d02ab80878653098))
* **json-crdt-peritext-ui:** 🎸 handle more input events ([7156cf5](https://github.com/streamich/json-joy/commit/7156cf5e1858410b00c816e46928b75ff5f251b5))
* **json-crdt-peritext-ui:** 🎸 handle word jumps ([790c29e](https://github.com/streamich/json-joy/commit/790c29e17195534bf89d570177471f595ce7fba8))
* **json-crdt-peritext-ui:** 🎸 implement block selection action ([2473ecf](https://github.com/streamich/json-joy/commit/2473ecfcfe0f15f7a3cebf122cff7e3963891853))
* **json-crdt-peritext-ui:** 🎸 improve "delete" event interface ([ca8b147](https://github.com/streamich/json-joy/commit/ca8b1479a8c40c91b20bcfd5ac0e823d12d950f3))
* **json-crdt-peritext-ui:** 🎸 improve cursor event ([fee232c](https://github.com/streamich/json-joy/commit/fee232c39d5932d611249d2f2082133c9f3231b3))
* **json-crdt-peritext-ui:** 🎸 improve selection set move algorithm ([33ad929](https://github.com/streamich/json-joy/commit/33ad929858b3bca1f7c7019c1dc0a9cf0b619832))
* **json-crdt-peritext-ui:** 🎸 integrate selection set concept into "buffer" events ([90cf6f3](https://github.com/streamich/json-joy/commit/90cf6f322608d0aa7ac34b61b0be82283fad65e2))
* **json-crdt-peritext-ui:** 🎸 introduce selections in "marker" events ([37aed34](https://github.com/streamich/json-joy/commit/37aed34995c55b597fe0ffe54d421acd641a16bf))
* **json-crdt-peritext-ui:** 🎸 move cursor after paste ([92e2b84](https://github.com/streamich/json-joy/commit/92e2b84eac6aadb438a901a7d918b4a9f2bb74dc))
* **json-crdt-peritext-ui:** 🎸 render <codeblock> elements ([6adcb00](https://github.com/streamich/json-joy/commit/6adcb00d3c233be090ac1cc15dc803d64b879238))
* **json-crdt-peritext-ui:** 🎸 render block left toolbar menu ([6dc779e](https://github.com/streamich/json-joy/commit/6dc779ead964c37bafb9bf14a80e529b7f9e7410))
* **json-crdt-peritext-ui:** 🎸 restructure toolbar plugin inline and block folders ([05f8642](https://github.com/streamich/json-joy/commit/05f86428dd25ed2a64c2ba45fb44a45cc9cb0655))
* **json-crdt-peritext-ui:** 🎸 set context menu width ([af2b057](https://github.com/streamich/json-joy/commit/af2b0579e05877a2a1ef844c2a7ed8d890bc948f))
* **json-crdt-peritext-ui:** 🎸 setup block menu toolbar rendering ([52e7fd3](https://github.com/streamich/json-joy/commit/52e7fd3f9b890b540aaa51202c1c634469150c57))
* **json-crdt-peritext-ui:** 🎸 setup leaf block overlay frames ([86fc289](https://github.com/streamich/json-joy/commit/86fc289c2fb8e79b24b6e3107cdf5b775454c7cb))
* **json-crdt-peritext-ui:** 🎸 setup new cursor movement event detail API ([6bb45b5](https://github.com/streamich/json-joy/commit/6bb45b5c32ac7ff019e094bacdc39c93b18cfd38))
* **json-crdt-peritext-ui:** 🎸 show block toolbar only when one cursor and no selection ([a455c83](https://github.com/streamich/json-joy/commit/a455c835e3d6d8b0a2cc78c2e430a27109c2bb90))
* **json-crdt-peritext-ui:** 🎸 specify the new event interfaces ([df226e1](https://github.com/streamich/json-joy/commit/df226e12dbc145070d76240c0c03a92d4608e620))
* **json-crdt-peritext-ui:** 🎸 standartize range event details ([646facb](https://github.com/streamich/json-joy/commit/646facb72eacf5ad4e8e3af2133dc3bb9ab4ef5a))
* **json-crdt-peritext-ui:** 🎸 track active block ([330b6ae](https://github.com/streamich/json-joy/commit/330b6ae5bc48757971e5986255fea3b5b309952d))
* **json-crdt-peritext-ui:** 🎸 update all arrow cursor movements ([5c5dd05](https://github.com/streamich/json-joy/commit/5c5dd05f5c9a681cd8b7381be7a7e902b210a0f0))
* **json-crdt-peritext-ui:** 🎸 update delete event implementation ([6a7ac05](https://github.com/streamich/json-joy/commit/6a7ac0539bbca7ba0fb283519a267308bcfe6878))
* **json-crdt-peritext-ui:** 🎸 update fomartting implementation ([8b1b8cf](https://github.com/streamich/json-joy/commit/8b1b8cff3cd157e0f3d65997746ccf0130d78b38))

# [17.38.0](https://github.com/streamich/json-joy/compare/v17.37.0...v17.38.0) (2025-04-04)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 re-render debug overlays on screen size changes ([b299caf](https://github.com/streamich/json-joy/commit/b299caf5f97e105821ce31c4e48a6288e690d1d0))


### Features

* **json-crdt-peritext-ui:** 🎸 create formal cursor state ([89640a9](https://github.com/streamich/json-joy/commit/89640a9c27a74bb614c9bc5d192cdbcd800e0ea8))
* **json-crdt-peritext-ui:** 🎸 immediately construct <div> source node and state ([44e1596](https://github.com/streamich/json-joy/commit/44e15960438402d52eb58aa550db874a238f124c))
* **json-crdt-peritext-ui:** 🎸 improve boundary element mapping ([4a35ac7](https://github.com/streamich/json-joy/commit/4a35ac79a65115ff96c170f6174e838b7e40f239))
* **json-crdt-peritext-ui:** 🎸 improve DOM and React integration ([b744164](https://github.com/streamich/json-joy/commit/b7441648b4993b2eb35e3d3073c0d5b6a6a3a8c3))
* **json-crdt-peritext-ui:** 🎸 improve re-rendering implementation ([98f69e7](https://github.com/streamich/json-joy/commit/98f69e7887514a32516ea51f4ee66304a6720e47))
* **json-crdt-peritext-ui:** 🎸 index all inline elements ([44f4f2e](https://github.com/streamich/json-joy/commit/44f4f2ea34f868a186d870597df003d14be243c4))
* **json-crdt-peritext-ui:** 🎸 index leaf block DOM elements ([9917b37](https://github.com/streamich/json-joy/commit/9917b37addd2af60ccdeb1826abb21816e6e31a8))
* **json-crdt-peritext-ui:** 🎸 move state one folder up ([680213c](https://github.com/streamich/json-joy/commit/680213c8922acf9a9aab9c6af8d8e66f6fb6ec22))
* **json-crdt-peritext-ui:** 🎸 position caret at line end ([87c5a7a](https://github.com/streamich/json-joy/commit/87c5a7af57734e4ae888387d92349921a7ee9901))
* **json-crdt-peritext-ui:** 🎸 retrieve spans of first block ([deb7223](https://github.com/streamich/json-joy/commit/deb72236114857e648d442b817c9ff4f6bb0ed6e))

# [17.37.0](https://github.com/streamich/json-joy/compare/v17.36.0...v17.37.0) (2025-04-01)


### Features

* **json-crdt-extensions:** 🎸 implement block type update method ([d88ad48](https://github.com/streamich/json-joy/commit/d88ad48fe385b073f98b4f1cd8473e4d5fd29479))
* **json-crdt-extensions:** 🎸 implement toggling of block split types ([0f8f000](https://github.com/streamich/json-joy/commit/0f8f0004712bc75c7992b1fd4d9ce7897afe68ab))
* **json-crdt-peritext-ui:** 🎸 add ability to hide cursor info in debug mode ([ff9e996](https://github.com/streamich/json-joy/commit/ff9e99672a236429c8086576ed563da0d5bb23f8))
* **json-crdt-peritext-ui:** 🎸 add ability to hide debug info labes ([f07f347](https://github.com/streamich/json-joy/commit/f07f34784d26f6800542e0144ce295cdda9a8b1b))
* **json-crdt-peritext-ui:** 🎸 add ability to hide outlines ([b018690](https://github.com/streamich/json-joy/commit/b018690ba42ae5764c547a81bd6435de14281245))
* **json-crdt-peritext-ui:** 🎸 create explicit DebugState class ([a7d236a](https://github.com/streamich/json-joy/commit/a7d236afbba169dc081321d934b011a6abf95233))
* **json-crdt-peritext-ui:** 🎸 implement multi-cursor block-merge ([d2ad754](https://github.com/streamich/json-joy/commit/d2ad75454ca8fbca9ccfab74e1cfefde221a284b))
* **json-crdt-peritext-ui:** 🎸 improve block type toggle implementation ([86001db](https://github.com/streamich/json-joy/commit/86001db44fc87b90e66376d049e552d4b06c128f))
* **json-crdt-peritext-ui:** 🎸 improve display of adjacent line caret destination ([e572e4e](https://github.com/streamich/json-joy/commit/e572e4e1b521a84f9c5470e2d076ddc7fdef6479))
* **json-crdt-peritext-ui:** 🎸 skip markers when moving to adjacent line ([5c0325b](https://github.com/streamich/json-joy/commit/5c0325bc69df5d5e633fe3739479e4051c2df37a))
* **json-crdt-peritext-ui:** 🎸 use absolute x coordinate to compute vertical line moves ([6dc482f](https://github.com/streamich/json-joy/commit/6dc482fb72e6979a387b72ba0b8de185b0dd98e5))

# [17.36.0](https://github.com/streamich/json-joy/compare/v17.35.0...v17.36.0) (2025-03-31)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 correctly format slice type tags ([2903178](https://github.com/streamich/json-joy/commit/290317887b84cc3746af1a3723083440664c8e47))


### Features

* **json-crdt-extensions:** 🎸 implement EditorApi injectable for Editor cursor methods ([779b891](https://github.com/streamich/json-joy/commit/779b8918da277cb44a89c26f1662d5ede3196afa))
* **json-crdt-peritext-ui:** 🎸 add 'line-vert' cursor movement unit ([9d9d4f6](https://github.com/streamich/json-joy/commit/9d9d4f69012bbea6da819c919a11af4cc8aafb70))
* **json-crdt-peritext-ui:** 🎸 add ability to compute point x coordinate on the screen ([9271737](https://github.com/streamich/json-joy/commit/92717370bdb7c5af3d5fb791296a3b9fe8bf90d3))
* **json-crdt-peritext-ui:** 🎸 add ability to move caret to soft line wrap position ([b0660fa](https://github.com/streamich/json-joy/commit/b0660fa7b171b1f787c9c3832d8eb6435937ca02))
* **json-crdt-peritext-ui:** 🎸 add ability to move point-by-point using keyboard ([b17c4ba](https://github.com/streamich/json-joy/commit/b17c4ba00a8d0e3d8b3a0e7e4dd0eb2d2ae8fd7c))
* **json-crdt-peritext-ui:** 🎸 add right EOL indicator to debug mode and fix char pos off ([946900f](https://github.com/streamich/json-joy/commit/946900fae8a2d63c5cb6b816d84d5a42b9cd6681))
* **json-crdt-peritext-ui:** 🎸 compute previous line caret position ([87edfe7](https://github.com/streamich/json-joy/commit/87edfe7740236bfed58e44ddaf8b9fcff4694e1b))
* **json-crdt-peritext-ui:** 🎸 create <CharOverlay> helper for debugging overlays ([6eb56a8](https://github.com/streamich/json-joy/commit/6eb56a83676edbd599d31b6ce64b8efc14d1702c))
* **json-crdt-peritext-ui:** 🎸 display debug button in top toolbar ([1c1ab58](https://github.com/streamich/json-joy/commit/1c1ab58360cdcb48849bc176db1d4c021a0c6d8b))
* **json-crdt-peritext-ui:** 🎸 display word just locations in debug mode ([558f171](https://github.com/streamich/json-joy/commit/558f171f785c4ef6dcfe460a13eb58e7d734346c))
* **json-crdt-peritext-ui:** 🎸 hide cursor inline debug label ([d574fb0](https://github.com/streamich/json-joy/commit/d574fb0cd5b6c109bc6c0b144c5b2c5b09033b34))
* **json-crdt-peritext-ui:** 🎸 highlight characters immediately adjacent to caret ([e4107c1](https://github.com/streamich/json-joy/commit/e4107c175e72da7002f18fc083f574cb82076f79))
* **json-crdt-peritext-ui:** 🎸 implement utility for retrieving line bounds ([93a31ba](https://github.com/streamich/json-joy/commit/93a31ba938b7fbec9b3a64fbd20840fedef8dedf))
* **json-crdt-peritext-ui:** 🎸 improve debug label display ([2b3387e](https://github.com/streamich/json-joy/commit/2b3387ed6e183dad01d6a6c23421576a766355d6))
* **json-crdt-peritext-ui:** 🎸 improve display of block debug labels ([06ae980](https://github.com/streamich/json-joy/commit/06ae980c79614f45100f18a0b730ea5a2af130f9))
* **json-crdt-peritext-ui:** 🎸 improve display of caret adjacent characters ([b9c547b](https://github.com/streamich/json-joy/commit/b9c547b014f8394280dd2094bc03e15d896db6c7))
* **json-crdt-peritext-ui:** 🎸 improve display of debug labels, add small label ability ([fe6d0b1](https://github.com/streamich/json-joy/commit/fe6d0b1ba2ee7e77f3126bfecf21c25efb060d06))
* **json-crdt-peritext-ui:** 🎸 introduce concept of rendering surface API handle ([834f7dc](https://github.com/streamich/json-joy/commit/834f7dcc2ed219fdbef378e984f96b9c4348d643))
* **json-crdt-peritext-ui:** 🎸 make debug plugin enabled state reactive ([5c19869](https://github.com/streamich/json-joy/commit/5c19869578fc053eb2d4ac8b862a7b6f6301c414))
* **json-crdt-peritext-ui:** 🎸 pass through caret Point position ([f7def34](https://github.com/streamich/json-joy/commit/f7def3459fb95e0bc2eaf905ae4a212941715a68))
* **json-crdt-peritext-ui:** 🎸 render caret anchor point ([346a41a](https://github.com/streamich/json-joy/commit/346a41a53ae16c6c0ee1a184e0dfc70d95cbd023))
* **json-crdt-peritext-ui:** 🎸 render prev and next line caret destination in debug mode ([d0dad61](https://github.com/streamich/json-joy/commit/d0dad611f9d73512ef8a7851d470e31f090a4f9d))
* **json-crdt-peritext-ui:** 🎸 render soft line beginning in debug mode ([a1b7f98](https://github.com/streamich/json-joy/commit/a1b7f984faf1062a0bdd32d103e2280cbcc7625d))
* **json-crdt-peritext-ui:** 🎸 show debug labels over inline formatting ([f0b5e0e](https://github.com/streamich/json-joy/commit/f0b5e0e49ecb1dcd7f38751a0735ef21a33a7acd))
* **json-crdt-peritext-ui:** 🎸 show previous and next line boundaries ([3f8a636](https://github.com/streamich/json-joy/commit/3f8a636c08340bf4e0508998a643cfc970761e38))
* **json-crdt-peritext-ui:** 🎸 use the new <CharOverlay> in debug highlighting ([c73013e](https://github.com/streamich/json-joy/commit/c73013eb84e06d51a542f3d3435404eb332c5515))
* **json-crdt-peritext-ui:** 🎸 wire in vertical cursor movement using keyboard ([966c017](https://github.com/streamich/json-joy/commit/966c0175e23191b706f929dd9c099a041772001a))

# [17.35.0](https://github.com/streamich/json-joy/compare/v17.34.0...v17.35.0) (2025-03-25)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 correct batch type ([4e1553b](https://github.com/streamich/json-joy/commit/4e1553bc51cf38fadc8a30cb71838cc90ee2bccd))


### Features

* **json-crdt-peritext-ui:** 🎸 adjust padding ([8b59bb1](https://github.com/streamich/json-joy/commit/8b59bb15cbd77d59378df5bc9e75c78d002fdc2a))
* **json-crdt-peritext-ui:** 🎸 create blocks plugin for Peritext block rendering ([4a23e5c](https://github.com/streamich/json-joy/commit/4a23e5c50a9a948d1a943585bc441c350f292282))
* **json-crdt-peritext-ui:** 🎸 show block type in debug mode ([888e051](https://github.com/streamich/json-joy/commit/888e0514ad4b9fbf4282dea69a93f9b98e26fc8f))
* **json-crdt-peritext-ui:** 🎸 support soft line break inserts ([c14a66c](https://github.com/streamich/json-joy/commit/c14a66ca17ba6033cd47c578da1c55a43983d578))

# [17.34.0](https://github.com/streamich/json-joy/compare/v17.33.0...v17.34.0) (2025-03-24)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly split nested container blocks ([bb87779](https://github.com/streamich/json-joy/commit/bb877795f3c031804818647b7e5c0d781fdd8af0))


### Features

* **json-crdt-extensions:** 🎸 implement anonymouse split in nested container blocks ([9188732](https://github.com/streamich/json-joy/commit/9188732af9f8ea8c84a4788fcea758d517959271))
* **json-crdt-extensions:** 🎸 split deepest container block on [Enter] ([ec7b36f](https://github.com/streamich/json-joy/commit/ec7b36fc8b1335a7dc8204be709e52a3e0d5c66a))

# [17.33.0](https://github.com/streamich/json-joy/compare/v17.32.1...v17.33.0) (2025-03-23)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correct block type discrimination ([15a1f4b](https://github.com/streamich/json-joy/commit/15a1f4bd13a0f745b548a1420c90d3567dd3759d))
* **json-crdt-extensions:** 🐛 corrections after refactor ([f59dac6](https://github.com/streamich/json-joy/commit/f59dac6b79e32b66e5e1c30cb434ded1f204fa36))


### Features

* **json-crdt-extensions:** 🎸 add utilities for manipulating block type ([8199263](https://github.com/streamich/json-joy/commit/8199263bb0b41fdc09143c839e54277d16951e01))
* **json-crdt-extensions:** 🎸 fixup <a> registration ([356387a](https://github.com/streamich/json-joy/commit/356387a6593efde286f45153e1d341048654033d))
* **json-crdt-extensions:** 🎸 improve slice registry endtry definition ([8fcefc8](https://github.com/streamich/json-joy/commit/8fcefc85c1fe7edf1f2ab7e097c0a3fac2b6833b))
* **json-crdt-extensions:** 🎸 introduce discriminants in slice types ([e965960](https://github.com/streamich/json-joy/commit/e965960ac1518b418e7c23d99ee2806d211de9a1))
* **json-crdt-extensions:** 🎸 register block slice types ([2c491bb](https://github.com/streamich/json-joy/commit/2c491bb425a046ef2560a75b50969f0af16068ab))
* **json-crdt-extensions:** 🎸 setup slice registry entry type ([ef8ec10](https://github.com/streamich/json-joy/commit/ef8ec10e51f9ae97f8dfed2502c64186b99c23ab))
* **json-crdt-extensions:** 🎸 update how common path steps are calculated and update type ([22b709a](https://github.com/streamich/json-joy/commit/22b709a08f118283537af777131d9a2eedc798e3))
* **json-crdt-extensions:** 🎸 update inline registry entries ([f39ddb6](https://github.com/streamich/json-joy/commit/f39ddb63657912ab85e5bc9828df09681ca1df1b))
* **json-crdt-extensions:** 🎸 update slice registry ([607fa77](https://github.com/streamich/json-joy/commit/607fa7724f84bd3255d97c2a1607824276d1d655))

## [17.32.1](https://github.com/streamich/json-joy/compare/v17.32.0...v17.32.1) (2025-03-20)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly insert nested nodes ([89a4c94](https://github.com/streamich/json-joy/commit/89a4c9462fb82bf867e9e8f824f39072321ebffb))
* **json-crdt:** 🐛 add behavior to attrs of imported node ([5fb49fe](https://github.com/streamich/json-joy/commit/5fb49fe5399b6d95cd0192da15c8c97f816943f3))

# [17.32.0](https://github.com/streamich/json-joy/compare/v17.31.0...v17.32.0) (2025-03-17)


### Bug Fixes

* **json-crdt:** 🐛 correct Log.undo() for LWW nodes ([c90a0a7](https://github.com/streamich/json-joy/commit/c90a0a7276be919b01ec742ad8b1d368cf406102))


### Features

* **json-crdt-extensions:** 🎸 report insertion spans from Editor ([ce6cbac](https://github.com/streamich/json-joy/commit/ce6cbac42359078fabde30c1d89190ed1737fcea))
* **json-crdt-peritext-ui:** 🎸 add history trackign to more events ([45759a1](https://github.com/streamich/json-joy/commit/45759a1ed0f08ae87bc6e82a7171355ab6b037d4))
* **json-crdt-peritext-ui:** 🎸 add undo/redo top toolbar buttons ([91d117a](https://github.com/streamich/json-joy/commit/91d117a3be6966d76c28c7c8a553f1d6ebb4ed33))
* **json-crdt-peritext-ui:** 🎸 adjust cursor on text insert/delte undo/redo ([a0c565e](https://github.com/streamich/json-joy/commit/a0c565e0ebd4349ba36e7b4f02c0c0f570338b3b))
* **json-crdt-peritext-ui:** 🎸 cleanup undo history implementations ([893d6d3](https://github.com/streamich/json-joy/commit/893d6d3d753912208699b8c4a0f746dd71376118))
* **json-crdt-peritext-ui:** 🎸 implement history redo method ([c777adf](https://github.com/streamich/json-joy/commit/c777adf1c9f160d6762002f569d5b1b7a21a52ea))
* **json-crdt-peritext-ui:** 🎸 implement in-memory undo manager ([38978f9](https://github.com/streamich/json-joy/commit/38978f9db01f33be5bc2cd17f4c730d8b06da9b2))
* **json-crdt-peritext-ui:** 🎸 improve undo manager integration ([d494e05](https://github.com/streamich/json-joy/commit/d494e0599a629b88cba00d6fa537193444412e19))
* **json-crdt-peritext-ui:** 🎸 introduce history undo/redo annals event ([d95814a](https://github.com/streamich/json-joy/commit/d95814a8002c6fc40ea1f29f8be4317eddf7498a))
* **json-crdt-peritext-ui:** 🎸 print debug text for annals controller ([bcaed96](https://github.com/streamich/json-joy/commit/bcaed9681c22a3a9c4f4073a223e1b625ccc0924))
* **json-crdt-peritext-ui:** 🎸 progress on undo manager implementation ([0e9e083](https://github.com/streamich/json-joy/commit/0e9e083d4f42f516801473a6ab26e8a26596e1f9))
* **json-crdt-peritext-ui:** 🎸 save selection and restore it ([3350468](https://github.com/streamich/json-joy/commit/33504680e422e6d4732acec1407d586e72e3b6fb))
* **json-crdt-peritext-ui:** 🎸 setup new undo controller ([53b50fa](https://github.com/streamich/json-joy/commit/53b50fab237001c96a6fdd7d64eaba914a2710c8))
* **json-crdt-peritext-ui:** 🎸 update undo setup ([b6f1119](https://github.com/streamich/json-joy/commit/b6f1119008ef583954666c86b795fb095f0c257f))
* **json-crdt:** 🎸 add ability to replay log until patch non-inclusively ([6770ffc](https://github.com/streamich/json-joy/commit/6770ffc14d32277e933f9525433774df2497e571))
* **json-crdt:** 🎸 add ability to retireve a partial view of as span in RGA ([80603ae](https://github.com/streamich/json-joy/commit/80603ae59e57ded3743802d88965da5e6da8267e))
* **json-crdt:** 🎸 allow immediate drain on autoflush ([a7a2e76](https://github.com/streamich/json-joy/commit/a7a2e7694956fe07b41117cb0eb9d49e5a65ae43))
* **json-crdt:** 🎸 implement .prevId() utility ([5905bfd](https://github.com/streamich/json-joy/commit/5905bfdbd776366bdfccdb417adbe09dc62729e5))
* **json-crdt:** 🎸 implement "arr" node undo ([d6d564d](https://github.com/streamich/json-joy/commit/d6d564d67bd7e4e9662a0e50020b506524400220))
* **json-crdt:** 🎸 implement "bin" node deletion undo ([c33a0a5](https://github.com/streamich/json-joy/commit/c33a0a5d868a483f1ac399f3fec596a855fce8cd))
* **json-crdt:** 🎸 implement string deletion undo in Log ([348ab2c](https://github.com/streamich/json-joy/commit/348ab2c920e33cbf1b6ba8f350ff56ef89823e44))
* **json-crdt:** 🎸 improve Log construction API ([29633d4](https://github.com/streamich/json-joy/commit/29633d41b339513cf670771993df0cf1444aeb50))
* **json-crdt:** 🎸 start .undo() implementation ([d34dca8](https://github.com/streamich/json-joy/commit/d34dca8d85636e6dbb58749cddc6627567a728a9))


### Performance Improvements

* **json-crdt-peritext-ui:** ⚡️ do not track of undo element text length ([7844476](https://github.com/streamich/json-joy/commit/784447643f0b613e64e7c237c60c8a81810e8480))

# [17.31.0](https://github.com/streamich/json-joy/compare/v17.30.0...v17.31.0) (2025-03-11)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 bump very-small-parser dependency ([eb79932](https://github.com/streamich/json-joy/commit/eb799323076c8e343cfb605602bb12d442d17648))
* **json-crdt-peritext-ui:** 🐛 refresh slices after initial text insert ([ba69a9f](https://github.com/streamich/json-joy/commit/ba69a9f48c957571a85eecdd5ed084821015992e))


### Features

* **json-crdt-extensions:** 🎸 implement .importFormatting() utility ([b3e9fc9](https://github.com/streamich/json-joy/commit/b3e9fc9ed75830f7366ac452a871bb9a6ceb9cef))
* **json-crdt-peritext-ui:** 🎸 add support for formatting-only clipboard events ([a72dbd8](https://github.com/streamich/json-joy/commit/a72dbd8efcb9f39b7cbcaced1f5ac05f2ca0dad2))
* **json-crdt-peritext-ui:** 🎸 automatically detect style paste on regular paste ([66a743f](https://github.com/streamich/json-joy/commit/66a743f630e89f314f427cea8ca6c3de65f7b8bb))
* **json-crdt-peritext-ui:** 🎸 copy style information only on caret copy ([ba5344f](https://github.com/streamich/json-joy/commit/ba5344fc6e26edb75eed3df32f647d3b28b123ee))
* **json-crdt-peritext-ui:** 🎸 create utility for data transfer construction ([cae51a2](https://github.com/streamich/json-joy/commit/cae51a27ee17af93eb97d711dc52b2ff03004df6))
* **json-crdt-peritext-ui:** 🎸 implement formatting only export ([8c290c1](https://github.com/streamich/json-joy/commit/8c290c14a0c833e6377f8baef6c1c1cec6e3a20f))

# [17.30.0](https://github.com/streamich/json-joy/compare/v17.29.1...v17.30.0) (2025-03-08)


### Bug Fixes

* 🐛 correctsion for generics in Block and Fragment ([76e28d8](https://github.com/streamich/json-joy/commit/76e28d8416e8dd261777910f88c5b3916dfaba60))
* **json-crdt-extensions:** 🐛 correctly strip first split marker ([2259621](https://github.com/streamich/json-joy/commit/22596219ac1ac6f1de3d02c80e615c905ed8e213))


### Features

* **json-crdt-extensions:** 🎸 add generics to Fragment and Block classes ([95ae714](https://github.com/streamich/json-joy/commit/95ae714d123cb189dd0b9fcefef0061ea30756f6))
* **json-crdt-extensions:** 🎸 add initial PeritextDataTransfer implementation ([88a2460](https://github.com/streamich/json-joy/commit/88a2460842a65f82e32696fd917640f776cb6801))
* **json-crdt-extensions:** 🎸 cleanly merge blocks on paste ([44afc93](https://github.com/streamich/json-joy/commit/44afc9320a9e29175e181ca0570e90c103adfacd))
* **json-crdt-extensions:** 🎸 ignore empty inline tags ([7a14aff](https://github.com/streamich/json-joy/commit/7a14affd1b143183244c2c0d28c199db9e3d6831))
* **json-crdt-extensions:** 🎸 implement data transfer HTML import functionality ([a9d6bd0](https://github.com/streamich/json-joy/commit/a9d6bd064d583b85752eae9124490393c070ca71))
* **json-crdt-extensions:** 🎸 improve html parsing to Peritext format ([1246cd6](https://github.com/streamich/json-joy/commit/1246cd6b6d3092941798f4a0e89f945fb4ce3155))
* **json-crdt-extensions:** 🎸 report import string length ([bb6eb54](https://github.com/streamich/json-joy/commit/bb6eb543ed7448f1ddb0e31b9ea418b0f0ba7d31))
* **json-crdt-extensions:** 🎸 treat "_" character as letter in word selection ([0d47b44](https://github.com/streamich/json-joy/commit/0d47b447a9c94c6e4afbc983da0b41cfcbc19556))
* **json-crdt-peritext-ui:** 🎸 add cleanup section to selection floating menu ([0c04d08](https://github.com/streamich/json-joy/commit/0c04d08ecf5eca5e04c249ea43dc5ad376849f63))
* **json-crdt-peritext-ui:** 🎸 add clipboard buffer events interfaces ([f13c506](https://github.com/streamich/json-joy/commit/f13c5061a418e6dd4f937f5355fd32adf5749b92))
* **json-crdt-peritext-ui:** 🎸 add event emitters for all clipboard events ([13b6828](https://github.com/streamich/json-joy/commit/13b6828dab16e8e4d611186062fee23ef80c430e))
* **json-crdt-peritext-ui:** 🎸 cleanup rich text clipboard implementation ([38dd466](https://github.com/streamich/json-joy/commit/38dd466128dbb4a4e223a079c9e6941f3320c989))
* **json-crdt-peritext-ui:** 🎸 correct rich-text copy implementation ([0d08117](https://github.com/streamich/json-joy/commit/0d08117ebf00e148f74e4cc70e27e2e72cee74e4))
* **json-crdt-peritext-ui:** 🎸 create modify menu and add clipboard menu ([609e37d](https://github.com/streamich/json-joy/commit/609e37de893a8a0c869054ace44e57be825760ef))
* **json-crdt-peritext-ui:** 🎸 disable inline toolbar on blur ([7771770](https://github.com/streamich/json-joy/commit/7771770f7a5ab76bbf03d09d76f6f57b7c93d025))
* **json-crdt-peritext-ui:** 🎸 expose many export formats ([7d4f70f](https://github.com/streamich/json-joy/commit/7d4f70f38fc466f05f8b02bf5173103fd67a2581))
* **json-crdt-peritext-ui:** 🎸 expose state through prop ([fd03c88](https://github.com/streamich/json-joy/commit/fd03c88c763b794853ea162c440adeeada156c66))
* **json-crdt-peritext-ui:** 🎸 generalize "Copy as ..." and "Cut as ..." menu ([d4926d2](https://github.com/streamich/json-joy/commit/d4926d26f5a2f08ce4b13f07a2349dd2b3b157e7))
* **json-crdt-peritext-ui:** 🎸 harden plain text clipboard write implementation ([465d7f7](https://github.com/streamich/json-joy/commit/465d7f7b203fbf481ef31b62b388191f802a02b1))
* **json-crdt-peritext-ui:** 🎸 implement basic copy-to-clipboard button ([147cf18](https://github.com/streamich/json-joy/commit/147cf18158e50017dcac7c280dd7bc2fda48cf56))
* **json-crdt-peritext-ui:** 🎸 implement clipboard facade ([6085fa3](https://github.com/streamich/json-joy/commit/6085fa3887597185d2b8a9dc4d55386e9dcadcd0))
* **json-crdt-peritext-ui:** 🎸 implement copy as HTML functionality ([c29823e](https://github.com/streamich/json-joy/commit/c29823e4bedb5519233b8aa1c8c790e154816404))
* **json-crdt-peritext-ui:** 🎸 implement DOM "copy" and "cut" events ([e58b3d0](https://github.com/streamich/json-joy/commit/e58b3d0a3c2144b3eb8eed96952fb1df865976af))
* **json-crdt-peritext-ui:** 🎸 implement HTML export using data transfer class ([1cfd8ba](https://github.com/streamich/json-joy/commit/1cfd8bab607a8db88109a60c984ca12c48947c47))
* **json-crdt-peritext-ui:** 🎸 implement Markdown data transfer ([ee65e46](https://github.com/streamich/json-joy/commit/ee65e462732c48c8fa4a5b6703a5e7ff0b1a5013))
* **json-crdt-peritext-ui:** 🎸 implement synchronous copyt-to-clipboard method ([dd34387](https://github.com/streamich/json-joy/commit/dd34387869289c4f47b883440690fafbf7591266))
* **json-crdt-peritext-ui:** 🎸 implement text-only copy event ([5e5efc1](https://github.com/streamich/json-joy/commit/5e5efc12f901997200e2d22c6f863fc1f8b1ac03))
* **json-crdt-peritext-ui:** 🎸 implement text-only paste ([dca97ea](https://github.com/streamich/json-joy/commit/dca97eac77e478ab115ad887155688cbbd94067e))
* **json-crdt-peritext-ui:** 🎸 improve "Copy as ..." context menu ([54d4f36](https://github.com/streamich/json-joy/commit/54d4f367030b8bf141ae024390cc96482f77e267))
* **json-crdt-peritext-ui:** 🎸 improve clipboard export types ([9810c0b](https://github.com/streamich/json-joy/commit/9810c0b6dc397477012adaae0770b5efce5fcc26))
* **json-crdt-peritext-ui:** 🎸 improve clipboard interface ([372a1d7](https://github.com/streamich/json-joy/commit/372a1d7e4c750c9f16bd17eb8046067d44ec6d99))
* **json-crdt-peritext-ui:** 🎸 improve HTML export and import ([a66038c](https://github.com/streamich/json-joy/commit/a66038ca8b572beee9061289a219677d7db53f18))
* **json-crdt-peritext-ui:** 🎸 improve paste context menu ([6e717e8](https://github.com/streamich/json-joy/commit/6e717e802cfbba1e6cb2083a80e57c63b4d68937))
* **json-crdt-peritext-ui:** 🎸 improve paste event handling ([19cd530](https://github.com/streamich/json-joy/commit/19cd530b6904dedc497e2b742cee98612317c138))
* **json-crdt-peritext-ui:** 🎸 move cursor after "paste" event ([0c0f7ad](https://github.com/streamich/json-joy/commit/0c0f7ad3556e14cce0c2ac062f211e1f3506e728))
* **json-crdt-peritext-ui:** 🎸 setup "cut" event ([82258bf](https://github.com/streamich/json-joy/commit/82258bf485d4cba7328a36cd1e1a55f6ffd83de4))
* **json-crdt-peritext-ui:** 🎸 setup clipboard event implementation ([b2f895c](https://github.com/streamich/json-joy/commit/b2f895c8862f62eb4d6fc40c3438c98a727d45ad))
* **json-crdt-peritext-ui:** 🎸 setup codebase for paste events ([570baa8](https://github.com/streamich/json-joy/commit/570baa80b05065ac82c695a4145ae7359be71df3))

## [17.29.1](https://github.com/streamich/json-joy/compare/v17.29.0...v17.29.1) (2025-02-21)


### Bug Fixes

* **json-crdt:** 🐛 return specific type from getSnapshot() ([17aaefe](https://github.com/streamich/json-joy/commit/17aaefe5691af208b4d0b30b72d12532b4f744f7))

# [17.29.0](https://github.com/streamich/json-joy/compare/v17.28.0...v17.29.0) (2025-02-15)


### Features

* **json-crdt-extensions:** 🎸 add math block annotation ([437b16a](https://github.com/streamich/json-joy/commit/437b16a9bd27cec35aaddce5ef5e94b0f040d84c))
* **json-crdt-extensions:** 🎸 add methods for inline attributes ([f1edc12](https://github.com/streamich/json-joy/commit/f1edc1231823a411cb16d7f60bc8f9d86378124e))
* **json-crdt-peritext-ui:** 🎸 add overline inline formatting support ([f3070a5](https://github.com/streamich/json-joy/commit/f3070a530b2f1492231654a392a61ca26d8c7d5f))
* **json-crdt-peritext-ui:** 🎸 enable actions in floating menu ([e8a5298](https://github.com/streamich/json-joy/commit/e8a5298e4bc900c83bc55e9106a66919d470f92c))
* **json-crdt-peritext-ui:** 🎸 improve <del> inline formatting styling ([973ec8e](https://github.com/streamich/json-joy/commit/973ec8ee538d9e6be993498738049c655662218d))
* **json-crdt-peritext-ui:** 🎸 improve <spoiler> inline tag rendering ([3dccf69](https://github.com/streamich/json-joy/commit/3dccf693d3fd33af6b91de90f46b37ca5549395c))
* **json-crdt-peritext-ui:** 🎸 improve caret visibility on dark background ([b9a2154](https://github.com/streamich/json-joy/commit/b9a2154959dd3c92790bee70de69c93135e600dd))
* **json-crdt-peritext-ui:** 🎸 improve styling of <ins> formatting ([bf0388b](https://github.com/streamich/json-joy/commit/bf0388beb9067fc869d4e3161c8ad42a8a54659f))
* **json-crdt-peritext-ui:** 🎸 make highlight selection visible ([26d5b47](https://github.com/streamich/json-joy/commit/26d5b47f6a1327e99a0bafbaab5b29ec0a8b6fa8))
* **json-crdt-peritext-ui:** 🎸 make inline <code> background color dynamic ([1098198](https://github.com/streamich/json-joy/commit/109819875eaebd2e481c18c013e8d04fed8eca98))
* **json-crdt-peritext-ui:** 🎸 render <kbd> inline annotation ([97f9f3a](https://github.com/streamich/json-joy/commit/97f9f3a5f1a755b75a2d9d51d734c2ead201042c))
* **json-crdt-peritext-ui:** 🎸 use inline element positions to correctly render <code> ([1f86092](https://github.com/streamich/json-joy/commit/1f8609271ca867cd0adf5bad82a4de12f911ff8b))

# [17.28.0](https://github.com/streamich/json-joy/compare/v17.27.0...v17.28.0) (2025-02-14)


### Features

* **json-crdt-peritext-ui:** 🎸 add bolding action ([fca722a](https://github.com/streamich/json-joy/commit/fca722a5f8086cabb039baf3f7b0b3415458b673))
* **json-crdt-peritext-ui:** 🎸 add cooldown for disable status when floating menu appears ([9998a33](https://github.com/streamich/json-joy/commit/9998a33eb1d78681917283552fe80152d310f78d))
* **json-crdt-peritext-ui:** 🎸 add dependency list to timeout hook ([da73151](https://github.com/streamich/json-joy/commit/da731512211a570779041149cb89107d4c9ea7bc))
* **json-crdt-peritext-ui:** 🎸 advance on facus selection floating toobar ([6c70a7e](https://github.com/streamich/json-joy/commit/6c70a7e23958ab55b16134d11692abdd12e94f34))
* **json-crdt-peritext-ui:** 🎸 delay showing floating menus ([2fc72c5](https://github.com/streamich/json-joy/commit/2fc72c54d38525852792dbbcaa4497c294a9d7a7))
* **json-crdt-peritext-ui:** 🎸 do not change cursor position when editor blurred ([736d8e8](https://github.com/streamich/json-joy/commit/736d8e8addad0fd8c5f34c0b4fc8ba2b85418bfa))
* **json-crdt-peritext-ui:** 🎸 do not emite change event if old value strictly same ([c221a77](https://github.com/streamich/json-joy/commit/c221a77e16cfc1943ddf5e8d4cf72657f09dbe71))
* **json-crdt-peritext-ui:** 🎸 do not show focus floating menu when scrubbing ([50a5cfb](https://github.com/streamich/json-joy/commit/50a5cfbc767e1c4103ed11c389c4dad87e8a1df7))
* **json-crdt-peritext-ui:** 🎸 do not show focus floating menu while mouse down ([8b1c7b1](https://github.com/streamich/json-joy/commit/8b1c7b1486b5590c15b955a819e3bd22f4eb5fcc))
* **json-crdt-peritext-ui:** 🎸 hide floating menu when focus blurred ([621e4d2](https://github.com/streamich/json-joy/commit/621e4d2381d9a0c2d111e3c3dd120d53c5f14371))
* **json-crdt-peritext-ui:** 🎸 improve caret toolbar event tracking ([26ccfab](https://github.com/streamich/json-joy/commit/26ccfab5fc9ebc4ecbd044c3c04b0da1aed30a72))
* **json-crdt-peritext-ui:** 🎸 improve on floating menus ([8b4afde](https://github.com/streamich/json-joy/commit/8b4afdecc56c7ae2746e7cd03fce21bb9fad9496))
* **json-crdt-peritext-ui:** 🎸 improve toolbar state management ([549253e](https://github.com/streamich/json-joy/commit/549253eb7012519a9fc16f0665be32902f9b5aa0))
* **json-crdt-peritext-ui:** 🎸 introduce Peritext rendering surface API abstraction ([ae4926d](https://github.com/streamich/json-joy/commit/ae4926d947d161d53dc9c360ea10e3c7a11f1465))
* **json-crdt-peritext-ui:** 🎸 make mouse down state reactive ([cf05b3a](https://github.com/streamich/json-joy/commit/cf05b3aba07fedcd5241efcc118894d59f27f2f3))
* **json-crdt-peritext-ui:** 🎸 modularize the timeout component ([dfbfa9c](https://github.com/streamich/json-joy/commit/dfbfa9c1801857355a7f080ddda7cde6cab4fc66))
* **json-crdt-peritext-ui:** 🎸 re-focus on item click ([d7b4fae](https://github.com/streamich/json-joy/commit/d7b4fae0793739ba082ebd12f08bce3535e533dd))
* **json-crdt-peritext-ui:** 🎸 setup selection above-focus rendering ([478ed93](https://github.com/streamich/json-joy/commit/478ed93a03eebe5e6a20cb283500b86b7d5a9017))
* **json-crdt-peritext-ui:** 🎸 start focus floating menu implementation ([89b4956](https://github.com/streamich/json-joy/commit/89b49563c926e34f2cce23760d6361d914d2cf27))
* **json-crdt-peritext-ui:** 🎸 track state of caret visibility ([5f98238](https://github.com/streamich/json-joy/commit/5f98238c7c728a05ee2ff8d29d43567063bfaa27))
* **json-crdt-peritext-ui:** 🎸 update nice-ui dependency ([8649c71](https://github.com/streamich/json-joy/commit/8649c71481aab3648f29fe3ecf26b17bd4b7c0ec))

# [17.27.0](https://github.com/streamich/json-joy/compare/v17.26.1...v17.27.0) (2025-02-14)


### Features

* 🎸 bump sonic-forest dependency ([525a050](https://github.com/streamich/json-joy/commit/525a0506aaf51f77caea3bc8040897fd4ca668df))

## [17.26.1](https://github.com/streamich/json-joy/compare/v17.26.0...v17.26.1) (2025-02-05)


### Bug Fixes

* **json-patch-ot:** bug when transforming str_del with len ([9d4102b](https://github.com/streamich/json-joy/commit/9d4102b6b7fc016b147671939b1e01907e7ef9dd))
* **json-patch:** create deep copy of "replace" operation value ([e84449b](https://github.com/streamich/json-joy/commit/e84449bf78a193b4aeedf234f9004ed542a22d5d))

# [17.26.0](https://github.com/streamich/json-joy/compare/v17.25.0...v17.26.0) (2025-01-18)


### Features

* **json-crdt-extensions:** 🎸 add more slice types ([ee4081b](https://github.com/streamich/json-joy/commit/ee4081b13884b1f1d2c75ea2a99e37979fdeb78d))
* **json-crdt-peritext-ui:** 🎸 create a class for storing peritext surface data ([f8255f5](https://github.com/streamich/json-joy/commit/f8255f5aaf713200a83a445e8b50660c6a36ea19))
* **json-crdt-peritext-ui:** 🎸 improve event handling ([84ddd8a](https://github.com/streamich/json-joy/commit/84ddd8ac65db2321c5edc2ccea137b799dd4e5a4))
* **json-crdt-peritext-ui:** 🎸 improve inline menu presentation logic ([ddb032b](https://github.com/streamich/json-joy/commit/ddb032b020fd8ea02b0869f760e45fcbf843cc0b))
* **json-crdt-peritext-ui:** 🎸 make DOM controller optional ([b9d73b0](https://github.com/streamich/json-joy/commit/b9d73b07b151ede90a216c7adf85e0d2621908f5))
* **json-crdt-peritext-ui:** 🎸 position caret floating menu ([874bced](https://github.com/streamich/json-joy/commit/874bcedc80a50c66938d35e5680a3ac1c541eb09))
* **json-crdt-peritext-ui:** 🎸 restructure dependencies to explicitly construct events ([54f0d22](https://github.com/streamich/json-joy/commit/54f0d22268012214d76f52fd94af07af30ed20c4))
* **json-crdt-peritext-ui:** 🎸 start inline menu incorporation ([8a19a6f](https://github.com/streamich/json-joy/commit/8a19a6f742780cd96548bd39960fd6130c9148bd))
* **json-crdt-peritext-ui:** 🎸 use the new surface context state value ([a14f2aa](https://github.com/streamich/json-joy/commit/a14f2aae6394e81f049fb2596a74e3b9c53627cc))
* **json-crdt:** 🎸 issue demo ([d022015](https://github.com/streamich/json-joy/commit/d022015e38fd009602b37a5e007edb92198affc5))

# [17.25.0](https://github.com/streamich/json-joy/compare/v17.24.0...v17.25.0) (2025-01-06)


### Bug Fixes

* **json-crdt-extensions:** 🐛 improve how block elements are imported ([9954c69](https://github.com/streamich/json-joy/commit/9954c69f72a7b14588d476078f94cad54116be39))
* **json-crdt-extensions:** 🐛 skip first empty virtual block ([b257f2e](https://github.com/streamich/json-joy/commit/b257f2e7ef02b365703cd2042d4e2afc4069f87e))


### Features

* **json-crdt-extensions:** 🎸 harden HTML import ([594ed9a](https://github.com/streamich/json-joy/commit/594ed9ada6c56c198f2e7326f8f7ec991d50de45))
* **json-crdt-extensions:** 🎸 import Markdown import ([f117025](https://github.com/streamich/json-joy/commit/f117025756c80ae18095fab412e150843b5f14f0))
* **json-crdt-extensions:** 🎸 improve HTML import ([b142e28](https://github.com/streamich/json-joy/commit/b142e28c2e8e061114c6b8f9e8b0965366d12e62))
* **json-crdt-extensions:** 🎸 improve HTML import ([a05b09b](https://github.com/streamich/json-joy/commit/a05b09bb11892bad9ac5e2ee9c070f310a976c13))
* **json-crdt-extensions:** 🎸 improve slice registry typing ([acfe769](https://github.com/streamich/json-joy/commit/acfe769bba6da4b677ecc70bff65012ccf8d3e4a))
* **json-crdt-extensions:** 🎸 improve slice type def types ([7248c8c](https://github.com/streamich/json-joy/commit/7248c8c1301894bd62b901f5a19c1ba10fccd7e7))
* **json-crdt-extensions:** 🎸 populate registry with inline slice types ([5196bd6](https://github.com/streamich/json-joy/commit/5196bd636c648a87239ac705241644ee3a81f7df))
* **json-crdt-extensions:** 🎸 progress on type registry implementation ([d239803](https://github.com/streamich/json-joy/commit/d239803aee500a2f801b9a5cf830f74829b52b77))
* **json-crdt-extensions:** 🎸 use registry in HTML import ([4888ee5](https://github.com/streamich/json-joy/commit/4888ee567ba5b1449df03faeaa2b07324f498639))

# [17.24.0](https://github.com/streamich/json-joy/compare/v17.23.0...v17.24.0) (2024-12-22)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly compute annotations endpoints in import() ([35f6df2](https://github.com/streamich/json-joy/commit/35f6df25a400735d276e268970daf93189906cac))


### Features

* **json-crdt-extensions:** 🎸 at import do not include ABS start in annotation range ([b344e14](https://github.com/streamich/json-joy/commit/b344e1458fe22cbc056554282c10bb1518b41edb))
* **json-crdt-extensions:** 🎸 export only saved slices ([86d051e](https://github.com/streamich/json-joy/commit/86d051e89bb8e9faeb315d66d2a4ecdd1edcd646))
* **json-crdt-extensions:** 🎸 implement block split import ([3d21330](https://github.com/streamich/json-joy/commit/3d21330452f31cecd14d02e138c4bb229a0ee79a))
* **json-crdt-extensions:** 🎸 make sure annotation end point is never ABS end ([6bd882e](https://github.com/streamich/json-joy/commit/6bd882ebd9363854cd549ebcbe98c995b0331963))

# [17.23.0](https://github.com/streamich/json-joy/compare/v17.22.0...v17.23.0) (2024-12-21)


### Bug Fixes

* **json-crdt-extensions:** 🐛 improve framment block and inline element trancation ([716589c](https://github.com/streamich/json-joy/commit/716589c46a9c13bde0f2df9762a41ecdd8daa775))


### Features

* **json-crdt-extensions:** 🎸 implement export to HTML ([ae57070](https://github.com/streamich/json-joy/commit/ae57070b2dbfc9cdcedaf52404ad805524499522))
* **json-crdt-extensions:** 🎸 improve iteration over markers in the Overlay class ([2eaa85d](https://github.com/streamich/json-joy/commit/2eaa85d515ebe6543bcb33dd6273a45c45fa7271))

# [17.22.0](https://github.com/streamich/json-joy/compare/v17.21.0...v17.22.0) (2024-12-01)


### Features

* 🎸 add identation formatting ability ([8b47358](https://github.com/streamich/json-joy/commit/8b473580501b8da73e3e356db687b59f5484e6ef))
* 🎸 improve json-ml types ([a071f3c](https://github.com/streamich/json-joy/commit/a071f3c417db304c3a3f09fffdaa76057305dfe8))
* **json-crdt-extensions:** 🎸 add ability to export to HTML ([f51f6cc](https://github.com/streamich/json-joy/commit/f51f6cc7eb38c6e04b05c13c74c4034e4fd54f2c))
* **json-crdt-extensions:** 🎸 add ability to import serialized view range ([43ad61d](https://github.com/streamich/json-joy/commit/43ad61de7a30f09c265f716d11573898ef139472))
* **json-crdt-extensions:** 🎸 do not create props objects, when not necessary ([7071ada](https://github.com/streamich/json-joy/commit/7071ada137b7ab2349a0f49875073b8447f2808d))
* **json-crdt-extensions:** 🎸 improve JSOM-ML generation for block nodes ([fb45ba7](https://github.com/streamich/json-joy/commit/fb45ba71f150766900572fd5fa05a5a6282843c3))
* **json-crdt-extensions:** 🎸 improve to JSON-ML export ([b3e7e5c](https://github.com/streamich/json-joy/commit/b3e7e5c87f5dd90e4389563a4ec84847f9077489))
* **json-crdt-extensions:** 🎸 improve toJson exports ([ef5327e](https://github.com/streamich/json-joy/commit/ef5327e5bad2b6bcad431a4ffe6b7237978204f4))
* **json-crdt-extensions:** 🎸 simplify export view range interface ([0b8c7b7](https://github.com/streamich/json-joy/commit/0b8c7b764d48860c57c748dd23f2edd194f88c49))
* **json-crdt-extensions:** 🎸 start .toJson() implementation ([a8ec0b1](https://github.com/streamich/json-joy/commit/a8ec0b1df8e7937b59a393e74f4b6344637be44a))
* **json-crdt-extensions:** 🎸 start fragment serialization implementation ([519115a](https://github.com/streamich/json-joy/commit/519115a2263777b69dbc88e603fdf2d3a6975e5e))
* **json-crdt-extensions:** 🎸 start serialization implementation ([f9bc89e](https://github.com/streamich/json-joy/commit/f9bc89ebccf5803358c2b74e1d5a476a94cabea9))

# [17.21.0](https://github.com/streamich/json-joy/compare/v17.20.0...v17.21.0) (2024-11-25)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 correct React warnings ([5d90876](https://github.com/streamich/json-joy/commit/5d908765d9d049e8eeda908b197e720ed878b848))


### Features

* **json-crdt-extensions:** 🎸 add first implementation of Fragment ([340919a](https://github.com/streamich/json-joy/commit/340919a9c6f5d63c2d62af8a6f08b246468cc935))
* **json-crdt-extensions:** 🎸 add JSON markup language utilities ([bdf4deb](https://github.com/streamich/json-joy/commit/bdf4debd2d63614494111e3e4d7d6bfc560ca30c))
* **json-crdt-extensions:** 🎸 add JSON ML walk method ([cec7865](https://github.com/streamich/json-joy/commit/cec78657633f86af08ff049495f058f4536b3963))
* **json-crdt-extensions:** 🎸 add more block elements ([b155ae3](https://github.com/streamich/json-joy/commit/b155ae362ad38cb75c954f2df6f10605566de112))
* **json-crdt-extensions:** 🎸 cap all blocks to their range ([efd088a](https://github.com/streamich/json-joy/commit/efd088ad33d4b9ce246b4c9cb3e68ec2575ebf6a))
* **json-crdt-extensions:** 🎸 clamp Inline elements inside a Fragment ([e8ee319](https://github.com/streamich/json-joy/commit/e8ee319f70bc86fa1195338596ebc6eda73229dc))
* **json-crdt-extensions:** 🎸 create constant enum for slice types ([02b9581](https://github.com/streamich/json-joy/commit/02b958130471ff4e6334f3140378e1f77114b002))
* **json-crdt-extensions:** 🎸 improve Fragment code setup ([3d2ef77](https://github.com/streamich/json-joy/commit/3d2ef7734598395a7550cf8f1d23c4064d3cb8f1))
* **json-crdt-extensions:** 🎸 setup export methods ([f75284d](https://github.com/streamich/json-joy/commit/f75284d88ec66f56fc5c13f0560760a192d564c8))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ do not pre-compute chunk slices ([7bf4f93](https://github.com/streamich/json-joy/commit/7bf4f9384d76554604d725fed936b2e060b265fb))

# [17.20.0](https://github.com/streamich/json-joy/compare/v17.19.0...v17.20.0) (2024-11-14)


### Features

* **json-crdt-extensions:** 🎸 add cursor cardinality method ([ed808ce](https://github.com/streamich/json-joy/commit/ed808ce6060222d04c32ecb254f7c2cae0c2699d))
* **json-crdt-peritext-ui:** 🎸 add ability to render something over caret ([894a21e](https://github.com/streamich/json-joy/commit/894a21e5326b18c03f18a7ccdd1581be570e1e57))
* **json-crdt-peritext-ui:** 🎸 add extension point which allows to render over caret ([fa9c5bc](https://github.com/streamich/json-joy/commit/fa9c5bc53c26463143f077d8417250fce7c1cc8b))
* **json-crdt-peritext-ui:** 🎸 add some basic buttons ([b1fe9c1](https://github.com/streamich/json-joy/commit/b1fe9c1dc0557ac512808f9af84c7c20abe8e046))
* **json-crdt-peritext-ui:** 🎸 make plugins composable class instances ([e5f233c](https://github.com/streamich/json-joy/commit/e5f233c8ac50e054a9adccbb7397deabed050e21))
* **json-crdt-peritext-ui:** 🎸 render something over caret ([d6dfbfd](https://github.com/streamich/json-joy/commit/d6dfbfdfd103fd71ec4ea214f435c9ce5b85e6da))
* **json-crdt-peritext-ui:** 🎸 tweak caret hover toolbar ([95d0502](https://github.com/streamich/json-joy/commit/95d050250abc02fec1d7992b050768134f3acc70))

# [17.19.0](https://github.com/streamich/json-joy/compare/v17.18.0...v17.19.0) (2024-11-12)


### Features

* 🎸 bring back ESM builds ([a0dc6a2](https://github.com/streamich/json-joy/commit/a0dc6a237c8b4eb2e05c245928f1bda2a424a778))

# [17.18.0](https://github.com/streamich/json-joy/compare/v17.17.0...v17.18.0) (2024-11-12)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 do not break line at caret position ([d4598ce](https://github.com/streamich/json-joy/commit/d4598ce4867f6229b38842858263cc0c0129c24d))
* **json-crdt-peritext-ui:** 🐛 do not break line on anchor inter-word insertion ([4c4d1ca](https://github.com/streamich/json-joy/commit/4c4d1cab783b735f4d4e62f2922233ebd1705727))
* **json-crdt-peritext-ui:** 🐛 do not break words due to focus edge ([182fcbb](https://github.com/streamich/json-joy/commit/182fcbb7d6c80862c8bae8cf02b1ba2104b9659d))


### Features

* **json-crdt-extensions:** 🎸 print cursors in editor dump ([449c3e5](https://github.com/streamich/json-joy/commit/449c3e53ed568385a95511a2c5997b75d40777f4))
* **json-crdt-peritext-ui:** 🎸 create `cursor` plugin ([43e86c6](https://github.com/streamich/json-joy/commit/43e86c68adf359fe3ef30826c28b70293b7c7639))
* **json-crdt-peritext-ui:** 🎸 improve anchor rendering ([7343d52](https://github.com/streamich/json-joy/commit/7343d52dd5acbe0e158ba0bb2b59b44f2b5d67c3))
* **json-crdt-peritext-ui:** 🎸 improve cursor JSDocs ([4d9df82](https://github.com/streamich/json-joy/commit/4d9df821dd34cbbfe34575072737ebeeeb8643d0))
* **json-crdt-peritext-ui:** 🎸 separate caret score into its own component ([f69e93e](https://github.com/streamich/json-joy/commit/f69e93e2896460c0f4abc1ef2f94fd1420bc7859))
* **json-crdt-peritext-ui:** 🎸 setup default theme ([a3ddfa9](https://github.com/streamich/json-joy/commit/a3ddfa9161668596fc73a79d4043088ec17d402d))

# [17.17.0](https://github.com/streamich/json-joy/compare/v17.16.0...v17.17.0) (2024-11-11)


### Bug Fixes

* **json-crdt-extensions:** 🐛 correctly delete when in range selection ([02103b6](https://github.com/streamich/json-joy/commit/02103b635ceab350bcf69459dac4fff1ed72d4ee))
* **json-crdt-extensions:** 🐛 on unite selection at current position, always focus end ([0133eb8](https://github.com/streamich/json-joy/commit/0133eb86f70928f261b92d4c4f662c7c7bc32f27))
* **json-crdt-peritext-ui:** 🐛 correct types for event map ([397b57d](https://github.com/streamich/json-joy/commit/397b57df76c274177eb456a61c70ea28873d32fa))
* **json-crdt-peritext-ui:** 🐛 fixup caret rendering for spacious lines ([464c9a6](https://github.com/streamich/json-joy/commit/464c9a68080bc1b436fe45f7dd74099d6c2a046e))
* **json-crdt-peritext-ui:** 🐛 make sure collapsed cursors are proper "after" carets ([2c1714b](https://github.com/streamich/json-joy/commit/2c1714b198a854f593c94a30f506fa4b88be24ee))


### Features

* **json-crdt-extensions:** 🎸 add <kbd> inline annotation ([0abc25e](https://github.com/streamich/json-joy/commit/0abc25e4c8b7aadd43d9a726d8ad46721f4eb76c))
* **json-crdt-extensions:** 🎸 add ability to find current block marker ([3700013](https://github.com/streamich/json-joy/commit/3700013039cd907808e28d9469af83438a60e1dc))
* **json-crdt-extensions:** 🎸 improve block split insertion logic ([ce233cc](https://github.com/streamich/json-joy/commit/ce233cce20b7225e1ed855c98576818c3919e8e4))
* **json-crdt-extensions:** 🎸 improve cursor collapsing logic ([d9b3d4f](https://github.com/streamich/json-joy/commit/d9b3d4f382893f312719ec1f0e385759e160de36))
* **json-crdt-extensions:** 🎸 improve deletion ([59ec4eb](https://github.com/streamich/json-joy/commit/59ec4eb07cbd7a96de7b28637fe9b7aa9f1263e5))
* **json-crdt-extensions:** 🎸 improve text insertion logic, especially into range ([cdea38e](https://github.com/streamich/json-joy/commit/cdea38e24801a77e7c0bc5b6f26104365eb4437c))
* **json-crdt-extensions:** 🎸 print human-readable block type ([c125938](https://github.com/streamich/json-joy/commit/c125938ff29f54101a4ab5237fa3cc196b2205d6))
* **json-crdt-peritext-ui:** 🎸 add ability to render different block types ([573a2ec](https://github.com/streamich/json-joy/commit/573a2ecb60c66e35a0d848bc56e1b7984b662e09))
* **json-crdt-peritext-ui:** 🎸 add initial block type switching functionality ([cd8f771](https://github.com/streamich/json-joy/commit/cd8f771f70e59b852fb23d033a02ea8a2553b0d5))
* **json-crdt-peritext-ui:** 🎸 do not show score on cursor movement ([3d7f58e](https://github.com/streamich/json-joy/commit/3d7f58ea810cfdcbe738d3d2b8f0fa67d9f22f0c))
* **json-crdt-peritext-ui:** 🎸 implement initial "marker" event ([f779251](https://github.com/streamich/json-joy/commit/f7792519d6a7ba74b8a857ba2bc82f08de73cd16))
* **json-crdt-peritext-ui:** 🎸 improve selection and caret display ([d348077](https://github.com/streamich/json-joy/commit/d348077f8c0476f71b66303c40b287667aba8d7d))
* **json-crdt-peritext-ui:** 🎸 improve typing score display ([edfd647](https://github.com/streamich/json-joy/commit/edfd647346cacf9e45c9e6eda9b77b52db3e118a))
* **json-crdt-peritext-ui:** 🎸 insert more type scoring phrases ([52001a9](https://github.com/streamich/json-joy/commit/52001a9ea0f2fc9dfc5a7f96499088f5a0d8ff95))
* **json-crdt-peritext-ui:** 🎸 keep score while actively moving cursor ([071ec09](https://github.com/streamich/json-joy/commit/071ec093458a2721226930da69c2c7ad241f0729))
* **json-crdt-peritext-ui:** 🎸 keeps score while user performs actions ([9fc675f](https://github.com/streamich/json-joy/commit/9fc675fa6996dfc8bc97f716cb634a9289791276))
* **json-crdt-peritext-ui:** 🎸 make +2 harder ([1f85886](https://github.com/streamich/json-joy/commit/1f85886e488f2fe92eab4eb4a69e174dd0a600b6))
* **json-crdt-peritext-ui:** 🎸 make anchors look flatter ([947b73d](https://github.com/streamich/json-joy/commit/947b73d668a5f28c0242d45036b7750d1b513326))
* **json-crdt-peritext-ui:** 🎸 make score messages shake ([10bdf3d](https://github.com/streamich/json-joy/commit/10bdf3d3fbbf898519a79ea1de3e28ea02d2c882))
* **json-crdt-peritext-ui:** 🎸 minor tweaks ([23fc35d](https://github.com/streamich/json-joy/commit/23fc35dcd3d4f4a9168b0e9d0abfbd1515a0b13a))
* **json-crdt-peritext-ui:** 🎸 render score when typing ([40cb826](https://github.com/streamich/json-joy/commit/40cb826ccdacfc26a2f9b6f9f07c06bdd0d9005e))
* **json-crdt-peritext-ui:** 🎸 show score deltas and UT easter egg messages ([4add638](https://github.com/streamich/json-joy/commit/4add638cef122e5148a7ebd9a58c83050f798e0e))
* **json-crdt-peritext-ui:** 🎸 specify the "marker" event ([a4d77bd](https://github.com/streamich/json-joy/commit/a4d77bdb7b5d9d1a98700bf15857cd7c27855886))
* **json-crdt-peritext-ui:** 🎸 tweak typing scoring parameters ([c37bf84](https://github.com/streamich/json-joy/commit/c37bf84e4e25584a6e86f904356229777d385862))


### Performance Improvements

* **json-crdt-extensions:** ⚡️ just cursor directly to insertion end ([1e86004](https://github.com/streamich/json-joy/commit/1e860043e874b8f858c63c2f7e89a98f31829f0e))

# [17.16.0](https://github.com/streamich/json-joy/compare/v17.15.0...v17.16.0) (2024-11-10)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 always render anchor ([a66f2fb](https://github.com/streamich/json-joy/commit/a66f2fb46b5bc7fe7637ea1dd7d5d4b50640fa51))


### Features

* 🎸 improve how pending formats are stored and presented ([45804eb](https://github.com/streamich/json-joy/commit/45804eb2270b134e73738f4bf7e12d6f5407645e))
* **json-crdt-extensions:** 🎸 add annotation type for column layout ([3f91fd5](https://github.com/streamich/json-joy/commit/3f91fd568018005f2e6ccf76270363562329d408))
* **json-crdt-extensions:** 🎸 allow annotations to reach ends of text ([e79ec1b](https://github.com/streamich/json-joy/commit/e79ec1bf1efe8d2ab3c4e3e8c5783f589a2d6b22))
* **json-crdt-extensions:** 🎸 apply pending formats on insertion ([c5e132e](https://github.com/streamich/json-joy/commit/c5e132eb7113c12e98a02600250404935fe4b9a2))
* **json-crdt-extensions:** 🎸 enable reverse pending format application ([9ae12e6](https://github.com/streamich/json-joy/commit/9ae12e6005ddd5f6914e417e09c769b998028649))
* **json-crdt-extensions:** 🎸 improve display of well known annotation pring in Inline ([dfa8219](https://github.com/streamich/json-joy/commit/dfa821909cf3f8933890993d1a743f6a6723db90))
* **json-crdt-extensions:** 🎸 keep track of pending formatting upon insert ([5109dae](https://github.com/streamich/json-joy/commit/5109dae1a288b495a87c287c22ea6db4718a2890))
* **json-crdt-peritext-ui:** 🎸 add example color annotation ([36ad885](https://github.com/streamich/json-joy/commit/36ad8858f5d14a861d00284fde0701260fede49d))
* **json-crdt-peritext-ui:** 🎸 improve button border radius ([4e77faf](https://github.com/streamich/json-joy/commit/4e77faf8e6bc59a82c612076aab7cff6007f4f37))
* **json-crdt-peritext-ui:** 🎸 improve debug button presentation ([3912d4a](https://github.com/streamich/json-joy/commit/3912d4a8f23c50e7fb12d2bc3adeba7770713443))
* **json-crdt-peritext-ui:** 🎸 improve debug console, add tabbing and model state ([3aaefbb](https://github.com/streamich/json-joy/commit/3aaefbb9dbd5b10b6d16b6c46500a2203e687d12))
* **json-crdt-peritext-ui:** 🎸 improve debug output ([644e7a6](https://github.com/streamich/json-joy/commit/644e7a669497185db424c6f1a2321ae8464a8d75))

# [17.15.0](https://github.com/streamich/json-joy/compare/v17.14.0...v17.15.0) (2024-11-10)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 correct anchor edge rendering ([469946f](https://github.com/streamich/json-joy/commit/469946fd1617d513611025d6cb4c41459b285889))
* **json-crdt-peritext-ui:** 🐛 make caret rotation more precise ([93a869d](https://github.com/streamich/json-joy/commit/93a869d97e2a4642a8eaecaf3fb940529ebf34a2))
* **json-crdt-peritext-ui:** 🐛 remove all slices of given type ([8d246b2](https://github.com/streamich/json-joy/commit/8d246b261c6cb1e6d932d878f428d5c02fdc473e))


### Features

* **json-crdt-extensions:** 🎸 add ability to toggle inline boolean formatting ([2ef6320](https://github.com/streamich/json-joy/commit/2ef63201f833aadd2a27066858ccbc28d4bf95fa))
* **json-crdt-extensions:** 🎸 debug print slice metadata ([08e867e](https://github.com/streamich/json-joy/commit/08e867e4004c9bc06949ad13f745ab9c79a24773))
* **json-crdt-extensions:** 🎸 improve boolean annotation handling ([3101fbc](https://github.com/streamich/json-joy/commit/3101fbc586f1dacd89ef2495442bf181a119081e))
* **json-crdt-extensions:** 🎸 improve storage detection when deleting slices ([e1a8deb](https://github.com/streamich/json-joy/commit/e1a8deb494da0873d9b2b9c3b8c34a44f3885d28))
* **json-crdt-extensions:** 🎸 print well known slice type ([9e5215c](https://github.com/streamich/json-joy/commit/9e5215c8961f06213f594bbba316cd4e937e3c79))
* **json-crdt-extensions:** 🎸 rename SliceBehavior members and add JSDOcs ([5da6d1c](https://github.com/streamich/json-joy/commit/5da6d1cd76d6fa4be20e34c2a83cc7aa991e3f3f))
* **json-crdt-peritext-ui:** 🎸 add "clear" inline formatting behavior ([e063802](https://github.com/streamich/json-joy/commit/e063802149a09e9e835579fed242526c2819ce79))
* **json-crdt-peritext-ui:** 🎸 add ability to erase formatting ([b94ec9d](https://github.com/streamich/json-joy/commit/b94ec9d385ce04d3548a929ecf55f83650191feb))
* **json-crdt-peritext-ui:** 🎸 animate achor appearance ([9b51f72](https://github.com/streamich/json-joy/commit/9b51f72f174787769ccdbf1db31a506af22f2487))
* **json-crdt-peritext-ui:** 🎸 animate carret while typing ([e180e28](https://github.com/streamich/json-joy/commit/e180e28ffccbd9082cc8aab4f9bf6bf9438022d3))
* **json-crdt-peritext-ui:** 🎸 fixup default format event usage ([575fb52](https://github.com/streamich/json-joy/commit/575fb526686e68ef12cfd87f76ec60a3680873d6))
* **json-crdt-peritext-ui:** 🎸 improve boolean slice insertion method ([08823fc](https://github.com/streamich/json-joy/commit/08823fc3459073d55b0a65f4f94da64a033a8926))
* **json-crdt-peritext-ui:** 🎸 improve inline "format" event ([453e0e8](https://github.com/streamich/json-joy/commit/453e0e8d7554ad364795f2df82fe77898753b7fb))
* **json-crdt-peritext-ui:** 🎸 improve slice italic focus edge rendering ([1fb893c](https://github.com/streamich/json-joy/commit/1fb893ceae6c03eb7fc419999b0e0b3d6fedcc82))

# [17.14.0](https://github.com/streamich/json-joy/compare/v17.13.0...v17.14.0) (2024-11-07)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 update inline slice detection ([c13a1cf](https://github.com/streamich/json-joy/commit/c13a1cf02049ded5876b2a6aa3ef184eae6fdc75))


### Features

* **json-crdt-extensions:** 🎸 export inline types ([77b3349](https://github.com/streamich/json-joy/commit/77b3349bc99d04f117b66e3910f8c7ea4e29a112))
* **json-crdt-extensions:** 🎸 populate common slice type list ([d4c68db](https://github.com/streamich/json-joy/commit/d4c68db3b8a634db818ab58e52b32e470612303e))
* **json-crdt-extensions:** 🎸 support caret in .stat() method ([212f623](https://github.com/streamich/json-joy/commit/212f623af0873b9dd3cacfd165d8eb9bf2b7ac0e))
* **json-crdt-peritext-ui:** 🎸 add basic highlighting for all boolean inline elements ([21844f9](https://github.com/streamich/json-joy/commit/21844f99300fd0cf97c236c23747cfe1a57500fb))
* **json-crdt-peritext-ui:** 🎸 add strikethrough inline slice support ([c529d73](https://github.com/streamich/json-joy/commit/c529d734291e2dc819159e1c91a9518bcf050c1e))
* **json-crdt-peritext-ui:** 🎸 anchor boolean slice end point "before" next char ([77afdc1](https://github.com/streamich/json-joy/commit/77afdc113ab9a60f045707dc37250d8071dbfbad))
* **json-crdt-peritext-ui:** 🎸 improve chrome styling ([9d4a0f8](https://github.com/streamich/json-joy/commit/9d4a0f85ced9866b450064e95a0a9f952b2fccc1))
* **json-crdt-peritext-ui:** 🎸 improve editor boolean buttons ([0f5aa91](https://github.com/streamich/json-joy/commit/0f5aa91f2c44edda4b8a1d14cc10c8a454522b49))
* **json-crdt-peritext-ui:** 🎸 ref "after" on caret set ([257648c](https://github.com/streamich/json-joy/commit/257648c0149f0e16d0c99be5dcab796f7dc08b6c))
* **json-crdt-peritext-ui:** 🎸 reset pressed keys on editor blur ([8f144f4](https://github.com/streamich/json-joy/commit/8f144f43ced394554dc176893a3aa338eb386d82))
* **json-crdt-peritext-ui:** 🎸 use common inline slice types ([241f841](https://github.com/streamich/json-joy/commit/241f8411e1a9e3cac3b8321b3352b11538a93589))

# [17.13.0](https://github.com/streamich/json-joy/compare/v17.12.0...v17.13.0) (2024-11-06)


### Bug Fixes

* **json-crdt-extensions:** 🐛 improve .stat() implementation ([7876cd1](https://github.com/streamich/json-joy/commit/7876cd13a8138ac1e2c051cf55746284d36cdf75))


### Features

* **json-crdt-extensions:** 🎸 add ability to start iteration including the first point ([33d8539](https://github.com/streamich/json-joy/commit/33d85391aee359868bd7b2629b899cb7b318ef8d))
* **json-crdt-extensions:** 🎸 implement .shrink() method for Range ([a0f5a80](https://github.com/streamich/json-joy/commit/a0f5a80c693515d5637f1a804a031271f1d39047))
* **json-crdt-extensions:** 🎸 implement Overlay .stat() method ([1045d77](https://github.com/streamich/json-joy/commit/1045d7762e27e91ba7afa0f4e3e0c8791ef07b6c))
* **json-crdt-extensions:** 🎸 populate common slice types ([5f04117](https://github.com/streamich/json-joy/commit/5f0411775665e126dfe2449d27026fdec2563f0d))
* **json-crdt-peritext-ui:** 🎸 add context for the default theme ([46317cb](https://github.com/streamich/json-joy/commit/46317cb15d8dd3edb45662cc2476535f121cce02))
* **json-crdt-peritext-ui:** 🎸 setup default chrome and top toolbar ([34856b5](https://github.com/streamich/json-joy/commit/34856b57e9345a581845810af0d7f7896c5c5150))

# [17.12.0](https://github.com/streamich/json-joy/compare/v17.11.0...v17.12.0) (2024-11-04)


### Bug Fixes

* **json-crdt-peritext-ui:** 🐛 imprve how cursor is displayed in debug mode ([b6c61a8](https://github.com/streamich/json-joy/commit/b6c61a8eff7aa904d65762ac74a0e43895f002ba))
* **json-crdt-peritext-ui:** 🐛 make event prevention more granular ([86713f8](https://github.com/streamich/json-joy/commit/86713f8713d31816fadb770d8ba879b9b6cc8d79))


### Features

* **json-crdt-peritext-ui:** 🎸 add ability to render controller state ([b117417](https://github.com/streamich/json-joy/commit/b1174171ae59ec1021b84356a9ffe8b019b8dbec))
* **json-crdt-peritext-ui:** 🎸 add ability to slant focus in italic text ([46bdb02](https://github.com/streamich/json-joy/commit/46bdb02253985135c4cb15443f9198f0c1d35c75))
* **json-crdt-peritext-ui:** 🎸 add CompositionController ([585f5d4](https://github.com/streamich/json-joy/commit/585f5d407f026566e2e503f33bbd12d97f2bf3a4))
* **json-crdt-peritext-ui:** 🎸 add text augmentation API ([186801e](https://github.com/streamich/json-joy/commit/186801e5aeb5cb5a7b405b591422c9ab0dbcd871))
* **json-crdt-peritext-ui:** 🎸 add useSyncStore React hook ([254efb7](https://github.com/streamich/json-joy/commit/254efb7ca04c5ac14b617198522db2c165cc003b))
* **json-crdt-peritext-ui:** 🎸 blur editor on Esc press ([eeef3ea](https://github.com/streamich/json-joy/commit/eeef3ea243a889642a51915fa806660e2bf07fe1))
* **json-crdt-peritext-ui:** 🎸 change inline view rendering API ([fdb6e23](https://github.com/streamich/json-joy/commit/fdb6e232e3d51809fc5703961e388c59f1d481a6))
* **json-crdt-peritext-ui:** 🎸 early exit keyboard events when in composition ([2131fab](https://github.com/streamich/json-joy/commit/2131faba21882b39cbecac4056f743a57d3e06d4))
* **json-crdt-peritext-ui:** 🎸 improve caret and selection edge rendering styling ([df4d070](https://github.com/streamich/json-joy/commit/df4d070d3e40f75fc3342626c694ae5e0d158eef))
* **json-crdt-peritext-ui:** 🎸 improve key trackign reset behavior ([57663ab](https://github.com/streamich/json-joy/commit/57663ab28cf56df230a738d38c139fc66c0c18fc))
* **json-crdt-peritext-ui:** 🎸 improve Peritext root component rendering ([ed5e8ee](https://github.com/streamich/json-joy/commit/ed5e8ee58cee98376f7f924db29c73c7859726d3))
* **json-crdt-peritext-ui:** 🎸 make CursorController state reactive ([e711151](https://github.com/streamich/json-joy/commit/e71115167c3da24afbab8eff660484614cb6a96f))
* **json-crdt-peritext-ui:** 🎸 memoize main component ref ([86ad303](https://github.com/streamich/json-joy/commit/86ad30357c9be336e6a24bcb45ac6f60eee693ff))
* **json-crdt-peritext-ui:** 🎸 print pressed key state ([ebc3d0e](https://github.com/streamich/json-joy/commit/ebc3d0e4ff0158be2b19eb1fd87187734567d338))
* **json-crdt-peritext-ui:** 🎸 remove text component ([d2ecad4](https://github.com/streamich/json-joy/commit/d2ecad448808fab67783fe7fb13a0a9010432a8e))
* **json-crdt-peritext-ui:** 🎸 render caret grey when blurred ([ab8dda9](https://github.com/streamich/json-joy/commit/ab8dda9d2062759699a40a6946c61eaa3f6121bc))
* **json-crdt-peritext-ui:** 🎸 render selection grey when blurred ([d3d28a0](https://github.com/streamich/json-joy/commit/d3d28a05de0179b4c459410410a23e989d2bca6f))
* **json-crdt-peritext-ui:** 🎸 track focus state in input controller and print its state ([d98070f](https://github.com/streamich/json-joy/commit/d98070f6dbeb7a7612f1ddb2a6f24270d51ef6ae))
* **json-crdt-peritext-ui:** 🎸 use Position as "inline" event position parameters ([be2e551](https://github.com/streamich/json-joy/commit/be2e551cb75f87eb02c703195085908c47db95e1))
* **util:** 🎸 implement SyncStore helpers ([4806c82](https://github.com/streamich/json-joy/commit/4806c82818b921253fd95701a4de8a4d0fb98644))

# [17.11.0](https://github.com/streamich/json-joy/compare/v17.10.0...v17.11.0) (2024-11-03)


### Features

* **json-crdt-peritext-ui:** 🎸 add concenience overloads for the "delete" event ([1a59929](https://github.com/streamich/json-joy/commit/1a599298d34cec01223713bc67c61f86d4b30e5c))
* **json-crdt-peritext-ui:** 🎸 improve "cursor" evnet range selections ([a7b17be](https://github.com/streamich/json-joy/commit/a7b17be38f921b17001fa8f6b3617f1bb81be597))
* **json-crdt-peritext-ui:** 🎸 improve the cursor event absolute caret positioning ([ccb8ded](https://github.com/streamich/json-joy/commit/ccb8ded4837b1277ff1f4acd32761695834d8e3b))

# [17.10.0](https://github.com/streamich/json-joy/compare/v17.9.1...v17.10.0) (2024-11-03)


### Features

* **json-crdt-peritext-ui:** 🎸 add ability to delete at arbitrary position ([98fff74](https://github.com/streamich/json-joy/commit/98fff74798310596a31eb1cb4980e99d996eb6db))
* **json-crdt-peritext-ui:** 🎸 improve generic "change" event dispatch ([3a28733](https://github.com/streamich/json-joy/commit/3a2873390a84645ef9251abda215420da2458f4c))
* **json-crdt-peritext-ui:** 🎸 improve the deletion event ([633b6f4](https://github.com/streamich/json-joy/commit/633b6f414d834a85a03a9025f50313ba968d4ad1))
* **json-crdt-peritext-ui:** 🎸 make events cancellable, add "insert" tests ([9a9fa51](https://github.com/streamich/json-joy/commit/9a9fa51e1393f2c78832dac96e9de7bac66ed09f))

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
