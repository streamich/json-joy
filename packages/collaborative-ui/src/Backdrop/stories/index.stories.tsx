import {Backdrop} from '..';

export default {
  component: Backdrop,
  title: '<Backdrop>',
  tags: ['autodocs'],
};

export const Default = {
  args: {
    value: '123',
    backdrop: '123',
  },
};

export const RedChar = {
  args: {
    value: '123',
    backdrop: (
      <>
        1<span style={{background: 'red'}}>2</span>3
      </>
    ),
  },
};
