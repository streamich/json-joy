import * as React from 'react';
import {useDemos} from '../../context';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {CopyCode} from 'nice-ui/lib/1-inline/CopyCode';
import {CopyInput} from 'nice-ui/lib/2-inline-block/CopyInput';
import {PillButton} from 'nice-ui/lib/2-inline-block/PillButton';
import useWindowSize from 'react-use/lib/useWindowSize';
import {QrCode} from 'nice-ui/lib/2-inline-block/QrCode';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {useT} from 'use-t';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import {Text} from 'nice-ui/lib/1-inline/Text';
import {useTheme} from 'nano-theme';

export interface ShareBlockProps {
  id: string;
}

export const ShareBlock: React.FC<ShareBlockProps> = ({id}) => {
  const [t] = useT();
  const state = useDemos();
  const file = useBehaviorSubject(state.file$);
  const {width} = useWindowSize();
  const theme = useTheme();

  const isSmall = width < 1000;

  if (!file) return null;

  const url = state.url(id);

  return (
    <div>
      <div style={{padding: '24px 16px 16px', background: theme.g(0.98), borderRadius: 16}}>
        <CopyInput label={t('Demo link')} value={url} />
        <Space />
        <div style={{border: '1px solid rgba(0,0,0,.1)', borderRadius: '8px', overflow: 'hidden'}}>
          <QrCode data={url} />
        </div>
        <Space />
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
          <CopyCode size={-1} value={id} />
        </div>
      </div>

      <Space size={6} />

      <MiniTitle>{t('Share')}</MiniTitle>

      <Text as={'p'} size={-1}>
        {t('Share this link with others to collaborate on this document.')}
      </Text>
      <Space size={-1} />
      <div style={{marginLeft: -8}}>
        <PillButton a active to={url} external>
          {t('Open in new tab')}
        </PillButton>
      </div>
    </div>
  );
};
