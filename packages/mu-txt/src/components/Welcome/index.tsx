import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {MuTxtLogo} from '@jsonjoy.com/ui/lib/icons/svg/MuTxtLogo';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useExplorer} from '../../context';
import {host} from '../../util/host';
import {BrandLogo} from '../LeftSidebar/BrandLogo';
import {ActionCard} from './ActionCard';
import {RecentFiles} from './RecentFiles';

const NewDocIcon = makeIcon({set: 'bootstrap', icon: 'file-earmark-plus', width: 18, height: 18});
const TemplateIcon = makeIcon({set: 'bootstrap', icon: 'collection', width: 18, height: 18});
const FolderIcon = makeIcon({set: 'bootstrap', icon: 'folder2-open', width: 18, height: 18});

const blockClass = rule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'flex-start',
  w: '100%',
  h: '100%',
  pd: '32px 24px',
  bxz: 'border-box',
  overflowY: 'auto',
});

const innerClass = rule({
  w: '100%',
  maxW: '680px',
  d: 'flex',
  fld: 'column',
  ai: 'stretch',
  margin: '0 auto',
});

const heroClass = rule({
  ta: 'center',
  mr: '0 0 24px',
});

const logoTileClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '128px',
  h: '80px',
  bdrad: '32px',
  mr: '0 auto',
  pd: '8px 0 0',
  bxz: 'border-box',
});

const titleClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  gap: '6px',
  fontSize: '28px',
  lineHeight: '1.2em',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  mr: '-20px 0 6px',
});

const subtitleClass = rule({
  fontSize: '14px',
  lineHeight: '1.55em',
  opacity: 0.62,
  margin: '0 auto',
  fontWeight: 400,
  maxWidth: '440px',
});

const actionsClass = rule({
  display: 'grid',
  gap: '12px',
  width: '100%',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  alignItems: 'stretch',
  '> span, > span span': {
    display: 'flex',
    height: '100%',
    width: '100%',
    minWidth: 0,
  },
  '@media (max-width: 720px)': {
    gridTemplateColumns: '1fr',
  },
});

const sectionHeadClass = rule({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  margin: '32px 0 10px',
  padding: '0 4px',
});

const sectionTitleClass = rule({
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  opacity: 0.5,
  margin: 0,
});

const sectionHintClass = rule({
  fontSize: '11px',
  opacity: 0.45,
});

const footerClass = rule({
  margin: '36px 0 0',
  padding: '20px 0 0',
  fontSize: '11.5px',
  textAlign: 'center',
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  opacity: 0.55,
});

const dotClass = rule({
  width: '3px',
  height: '3px',
  borderRadius: '50%',
  background: 'currentColor',
  opacity: 0.5,
});

const inputClass = rule({display: 'none'});

const brandWrapClass = rule({
  display: 'inline-flex',
  alignItems: 'center',
  transform: 'translate(4px, 2px) scale(1.3)',
});

export type WelcomeProps = Record<string, never>;

export const Welcome: React.FC<WelcomeProps> = () => {
  const [t] = useT();
  const theme = useTheme();
  const state = useExplorer();
  const saved = state.saved.use();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const onOpenClick = React.useCallback(() => {
    if (host) void host.openDialog();
    else inputRef.current?.click();
  }, []);
  const onInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length) void state.addFiles(Array.from(files));
      e.currentTarget.value = '';
    },
    [state],
  );

  const recent = saved.slice(0, 5);

  return (
    <div className={blockClass}>
      <div className={innerClass}>
        <header className={heroClass}>
          <div
            className={logoTileClass}
          >
            <MuTxtLogo size={108} />
          </div>
          <h1 className={titleClass} style={{color: theme.g(0.08, 0.97)}}>
            <span>{t('Welcome to')}</span>
            <span className={brandWrapClass}>
              <BrandLogo color={theme.g(0.08, 0.97)} />
            </span>
          </h1>
          <p className={subtitleClass}>
            {t('A local-first rich-text editor. Saves to your disk, works offline, no account needed.')}
          </p>
        </header>

        <div className={actionsClass}>
          <ActionCard
            icon={<NewDocIcon />}
            title={t('New document')}
            description={t('Start with a blank page')}
            onClick={() => state.createNewMuTxt()}
          />
          <Popup
            block
            renderContext={() => <ContextMenu inset showSearch menu={state.menus.newFileMenu()} />}
            tooltip={{renderTooltip: () => t('Browse templates'), nowrap: true}}
          >
            <ActionCard
              icon={<TemplateIcon />}
              title={t('From template')}
              description={t('Notes, journal, and more')}
            />
          </Popup>
          <ActionCard
            icon={<FolderIcon />}
            title={t('Open file')}
            description={t('Or drop one anywhere')}
            onClick={onOpenClick}
          />
          <input
            ref={inputRef}
            type="file"
            multiple
            className={inputClass}
            onChange={onInputChange}
          />
        </div>

        {recent.length > 0 && (
          <div style={{maxWidth: 480, width:'100%', margin: 'auto'}}>
            <div className={sectionHeadClass}>
              <h2 className={sectionTitleClass} style={{color: theme.g(0.2, 0.9)}}>
                {t('Recent')}
              </h2>
              {saved.length > recent.length && (
                <span className={sectionHintClass}>
                  {`+${saved.length - recent.length} ${t('more in sidebar')}`}
                </span>
              )}
            </div>
            <RecentFiles files={recent} />
          </div>
        )}

        <footer className={footerClass} style={{color: theme.g(0.3, 0.7)}}>
          <span>{t('Local-first')}</span>
          <div className={dotClass} />
          <span>{t('Auto-saved')}</span>
          <div className={dotClass} />
          <span>{t('Sync-ready')}</span>
          <div className={dotClass} />
          <a
            href="https://jsonjoy.com/specs/json-crdt"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px'}}
          >
            {t('Powered by JSON CRDT')}
          </a>
        </footer>
      </div>
    </div>
  );
};
