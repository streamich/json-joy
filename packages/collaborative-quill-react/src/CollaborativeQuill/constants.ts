import type {QuillOptions} from 'quill';

export const opts: QuillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'link'], // toggled buttons
      ['blockquote', 'code-block'],

      [{header: 1}, {header: 2}], // custom button values
      [{list: 'ordered'}, {list: 'bullet'}],
      [{script: 'sub'}, {script: 'super'}], // superscript/subscript
      [{indent: '-1'}, {indent: '+1'}], // outdent/indent
      [{direction: 'rtl'}], // text direction

      ['image'],

      [{header: [1, 2, 3, 4, 5, 6, false]}],

      [{color: []}, {background: []}], // dropdown with defaults from theme
      [{font: []}],
      [{align: []}],

      ['clean'], // remove formatting button
    ],
  },
};
