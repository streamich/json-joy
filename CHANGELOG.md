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
