import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';
import {fonts} from 'nice-ui/lib/styles';
import {Favicon} from '../../../components/Favicon';
import {parseUrl} from '../../../web/util';
import BasicButton from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {useStyles} from 'nice-ui/lib/styles/context';

const iconClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '30px',
  h: '30px',
  mr: '-2px 0 0 -2px',
  bg: 'rgba(250,250,250,.9)',
  bdrad: '15px',
  '& img': {
    bdrad: '2px',
  },
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

const buttonGroupClass = rule({
  d: 'flex',
  flexDirection: 'row-reverse',
  mr: '-4px -4px 4px 4px',
  pd: '0',
});

export interface UrlDisplayLayoutProps {
  url: string;
}

export const UrlDisplayLayout: React.FC<UrlDisplayLayoutProps> = ({url}) => {
  const [domain, domainTruncated] = React.useMemo(() => {
    const parsed = parseUrl(url);
    const domain = parsed?.hostname || '';
    const domainTruncated = domain && domain.length > 32 ? `${domain.slice(0, 32)}...` : domain;
    return [domain, domainTruncated];
  }, [url]);

  return (
    <>
      <Split>
        <FixedColumn left={36} style={{alignItems: 'center'}}>
          <div>
            <div className={iconClass}>
            {/* <div className={iconClass} style={{backgroundColor: 'red'}}> */}
              <Favicon domain={domain} url={url} />
            </div>
          </div>
          <div className={domainClass}>{domainTruncated}</div>
        </FixedColumn>
        <div className={buttonGroupClass}>
          <BasicButton width={32} height={32} round>
            <Iconista width={16} height={16} set={'lucide'} icon='copy' />
          </BasicButton>
          <BasicButton width={32} height={32} round>
            <Iconista width={16} height={16} set={'lucide'} icon='external-link' />
          </BasicButton>
        </div>
      </Split>
      <div className={linkClass}>
        <a href={url} target='_blank' rel='noopener noreferrer'>{url}</a>
      </div>
    </>
  );
};
