import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import Paper from '../../4-card/Paper';
import {Link} from '../../1-inline/Link';
import {Code} from '../../1-inline/Code';
import {CopyCode} from '../../1-inline/CopyCode';
import {Iconista} from '../../icons/Iconista';
import BasicButton from '../../2-inline-block/BasicButton';
import {BasicButtonCopy} from '../../2-inline-block/BasicButton/BasicButtonCopy';
import DownloadIcon__svg from 'iconista/lib/react/auth0/download';
import {useT} from 'use-t';
import type {ContentPage} from './types';
import {downloadPageAsMarkdown, downloadFile} from './util';
import {Separator} from '../../3-list-item/Separator';
import {Space} from '../../3-list-item/Space';
import {Flex} from '../../3-list-item/Flex';

export interface Props {
  page: ContentPage;
}

const bp = '@media only screen and (max-width: 800px)';

const rowClass = rule({
  ...theme.font.display.mid,
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  [bp]: {flexDirection: 'column', alignItems: 'stretch', gap: '20px'},
});

const infoClass = rule({
  minWidth: 0,
});

const linksClass = rule({
  d: 'flex',
  flexDirection: 'row',
  ai: 'center',
  gap: '24px',
  minWidth: 0,
  maxWidth: '100%',
  [bp]: {alignItems: 'flex-start'},
});

const linkClass = rule({
  d: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  fontSize: '15px',
  fontWeight: 600,
  td: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {td: 'none'},
  '.label': {textDecorationLine: 'none', textUnderlineOffset: '5px'},
  '.arrow': {trs: 'transform .2s'},
  '&:hover .label': {textDecorationLine: 'underline'},
  '&:hover .arrow': {transform: 'translate(2px, -2px)'},
});

const pkgRowClass = rule({
  d: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  pd: '0',
});

const pkgCodeClass = rule({
  flexShrink: 0,
});

const pkgAboutClass = rule({
  ...theme.font.display.lite,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '14px',
});

