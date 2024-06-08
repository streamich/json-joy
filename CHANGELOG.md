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
