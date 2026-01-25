import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {useSelectNode} from '../../hooks/useSelectNode';
import {rule} from 'nano-theme';
import {Title} from './Title';
import {Content} from './Content';
import {PublicToggle} from './PublicToggle';
import {useTags} from './hooks';
import {Tags} from './Tags';
import type {StrApi} from 'json-joy/lib/json-crdt';
import type {BlogpostModel} from './schema';

const css = {
  block: rule({
    bxz: 'border-box',
    w: '100%',
    maxW: '400px',
    pd: '0 0 16px',
  }),
  title: rule({
    pd: '16px',
    bxz: 'border-box',
    w: '100%',
  }),
};

export interface HeaderProps {
  model: BlogpostModel;
}

export const Blogpost: React.FC<HeaderProps> = ({model}) => {
  const obj = useSelectNode(model, (s) => s.$.asObj());
  const arr = useTags(model);
  const title = useSelectNode(model, (s) => s.title.$) as StrApi | null;
  const content = useSelectNode(model, (s) => s.content.$) as StrApi | null;

  if (!obj) return null;

  return (
    <Paper className={css.block} fill={1} round>
      <div className={css.title}>
        <MiniTitle>Blog post</MiniTitle>
      </div>
      <Separator />
      {!!title && <Title str={title} />}
      {!!content && <Content str={content} />}
      {!!arr && <Tags arr={arr} />}
      {!!obj && <PublicToggle obj={obj} />}
    </Paper>
  );
};
