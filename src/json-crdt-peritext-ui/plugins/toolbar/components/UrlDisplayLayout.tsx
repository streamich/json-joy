import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';
import {fonts} from 'nice-ui/lib/styles';
import {Favicon} from '../../../components/Favicon';
import {getDomain} from '../../../web/util';

const iconClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '30px',
  h: '30px',
  bg: '#fff',
  mr: '-2px 0 0 -2px',
  bdrad: '15px',
});

const domainClass = rule({
  ...fonts.get('ui', 'mid', 1),
  fz: '13px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const linkClass = rule({
  ...fonts.get('ui', 'bold', 1),
  fz: '16px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export interface UrlDisplayLayoutProps {
  url: string;
}

export const UrlDisplayLayout: React.FC<UrlDisplayLayoutProps> = ({url}) => {
  const [domain, domainTruncated] = React.useMemo(() => {
    const domain = getDomain(url) || '';
    const domainTruncated = domain && domain.length > 32 ? `${domain.slice(0, 32)}...` : domain;
    return [domain, domainTruncated];
  }, [url]);

  return (
    <>
      <FixedColumn left={36} style={{alignItems: 'center'}}>
        <div>
          <div className={iconClass}>
            <Favicon domain={domain} url={url} />
          </div>
        </div>
        <div className={domainClass}>{domainTruncated}</div>
      </FixedColumn>
      <div className={linkClass}>
        <a href={url} target='_blank' rel='noopener noreferrer'>{url}</a>
      </div>
    </>
  );
};
