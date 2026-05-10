import * as React from 'react';
import {rule} from 'nano-theme';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {TextBlock} from '@jsonjoy.com/ui/lib/5-block/TextBlock';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ModalOverlay} from '../ModalOverlay';
import {useMuTxt} from '../../context';

const wrapperClass = rule({
  bxz: 'border-box',
  w: '100%',
  pd: '40px 40px 56px',
});

const gridClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '40px 56px',
  maxW: '1111px',
  mr: 'auto',
});

const sectionClass = rule({
  d: 'flex',
  fld: 'column',
  miw: 0,
  breakInside: 'avoid',
});

const titleRowClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  mar: '0 0 10px',
});

const introClass = rule({
  fz: '13.5px',
  lh: 1.55,
  mar: '12px 0 16px',
});

const linksClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '14px',
  fw: 'wrap',
  mar: '14px 0 0',
  fz: '13px',
});

const linkClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const ELEMENT_SNIPPET = `<mu-txt style="height:500px">
  Hello! Edit this text right in the page.
</mu-txt>
<script src="//cdn.jsdelivr.net/npm/mutxt-element"></script>`;

const REACT_SNIPPET = `import {MuTxt} from 'mutxt-react';

export const App = () =>
  <MuTxt autoFocus placeholder="Start typing…" />;`;

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  intro: React.ReactNode;
  snippet: string;
  lang: string;
  links: {label: string; href: string; icon?: React.ReactNode}[];
}

const Section: React.FC<SectionProps> = ({icon, title, intro, snippet, lang, links}) => {
  const styles = useStyles();
  return (
    <section className={sectionClass}>
      <div className={titleRowClass}>
        {icon}
        <MiniTitle component="div" contrast>
          {title}
        </MiniTitle>
      </div>
      <Separator />
      <Space />
      <div className={introClass} style={{color: styles.g(0.25, 0.85)}}>
        {intro}
      </div>
      <TextBlock src={snippet} lang={lang} select compact />
      <div className={linksClass} style={{color: styles.g(0.3, 0.8)}}>
        {links.map((link) => (
          <a
            key={link.href}
            className={linkClass}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            style={{color: styles.g(0.2, 0.95)}}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
};

const ExternalIcon: React.FC = () => (
  <Iconista set="tabler" icon="external-link" width={14} height={14} style={{opacity: 0.7}} />
);

export const EmbedDocsModal: React.FC = () => {
  const mutxt = useMuTxt();
  const open = mutxt.embedDocsOpen.use();
  const close = React.useCallback(() => mutxt.embedDocsOpen.set(false), [mutxt]);

  return (
    <ModalOverlay open={open} title="Embed this editor" onClose={close}>
      <div className={wrapperClass}>
        <div className={gridClass}>
          <Section
            icon={<Iconista set="simple" icon="html5" width={18} height={18} />}
            title="HTML — <mu-txt> custom element"
            intro={
              <>
                A drop-in web component. Works in any HTML page — no build step required. Children seed the document;
                children content can be plain text, Markdown, or Slate JSON via the <code>format</code> attribute.
              </>
            }
            snippet={ELEMENT_SNIPPET}
            lang="html"
            links={[
              {
                label: 'mutxt-element on npm',
                href: 'https://www.npmjs.com/package/mutxt-element',
                icon: <ExternalIcon />,
              },
              {
                label: 'README & docs',
                href: 'https://github.com/streamich/json-joy/tree/master/packages/mutxt-element',
                icon: <ExternalIcon />,
              },
            ]}
          />
          <Section
            icon={<Iconista set="simple" icon="react" width={18} height={18} />}
            title="React — <mutxt> component"
            intro={
              <>
                Batteries-included React component for tighter integration — seed from Slate JSON, hand in a
                Peritext-backed <code>json-joy</code> model for collaboration, and wire up your own presence manager.
              </>
            }
            snippet={REACT_SNIPPET}
            lang="jsx"
            links={[
              {
                label: 'mutxt-react on npm',
                href: 'https://www.npmjs.com/package/mutxt-react',
                icon: <ExternalIcon />,
              },
              {
                label: 'README & docs',
                href: 'https://github.com/streamich/json-joy/tree/master/packages/mutxt-react',
                icon: <ExternalIcon />,
              },
            ]}
          />
        </div>
      </div>
    </ModalOverlay>
  );
};
