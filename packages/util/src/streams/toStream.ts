export const toStream = (data: Uint8Array): ReadableStream<Uint8Array> => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
};