interface ExternalLinkProps {
  to: string;
  iconName?: string;
  color: string;
  label: React.ReactNode;
  /** Accessible name; falls back to the visible label when omitted. */
  ariaLabel?: string;
  chip?: React.ReactNode;
  lite?: boolean;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({to, iconName, color, label, ariaLabel, chip, lite}) => (
  <Link
    a
    to={to}
    target="_blank"
    aria-label={ariaLabel}
    className={linkClass}
    style={{color, fontWeight: lite ? 400 : void 0}}
  >
    {iconName && (
      <Iconista
        aria-hidden
        set={'fontawesome_brands' as any}
        icon={iconName as any}
        width={18}
        height={18}
        color={color}
      />
    )}
    <span
      className="label"
      style={{padding: '0 0 0 4px', textDecorationColor: `color-mix(in srgb, ${color} 25%, transparent)`}}
    >
      {label}
    </span>
    {/* {chip != null && (
      <Code spacious outline>
        {chip}
      </Code>
    )} */}
    <Iconista
      aria-hidden
      className="arrow"
      set={'lucide' as any}
      icon={'arrow-up-right' as any}
      width={16}
      height={16}
      color={color}
    />
  </Link>
);

/** Last path segment, dropping any `@scope/` or `owner/` prefix. */
const stripPrefix = (name: string): string => (name.includes('/') ? name.slice(name.lastIndexOf('/') + 1) : name);

// Issues for all libraries are filed in the json-joy monorepo, from a template.
const issueUrl = 'https://github.com/streamich/json-joy/issues/new?template=bug_report.md';

export const LibraryInfo: React.FC<Props> = (props) => {
  const [t] = useT();
  const styles = useStyles();
  const {page} = props;
  const {repo, repoPath, pkg} = page;

  if (!repo && !pkg) return null;

  const color = styles.g(0.1);
  const shortName = stripPrefix(pkg ?? repo ?? '');
  const npmName = pkg ?? (page as any).libId ?? shortName;
  const about = page.about || page.subtitle;
  // External links open in a new tab; announce that to screen readers.
  const newTab = t('opens in new tab');

  const onDownloadClick = async (): Promise<void> => {
    const md = await downloadPageAsMarkdown(page);
    downloadFile(`${page.slug}.md`, md.text, 'text/markdown');
  };

  const onCopyClick = async (): Promise<string> => {
    const md = await downloadPageAsMarkdown(page);
    return md.text;
  };

  const links = (
    <div className={rowClass}>
      <span className={infoClass}>
        <h3 style={{...theme.font.ui2.bold, fontSize: '16px', color: styles.g(0.1), margin: 0}}>
          {t('Get the library')}
        </h3>
        {/* <div style={{...theme.font.ui2.lite, fontSize: '14px', color: styles.g(0.4), marginTop: 4}}>
          {t('Grab the source or install the package')}
        </div> */}
      </span>
      <span className={linksClass}>
        {!!repo && (
          <ExternalLink
            to={`https://github.com/${repo}${repoPath ? `/${repoPath}` : ''}`}
            iconName="github"
            color={color}
            label={t('GitHub')}
            ariaLabel={`${t('GitHub repository')}: ${shortName} (${newTab})`}
            chip={shortName}
          />
        )}
        {!!pkg && (
          <ExternalLink
            to={`https://www.npmjs.com/package/${pkg}`}
            iconName="npm"
            color={color}
            label={t('NPM')}
            ariaLabel={`${t('npm package')}: ${npmName} (${newTab})`}
            chip={npmName}
          />
        )}
        {!!pkg && (
          <span style={{fontSize: '.9em', minWidth: 0, maxWidth: '100%'}}>
            <CopyCode roundest truncate value={`npm i ${pkg}`} />
          </span>
        )}
      </span>
    </div>
  );

  const docs = (
    <Flex style={{justifyContent: 'space-between', alignItems: 'center', gap: 16}}>
      <h3 style={{...theme.font.ui2.bold, fontSize: '16px', color: styles.g(0.1), margin: 0}}>{t('Documentation')}</h3>
      <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
        {/* <BasicButton to={issueUrl} target="_blank" rounder height={32} width={'auto'} style={{marginRight: 6}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            {t('Report issue')}
            <Iconista set={'lucide' as any} icon={'arrow-up-right' as any} width={12} height={12} color={color} />
          </span>
        </BasicButton> */}
        <div style={{paddingRight: 22}}>
          <ExternalLink
            lite
            to={issueUrl}
            // iconName="npm"
            color={color}
            label={t('Report an issue')}
            ariaLabel={`${t('Report an issue')} (${newTab})`}
            // chip={npmName}
          />
        </div>
        <BasicButton bdradR={3} rounder border height={32} width={'auto'} onClick={onDownloadClick}>
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <DownloadIcon__svg aria-hidden width={16} height={16} />
            {t('Download as Markdown')}
          </span>
        </BasicButton>
        <BasicButtonCopy
          aria-label={t('Copy page as Markdown')}
          bdradL={3}
          rounder
          border
          size={32}
          onCopy={onCopyClick}
        />
      </div>
    </Flex>
  );

  return (
    <>
      <Paper round hover style={{padding: '24px 28px', background: '#fff'}}>
        {!!pkg && (
          <div className={pkgRowClass} style={{color: styles.g(0.1)}}>
            <Code outline className={pkgCodeClass}>
              {pkg}
            </Code>
            {!!about && (
              <span className={pkgAboutClass} style={{color: styles.g(0.4)}}>
                <span aria-hidden>&mdash; </span>
                {about}
              </span>
            )}
          </div>
        )}
        <Space size={2} />
        <Separator />
        <Space size={2} />
        {links}
        <Space size={2} />
        <Separator />
        <Space size={2} />
        {docs}
      </Paper>
      <Space size={4} />
    </>
  );
};
