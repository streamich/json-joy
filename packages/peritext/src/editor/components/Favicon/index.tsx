import {createElement as h, useMemo} from 'react';
import {Avatar} from '@jsonjoy.com/ui/lib/1-inline/Avatar';
import {Img, type ImgProps} from '../Img';
import {getDomain} from '../../util';

export interface FaviconProps extends ImgProps {
  url?: string;
  domain?: string;
  size?: number;
}

export const Favicon: React.FC<FaviconProps> = (props) => {
  const {domain: _domain, url, size = 16, ...rest} = props;
  const domain = useMemo(() => _domain || getDomain(url || ''), [_domain, url]);

  if (!domain) return h(Avatar, {name: url || domain, width: size, height: size, letters: 1});

  return h(Img, {
    ...rest,
    alt: domain + ' favicon',
    width: size,
    height: size,
    /**
     * Favicon services:
     * - https://icons.duckduckgo.com/ip2/{hostname}.ico
     * - https://www.google.com/s2/favicons?domain={domain}
     * - https://www.google.com/s2/favicons?domain_url={hostname}
     * - https://www.google.com/s2/favicons?sz=(16..32..64..128..256..512)&domain_url=...
     * - http://favicon.yandex.net/favicon/{domain-1}/{domain-2}/{domain-3}/...
     * - https://favicon.yandex.net/favicon/{hostname1}/{hostname2}/
     * - https://f1.allesedv.com/16/{hostname}
     * - https://besticon-demo.herokuapp.com/icon?url={hostname}&size=80..120..200
     */
    src: 'https://www.google.com/s2/favicons?sz=64&domain=' + domain,
    renderError: () =>
      h(Img, {
        ...rest,
        alt: domain + ' favicon',
        width: size,
        height: size,
        src: 'https://' + domain + '/favicon.ico',
        renderError: () => h(Avatar, {name: domain.toUpperCase(), width: size, height: size, letters: 1}),
      }),
  });
};
