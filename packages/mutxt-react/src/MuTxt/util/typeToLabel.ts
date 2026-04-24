export const typeToLabel = (type: string): string => {
  switch (type) {
    case 'p':
      return 'Paragraph';
    case 'h1':
      return 'Heading 1';
    case 'h2':
      return 'Heading 2';
    case 'h3':
      return 'Heading 3';
    case 'columns':
      return 'Two columns';
    case 'blockquote':
      return 'Quote';
    case 'code-block':
      return 'Code block';
    case 'embed':
      return 'Embed';
    case 'checklist':
      return 'Checklist';
    case 'ul':
      return 'Bulleted list';
    case 'ol':
      return 'Numbered list';
    case 'li':
      return 'List item';
    default:
      return '';
  }
};
