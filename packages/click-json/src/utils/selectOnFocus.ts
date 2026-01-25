export const selectOnFocus = (input: HTMLInputElement | HTMLTextAreaElement) => {
  const value = input.value;
  const length = value.length;
  // Nicely select short strings. Always select very short strings, for
  // a bit longer strings check if there are any spaces or newlines. The
  // characters should allow to select UUIDs.
  if (length && length < 40) {
    setTimeout(() => {
      if (value[0] === '"' && value[length - 1] === '"') {
        if (length < 17 || (value.indexOf('\n') === -1 && value.indexOf(' ') === -1)) {
          input.setSelectionRange(1, length - 1, 'forward');
        }
      } else if (value === 'null') input.setSelectionRange(0, 4, 'forward');
      else {
        try {
          switch (typeof JSON.parse(value)) {
            case 'number':
            case 'boolean': {
              input.setSelectionRange(0, length, 'forward');
              break;
            }
          }
        } catch {}
      }
    }, 155);
  }
  if (value[0] === '"' && value[length - 1] === '"') {
    input.setSelectionRange(length - 1, length - 1);
  }
};
