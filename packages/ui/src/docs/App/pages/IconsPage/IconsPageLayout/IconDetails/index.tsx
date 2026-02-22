import * as React from 'react';
import {useIconsGrid} from '../context';
import {rule} from 'nano-theme';
import {FormRow} from '../../../../../../3-list-item/FormRow';
import {usePromise} from '../../../../../../hooks/usePromise';
import {TextBlock} from '../../../../../../5-block/TextBlock';
import {Space} from '../../../../../../3-list-item/Space';
import {IconPreview} from './IconPreview';
import {Separator} from '../../../../../../3-list-item/Separator';
import {Flex} from '../../../../../../3-list-item/Flex';
import {Breadcrumb} from '../../../../../../3-list-item/Breadcrumbs';
import {Code} from '../../../../../../1-inline/Code';
import {Split} from '../../../../../../3-list-item/Split';
import {Link} from '../../../../../../1-inline/Link';
import {cdns} from '../cdn';

const blockClass = rule({
  minW: 'calc(min(300px, 70vw))',
  maxW: 'calc(min(800px, 90vw))',
  w: '100vw',
  pd: '16px',
});

export interface IconDetailsProps {
  set: string;
  icon: string;
}

export const IconDetails: React.FC<IconDetailsProps> = ({set, icon}) => {
  const state = useIconsGrid();
  const [src] = usePromise(state.getIconSrc(set, icon), [set, icon]);
  const [svgFormat, setSvgFormat] = React.useState<'svg' | 'iconista' | 'react'>('svg');
  const [dataEncoding, setDataEncoding] = React.useState<'utf-8' | 'url-encoded' | 'base64'>('utf-8');
  const [imageEncoding, setImageEncoding] = React.useState<'html' | 'markdown'>('html');
  const [cdn, setCdn] = React.useState<string>('jsdelivr');

  let svgText: string = '';
  if (src) {
    svgText = src;
    if (svgFormat === 'iconista')
      svgText = `import Iconista from 'iconista';\n\n<Iconista set="${set}" icon="${icon}" width="16" height="16" />`;
    else if (svgFormat === 'react')
      svgText = `import * as React from 'react';\n\nexport interface IconProps extends React.SVGProps<SVGSVGElement> {}\n\nexport const Icon: React.FC<IconProps> = (props) => (\n  ${src.replace('<svg ', '<svg {...props} ')}\n);\n`;
  }

  let dataUrl: string = '';
  if (src) {
    if (dataEncoding === 'utf-8') dataUrl = 'data:image/svg+xml;charset=utf-8,' + src;
    else if (dataEncoding === 'url-encoded') dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
    else if (dataEncoding === 'base64') dataUrl = 'data:image/svg+xml;base64,' + btoa(src);
  }

  return (
    <div className={blockClass}>
      <IconPreview set={set} icon={icon} />
      <Space size={8} />

      {!!svgText && (
        <>
          <FormRow
            title={'SVG'}
            description={
              svgFormat === 'svg' ? (
                'Copy-paste this directly into your HTML or your React component'
              ) : svgFormat === 'iconista' ? (
                <>
                  Install{' '}
                  <Code gray alt>
                    iconista
                  </Code>{' '}
                  package. It exports a React components which lazy-loads any icon as{' '}
                  <Code gray alt>
                    {'<svg>'}
                  </Code>{' '}
                  element.
                </>
              ) : (
                void 0
              )
            }
          >
            <TextBlock select lang={svgFormat === 'svg' ? 'html' : 'typescript'} src={svgText} />
            <Flex style={{columnGap: 8, padding: '8px 0 0'}}>
              <Breadcrumb compact selected={svgFormat === 'svg'} onClick={() => setSvgFormat('svg')}>
                SVG
              </Breadcrumb>
              <Breadcrumb compact selected={svgFormat === 'iconista'} onClick={() => setSvgFormat('iconista')}>
                Iconista
              </Breadcrumb>
              <Breadcrumb compact selected={svgFormat === 'react'} onClick={() => setSvgFormat('react')}>
                React
              </Breadcrumb>
            </Flex>
          </FormRow>
          <Space size={4} />
        </>
      )}
      <FormRow title={'Image'}>
        <TextBlock
          select
          lang={imageEncoding}
          src={
            imageEncoding === 'html'
              ? `<img src="${state.href(set, icon)}" width="16" height="16" />`
              : `![${icon}](${state.href(set, icon)})`
          }
        />
        <Flex style={{columnGap: 8, padding: '8px 0 0'}}>
          <Breadcrumb compact selected={imageEncoding === 'html'} onClick={() => setImageEncoding('html')}>
            HTML
          </Breadcrumb>
          <Breadcrumb compact selected={imageEncoding === 'markdown'} onClick={() => setImageEncoding('markdown')}>
            Markdown
          </Breadcrumb>
        </Flex>
      </FormRow>

      <Space size={8} />
      <Separator />
      <Space size={8} />

      <FormRow
        title={
          <Split>
            <div>{'CDN'}</div>
            <Link a to={state.href(set, icon, 'jsdelivr')} external>
              Open new tab
            </Link>
          </Split>
        }
      >
        <TextBlock select src={state.href(set, icon, cdn as any)} />
        <Flex style={{columnGap: 8, padding: '8px 0 0'}}>
          {
            [...cdns].map(([id, def]) => (
              <Breadcrumb key={id} compact selected={id === cdn} onClick={() => setCdn(id)}>
                {def.name}
              </Breadcrumb>
            ))!
          }
        </Flex>
      </FormRow>
      {!!dataUrl && (
        <>
          <Space size={4} />
          <FormRow
            title={
              <Split>
                <div>{'Data URL'}</div>
                <Link a to={dataUrl} external>
                  Open new tab
                </Link>
              </Split>
            }
          >
            <TextBlock select src={dataUrl} />
            <Flex style={{columnGap: 8, padding: '8px 0 0'}}>
              <Breadcrumb compact selected={dataEncoding === 'utf-8'} onClick={() => setDataEncoding('utf-8')}>
                UTF-8
              </Breadcrumb>
              <Breadcrumb
                compact
                selected={dataEncoding === 'url-encoded'}
                onClick={() => setDataEncoding('url-encoded')}
              >
                UTF-8 & URL-encoded
              </Breadcrumb>
              <Breadcrumb compact selected={dataEncoding === 'base64'} onClick={() => setDataEncoding('base64')}>
                Base64
              </Breadcrumb>
            </Flex>
          </FormRow>
        </>
      )}
    </div>
  );
};
