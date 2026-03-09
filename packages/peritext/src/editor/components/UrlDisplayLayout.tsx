import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from '@jsonjoy.com/ui/lib/3-list-item/FixedColumn';
import {fonts} from '@jsonjoy.com/ui/lib/styles';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import {Favicon} from './Favicon';
import {parseUrl} from '../util';
import {CopyButton} from './CopyButton';

const ExternalLinkIcon = makeIcon({set: 'lucide', icon: 'external-link'});

const iconColumnWidth = 40;

const iconClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '32px',
  h: '32px',
  mr: '-4px 0',
  bg: 'rgba(250,250,250,.9)',
  bdrad: '12px',
  '& img': {
    bdrad: '2px',
  },
});

const domainClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '14px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const linkClass = rule({
  ...fonts.get('ui', 'mid', 1),
  d: 'block',
  fz: '14px',
  pd: `0`,
  w: '100%',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const buttonGroupClass = rule({
  w: '60px',
  d: 'flex',
  ai: 'center',
  flexDirection: 'row-reverse',
  mr: '-4px',
  pd: '0',
});

export interface UrlDisplayLayoutProps {
  url: string;
  title?: string;
}

export const UrlDisplayLayout: React.FC<UrlDisplayLayoutProps> = ({url, title}) => {
  const [t] = useT();
  const [domain, domainTruncated] = React.useMemo(() => {
    const parsed = parseUrl(url);
    const domain = parsed?.hostname || '';
    const domainTruncated = domain && domain.length > 32 ? `${domain.slice(0, 32)}...` : domain;
    return [domain, domainTruncated];
  }, [url]);

  return (
    <FixedColumn right={60}>
      <div style={{maxWidth: 'calc(100% - 100px)'}}>
        <FixedColumn left={iconColumnWidth} style={{alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div className={iconClass}>
              <Favicon domain={domain} url={url} size={16} />
            </div>
          </div>
          <div style={{overflow: 'hidden', width: 'calc(min(248px,100vw - 100px))'}}>
            <div className={domainClass}>{domainTruncated}</div>
            <div className={linkClass}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title || url}
              </a>
            </div>
          </div>
        </FixedColumn>
      </div>
      <div className={buttonGroupClass}>
        <CopyButton width={48} height={48} round onCopy={() => url} tooltip={{anchor: {}}} />
        <BasicTooltip nowrap renderTooltip={() => t('Open')}>
          <BasicButton width={48} height={48} round to={url} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
      </div>
    </FixedColumn>
  );
};
