import * as React from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import {bind} from '.';
import {CollaborativeInput} from './CollaborativeInput';
import type {Meta, StoryObj} from '@storybook/react';

const Demo: React.FC<{textarea: boolean}> = ({textarea}) => {
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [model, clone] = React.useMemo(() => {
    const model = Model.create();
    model.api.root({text: 'Hell'});
    return [model, model.clone()];
  }, []);
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);
  React.useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const unbind = bind(() => model.api.str(['text']), input, true);
    return () => {
      unbind();
    };
  }, [model]);

  return (
    <div>
      <CollaborativeInput
        str={() => model.api.str(['text'])}
        input={(connect) =>
          textarea ? (
            <textarea
              ref={(el) => {
                connect(el);
                (inputRef as any).current = el;
              }}
            />
          ) : (
            <input
              ref={(el) => {
                connect(el);
                (inputRef as any).current = el;
              }}
              type="text"
            />
          )
        }
      />
      <div>
        <button
          type={'button'}
          onClick={() => {
            const input = inputRef.current;
            if (!input) return;
            input.value += '!';
          }}
        >
          Append "!" to input
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            const str = model.api.str(['text']);
            str.ins(str.view().length, '?');
          }}
        >
          Append "?" to model
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.api.str(['text']);
              str.ins(str.view().length, '?');
            }, 2000);
          }}
        >
          Append "?" to model after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.api.str(['text']);
              str.ins(Math.min(3, str.length()), 'abc');
            }, 2000);
          }}
        >
          Insert "abc" into model at pos 3 after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.api.str(['text']);
              str.del(3, Math.min(5, str.length() - 3));
            }, 2000);
          }}
        >
          Delete 5 chars from model at pos 3 after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.api.str(['text']);
              str.del(1, 1);
            }, 2000);
          }}
        >
          Delete second character after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              const str = model.api.str(['text']);
              str.ins(0, '1. ');
            }, 2000);
          }}
        >
          Prepend "1. " to model after 2s
        </button>
      </div>
      <div>
        <button
          type={'button'}
          onClick={() => {
            setTimeout(() => {
              model.reset(clone);
            }, 2000);
          }}
        >
          RESET after 2s
        </button>
      </div>
      <pre style={{fontSize: '10px'}}>
        <code>{model.root + ''}</code>
      </pre>
    </div>
  );
};

const meta: Meta<typeof Text> = {
  title: 'collaborative-input/<CollaborativeInput>',
  component: Demo as any,
  argTypes: {},
};

export default meta;

export const Input: StoryObj<typeof meta> = {
  args: {},
};

export const Textarea: StoryObj<typeof meta> = {
  args: {
    textarea: true,
  } as any,
};
