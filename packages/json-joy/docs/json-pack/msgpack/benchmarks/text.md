`json-pack` ships the fastest MessagePack encoder and decoder in the NPM ecosystem.
The benchmarks below show that `json-pack` is 40x faster than `messagepack` package,
about 2x faster than `@msgpack/msgpack`, and even slightly faster than the highly
optimized `msgpackr` package.

~~~jj.note
Benchmark were performed using Node.js v20.2.0 on Apple M1 chip. The numbers show
the number of POJO objects encoded/decoded per second.
~~~


## Encoding

![msgpack-encoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/msgpack-encoding-results.png)


## Decoding

![msgpack-decoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/msgpack-decoding-results.png)


## Running the benchmarks

You can run the benchmarks yourself by cloning the `json-joy` repository and
running the following commands:

```
npx ts-node benchmarks/json-pack/bench.msgpack.encoding.ts
npx ts-node benchmarks/json-pack/bench.msgpack.decoding.ts
```
