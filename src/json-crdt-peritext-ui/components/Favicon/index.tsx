import {createElement as h, useMemo} from 'react';
import {Avatar} from 'nice-ui/lib/1-inline/Avatar';
import {Img, type ImgProps} from '../Img';
import {getDomain} from '../../web/util';

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
    src: 'https://www.google.com/s2/favicons?domain=' + domain,
    renderError: () =>
      h(Img, {
        ...rest,
        alt: domain + ' favicon',
        width: size,
        height: size,
        src: 'https://' + domain + '/favicon.ico',
        renderError: () => h(Avatar, {name: domain, width: size, height: size, letters: 1}),
      }),
  });
};
