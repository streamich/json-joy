import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';
import {fonts} from 'nice-ui/lib/styles';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import {Favicon} from '../../../components/Favicon';
import {parseUrl} from '../../../web/util';
import {CopyButton} from './CopyButton';

const iconColumn = 40;

const iconClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '32px',
  h: '32px',
  mr: '-4px 0',
  bg: 'rgba(250,250,250,.9)',
  bdrad: '15px',
  '& img': {
    bdrad: '2px',
  },
});

const domainClass = rule({
  ...fonts.get('ui', 'mid', 1),
  fz: '14px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const linkClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '16px',
  pd: `0 0 0 ${iconColumn}px`,
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
    <>
      <Split style={{width: '100%', maxWidth: '100%'}}>
        <div style={{maxWidth: 'calc(100% - 100px)'}}>
          <FixedColumn left={iconColumn} style={{alignItems: 'center'}}>
            <div>
              <div className={iconClass}>
                <Favicon domain={domain} url={url} />
              </div>
            </div>
            <div className={domainClass}>
              {title ? (
                <>
                  <strong>{title}</strong> • {domainTruncated}
                </>
              ) : (
                domainTruncated
              )}
            </div>
          </FixedColumn>
          <div>
            <div className={linkClass}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </div>
          </div>
        </div>
        <div className={buttonGroupClass}>
          <CopyButton width={48} height={48} round onCopy={() => url} tooltip={{anchor: {}}} />
          <BasicTooltip nowrap renderTooltip={() => t('Open')}>
            <BasicButton width={48} height={48} round to={url} target="_blank" rel="noopener noreferrer">
              <Iconista width={16} height={16} set={'lucide'} icon="external-link" />
            </BasicButton>
          </BasicTooltip>
        </div>
      </Split>
    </>
  );
};
