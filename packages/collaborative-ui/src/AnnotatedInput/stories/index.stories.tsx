import * as React from 'react';
import {theme} from 'nano-theme';
import {AnnotatedInput} from '..';

export default {
  component: AnnotatedInput,
  title: '<AnnotatedInput>',
  tags: ['autodocs'],
};

export const Selection = {
  args: {
    value: '123',
    annotations: [1, [1, (txt: string) => <span style={{background: theme.color.color[5]}}>{txt}</span>]],
  },
};

export const Caret = {
  args: {
    value: '123',
    annotations: [
      2,
      [
        0,
        (txt: string) => (
          <span style={{position: 'relative', width: 0, height: '1em'}}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-block',
                top: 0,
                bottom: 0,
                left: -1,
                width: 2,
                background: theme.color.color[4],
              }}
            />
          </span>
        ),
      ],
    ],
  },
};

export const TwoSelections = {
  args: {
    value: 'Hello world!',
    annotations: [
      2,
      [4, (txt: string) => <span style={{background: theme.color.color[0], opacity: 0.5}}>{txt}</span>],
      [
        2,
        (txt: string) => (
          <span style={{backgroundColor: theme.color.color[0], opacity: 0.5, mixBlendMode: 'multiply'}}>
            <span style={{backgroundColor: theme.color.color[5], opacity: 0.5, mixBlendMode: 'multiply'}}>{txt}</span>
          </span>
        ),
      ],
      [
        0,
        (txt: string) => (
          <span style={{position: 'relative', width: 0, height: '1em'}}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-block',
                top: 0,
                bottom: 0,
                left: -1,
                width: 2,
                background: theme.color.color[0],
              }}
            />
          </span>
        ),
      ],
      [3, (txt: string) => <span style={{background: theme.color.color[5], opacity: 0.5}}>{txt}</span>],
      [
        0,
        (txt: string) => (
          <span style={{position: 'relative', width: 0, height: '1em'}}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-block',
                top: 0,
                bottom: 0,
                left: -1,
                width: 2,
                background: theme.color.color[5],
              }}
            />
          </span>
        ),
      ],
    ],
  },
};

export const Scrolling = {
  args: {
    value: 'Hello world!',
    attr: {
      style: {
        width: 50,
      },
    },
    annotations: [
      2,
      [4, (txt: string) => <span style={{background: theme.color.color[0], opacity: 0.5}}>{txt}</span>],
      [
        2,
        (txt: string) => (
          <span style={{backgroundColor: theme.color.color[0], opacity: 0.5, mixBlendMode: 'multiply'}}>
            <span style={{backgroundColor: theme.color.color[5], opacity: 0.5, mixBlendMode: 'multiply'}}>{txt}</span>
          </span>
        ),
      ],
      [
        0,
        (txt: string) => (
          <span style={{position: 'relative', width: 0, height: '1em'}}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-block',
                top: 0,
                bottom: 0,
                left: -1,
                width: 2,
                background: theme.color.color[0],
              }}
            />
          </span>
        ),
      ],
      [3, (txt: string) => <span style={{background: theme.color.color[5], opacity: 0.5}}>{txt}</span>],
      [
        0,
        (txt: string) => (
          <span style={{position: 'relative', width: 0, height: '1em'}}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-block',
                top: 0,
                bottom: 0,
                left: -1,
                width: 2,
                background: theme.color.color[5],
              }}
            />
          </span>
        ),
      ],
    ],
  },
};
