import * as React from 'react';
import {getUrl as getUrlDefault} from 'iconista/lib/getUrl';
import {useTheme} from 'nano-theme';
import useMountedState from 'react-use/lib/useMountedState';
import type {Icon} from 'iconista/lib/types';

const {useEffect, useState, useRef} = React;
const cache: {[key: string]: Document} = {};

// Replace literal `fill`/`stroke` colors in SVG source with `currentColor` so
// the icon picks up the surrounding CSS `color`.
const PAINT_RE = /\b(fill|stroke)=(["'])(?!(?:none|currentColor|transparent)\2|url\()[^"']*\2/g;
const SVG_OPEN_RE = /^(\s*<svg)([^>]*)(>)/;
const normalizeColors = (svgText: string): string => {
  let out = svgText.replace(PAINT_RE, '$1=$2currentColor$2');
  // Ensure the outer <svg> has a fill so inner paths without their own fill
  // (e.g. ibm_16) inherit the cascade.
  out = out.replace(SVG_OPEN_RE, (m, open, attrs, close) =>
    /\bfill=/.test(attrs) ? m : `${open} fill="currentColor"${attrs}${close}`,
  );
  return out;
};

export type Props = Icon &
  React.SVGAttributes<any> & {
    getUrl?: (icon: Icon) => string;
  };

const Svg: React.FC<Props> = ({set, icon, getUrl = getUrlDefault, ...rest}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const mounted = useMountedState();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const applyDoc = (doc: Document) => {
      const el = ref.current;
      if (!el) return;
      el.innerHTML = '';
      const svg = (doc as any).getRootNode().childNodes[0] as SVGSVGElement;
      const {childNodes} = svg;
      // Set SVG child nodes.
      for (let i = 0; i < childNodes.length; i++) el.appendChild(childNodes[i].cloneNode(true));
      // Set SVG attributes.
      for (let i = 0; i < svg.attributes.length; i++) {
        const {name, value} = svg.attributes[i];
        el.setAttribute(name, value);
      }
    };
    const key = `${set}:${icon}`;
    if (cache[key]) applyDoc(cache[key]);
    else {
      const el = ref.current;
      if (el && typeof rest.width === 'number' && typeof rest.height === 'number') {
        el.innerHTML = `<circle cx="${rest.width / 2}" cy="${rest.height / 2}" r="${Math.min(rest.width as number, rest.height as number) / 2}" fill="rgba(127,127,127,0.2)" />`;
      }
      const url = getUrl({set, icon} as Icon);
      fetch(url, {cache: 'force-cache'})
        .then((r) => r.text())
        .then((text) => {
          if (!mounted()) return;
          const parser = new DOMParser();
          const doc = parser.parseFromString(normalizeColors(text), 'application/xml');
          applyDoc((cache[key] = doc));
        })
        .catch((error) => {
          if (!mounted()) return;
          setError(error);
        });
    }
  }, [set, icon]);

  if (error) {
    const url = getUrl({set, icon} as Icon);
    return <img {...rest} src={url} alt={`${set}/${icon}`} title={error.message} />;
  }

  return <svg ref={ref} {...rest} />;
};

export type IconistaProps = Icon &
  React.SVGAttributes<any> & {
    color?: string;
  };

export const Iconista: React.FC<IconistaProps> = ({color, style, ...rest}) => {
  const theme = useTheme();

  const iconColor = color || theme.g(0.1, .9);

  return <Svg {...rest} style={{color: iconColor, ...style}} />;
};

export const makeIcon = (
  icon: Partial<IconistaProps> & Icon,
): React.FC<Partial<Icon> & Omit<IconistaProps, keyof Icon>> => {
  // Preload
  const url = getUrlDefault(icon);
  fetch(url, {cache: 'force-cache'}).catch(() => {});

  return (props) => React.createElement(Iconista, {...icon, ...props} as any);
};
