import * as React from 'react';
import {rule} from 'nano-theme';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {Tabs} from '@jsonjoy.com/ui/lib/3-list-item/Tabs';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {TextBlock} from '@jsonjoy.com/ui/lib/5-block/TextBlock';
import {convertLatexToAsciiMath, convertLatexToMarkup, convertLatexToMathMl} from 'mathlive';
import {useMathOptionsState} from './state';
import {MATH_SIZE_LABEL, MATH_SIZES} from './settings';
import {useMuTxt} from '../../../context';
import {useT} from 'use-t';
import type {MathSize, MathThing} from '../../../types';

const blockClass = rule({
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  maxW: '480px',
});

const stopInputKeyDown = (event: React.KeyboardEvent): void => {
  event.stopPropagation();
};

export const MathOptions: React.FC = () => {
  const [t] = useT();
  const state = useMathOptionsState();
  const mutxt = useMuTxt();
  mutxt.things.version.use();
  const caption = state.caption.use();
  const size = state.size.use();
  const name = state.name.use();
  const label = state.label.use();

  const thingId = state.getThingId();
  const thing = thingId ? (mutxt.things.get(thingId) as MathThing | undefined) : undefined;
  const tex = thing?.val ?? '';

  return (
    <div className={blockClass}>
      {!!tex && <MathSourceBlocks tex={tex} />}
      <Separator />

      <FormRow title={t('Size')} descriptionAbove description={t('Visual size of the rendered equation.')}>
        <Tabs
          active={size}
          onChange={(key) => state.setSize(key as MathSize)}
          items={MATH_SIZES.map((s) => ({key: s, label: `${s} — ${MATH_SIZE_LABEL[s]}`}))}
        />
      </FormRow>

      <Separator />

      <Input
        type="text"
        value={caption}
        label={t('Caption')}
        placeholder={t('Shown below the equation')}
        onChange={state.setCaption}
        onKeyDown={stopInputKeyDown}
        onEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.apply();
        }}
        onEsc={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.cancel();
        }}
      />

      <Separator />

      <Input
        type="text"
        value={name}
        label={t('Name')}
        placeholder={t('e.g. Pythagorean theorem')}
        onChange={state.setName}
        onKeyDown={stopInputKeyDown}
        onEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.apply();
        }}
        onEsc={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.cancel();
        }}
      />

      <Input
        type="text"
        value={label}
        label={t('Label')}
        placeholder={t('e.g. eq:pythagoras')}
        onChange={state.setLabel}
        onKeyDown={stopInputKeyDown}
        onEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.apply();
        }}
        onEsc={(event) => {
          event.preventDefault();
          event.stopPropagation();
          state.cancel();
        }}
      />
    </div>
  );
};

interface MathSourceBlocksProps {
  tex: string;
}

const MathSourceBlocks: React.FC<MathSourceBlocksProps> = ({tex}) => {
  const ascii = React.useMemo(() => {
    try {
      return convertLatexToAsciiMath(tex);
    } catch {
      return '';
    }
  }, [tex]);
  const mathMl = React.useMemo(() => {
    try {
      return convertLatexToMathMl(tex);
    } catch {
      return '';
    }
  }, [tex]);
  const mathHtml = React.useMemo(() => {
    try {
      return convertLatexToMarkup(tex);
    } catch {
      return '';
    }
  }, [tex]);

  return (
    <>
      <MiniTitle literal>LaTeX</MiniTitle>
      <TextBlock src={tex} select />

      {!!ascii && (
        <>
          <MiniTitle literal>ASCII Math</MiniTitle>
          <TextBlock src={ascii} select />
        </>
      )}

      {!!mathMl && (
        <>
          <MiniTitle literal>MathML</MiniTitle>
          <TextBlock src={mathMl} select />
        </>
      )}

      {!!mathHtml && (
        <>
          <MiniTitle literal>HTML</MiniTitle>
          <TextBlock
            src={
              '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" />\n' +
              mathHtml
            }
            select
          />
        </>
      )}
    </>
  );
};
