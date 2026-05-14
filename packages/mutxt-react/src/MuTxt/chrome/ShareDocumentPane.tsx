import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {TextBlock} from '@jsonjoy.com/ui/lib/5-block/TextBlock';
import {FormRow} from '@jsonjoy.com/ui/lib/3-list-item/FormRow';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../context';
import {encodeShareBlob, encodeEncryptedShareBlob} from '../util/shareEncoding';
import {buildShareUrl, writeClipboard} from '../util/share';
import type {MuTxtState} from '../state/MuTxtState';
import {useT} from 'use-t';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import LockIcon__svg from 'iconista/lib/react/tabler/lock';

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LockIcon__svg width={16} height={16} {...props} />;

const stopKeyDown = (e: React.KeyboardEvent): void => {
  e.stopPropagation();
};

// Container that hard-caps the popup width so a long URL inside the link
// preview can never push the popup wider mid-session.
const formClass = rule({
  d: 'flex',
  fld: 'column',
  // gap: '12px',
  w: '100%',
  pd: '4px 16px 8px',
  bxz: 'border-box',
  // Critical: in a flex parent the auto min-width is min-content; without
  // this, a long single-line URL would force the column to grow.
  minW: 0,
});

const passwordRowClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '6px',
});

const socialRowClass = rule({
  d: 'flex',
  fld: 'row',
  gap: '8px',
  flexWrap: 'wrap',
});

const sectionDescriptionClass = rule({
  fz: '12px',
  lh: 1.45,
  mr: '0 0 10px',
});

const errorClass = rule({
  fz: '12px',
  lh: 1.4,
  pdt: '4px',
});

const messageInputClass = rule({
  '& textarea': {
    resize: 'none',
  },
});

interface SocialTarget {
  id: 'x' | 'facebook' | 'linkedin' | 'reddit';
  label: string;
  icon: 'brand-x' | 'brand-facebook' | 'brand-linkedin' | 'brand-reddit';
  href: (url: string, text: string) => string;
}

const SOCIAL_TARGETS: readonly SocialTarget[] = [
  {
    id: 'x',
    label: 'X',
    icon: 'brand-x',
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'brand-facebook',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'brand-linkedin',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: 'brand-reddit',
    href: (url, text) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
];

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

const DEFAULT_TITLE = 'Shared MuTxt document';

const getDefaultTitle = (mutxt: MuTxtState): string => {
  try {
    const outline = mutxt.outline();
    const first = outline.find((o) => o.title.trim());
    if (first) return first.title.trim();
  } catch {}
  return DEFAULT_TITLE;
};

export const ShareDocumentForm: React.FC = () => {
  const [t] = useT();
  const mutxt = useMuTxt();
  const styles = useStyles();
  const [title, setTitle] = React.useState(() => getDefaultTitle(mutxt));
  const [message, setMessage] = React.useState('');
  const [encrypt, setEncrypt] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [shareUrl, setShareUrl] = React.useState('');
  const [encoding, setEncoding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [htmlCopied, setHtmlCopied] = React.useState(false);

  const bytesRef = React.useRef<Uint8Array | null>(null);
  if (!bytesRef.current) bytesRef.current = mutxt.api.toBinary();
  const bytes = bytesRef.current;
  const effectiveTitle = title.trim() || DEFAULT_TITLE;
  const recomputeRef = React.useRef(0);

  const recompute = React.useCallback(async () => {
    const token = ++recomputeRef.current;
    setEncoding(true);
    setError(null);
    try {
      let encoded: string;
      if (encrypt) {
        if (!password) {
          if (recomputeRef.current === token) {
            setShareUrl('');
            setEncoding(false);
          }
          return;
        }
        encoded = await encodeEncryptedShareBlob(bytes, password);
      } else {
        encoded = await encodeShareBlob(bytes);
      }
      if (recomputeRef.current !== token) return;
      setShareUrl(buildShareUrl(encoded, encrypt, effectiveTitle, message));
    } catch (err) {
      if (recomputeRef.current !== token) return;
      setError(err instanceof Error ? err.message : 'Failed to encode the document.');
      setShareUrl('');
    } finally {
      if (recomputeRef.current === token) setEncoding(false);
    }
  }, [bytes, encrypt, password, effectiveTitle, message]);

  React.useEffect(() => {
    void recompute();
  }, [recompute]);

  const openSocial = (target: SocialTarget) => {
    if (!shareUrl) return;
    const text = message.trim() || effectiveTitle;
    const href = target.href(shareUrl, text);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const onCopyHtmlLink = async (): Promise<void> => {
    if (!shareUrl) return;
    const html = `<a href="${escapeHtml(shareUrl)}">${escapeHtml(effectiveTitle)}</a>`;
    try {
      await writeClipboard(html);
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 2000);
      mutxt.toasts?.add({title: 'HTML link copied to clipboard.', duration: 3000});
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[mutxt] copy html link failed', err);
      mutxt.toasts?.add({type: 'error', title: 'Failed to copy HTML link.', duration: 5000});
    }
  };

  const errorColor = styles.col.get('error', 'solid-1');

  return (
    <div className={formClass}>
      <FormRow title={t('Display')}>
        <Input type="text" value={title} placeholder={t('Title')} onChange={setTitle} onKeyDown={stopKeyDown} />
        <Space />
        <div className={messageInputClass}>
          <Input
            type="text"
            multiline
            value={message}
            placeholder={t('Message')}
            onChange={setMessage}
            onKeyDown={stopKeyDown}
          />
        </div>
      </FormRow>

      <FormRow
        title={
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
            <LockIcon />
            {t('Encrypt')}
          </span>
        }
        descriptionAbove
        description={t('Encrypts with AES-GCM 256 (PBKDF2).')}
        right
      >
        <div style={{width: 60, marginTop: -24}}>
          <Checkbox on={encrypt} onChange={() => setEncrypt(!encrypt)} />
        </div>
      </FormRow>
      {encrypt && (
        <div className={passwordRowClass}>
          <Input
            type="password"
            value={password}
            label={t('Password')}
            placeholder={t('Choose a strong password')}
            onChange={setPassword}
            onKeyDown={stopKeyDown}
          />
        </div>
      )}

      {!!shareUrl && (
        <>
          <Space size={2} />
          <Separator />
          <Space size={1} />
        </>
      )}

      {!!shareUrl && (
        <FormRow
          title={
            <Split>
              <div>{t('Share link')}</div>
              <div className={sectionDescriptionClass} style={{color: styles.g(0.4)}}>
                {encoding
                  ? t('Encoding…')
                  : shareUrl
                    ? `${formatBytes(shareUrl.length)} · ${encrypt ? t('Encrypted') : t('Plaintext')}`
                    : null}
              </div>
            </Split>
          }
        >
          {error ? (
            <div className={errorClass} style={{color: errorColor}}>
              {error}
            </div>
          ) : (
            <div style={{maxWidth: '100%'}}>
              <TextBlock src={shareUrl} select lang="text" />
            </div>
          )}
        </FormRow>
      )}

      {shareUrl && (
        <FormRow
          title={t('Post to social media')}
          descriptionAbove
          description={t("Opens the platform's share dialog.")}
        >
          <div className={socialRowClass}>
            {SOCIAL_TARGETS.map((t) => (
              <BasicButton
                key={t.id}
                type="button"
                width={'auto'}
                height={32}
                compact
                border
                disabled={!shareUrl}
                onClick={() => openSocial(t)}
              >
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                  <Iconista set={'tabler' as any} icon={t.icon as any} width={16} height={16} />
                  {/* {t.label} */}
                </span>
              </BasicButton>
            ))}
            <Separator style={{width: 1, height: 32}} />
            <BasicButton
              type="button"
              width={'auto'}
              height={32}
              compact
              border
              disabled={!shareUrl}
              onClick={onCopyHtmlLink}
            >
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <Iconista set={'tabler' as any} icon={'code' as any} width={16} height={16} />
                {htmlCopied ? t('Copied!') : t('Copy HTML')}
              </span>
            </BasicButton>
          </div>
        </FormRow>
      )}
    </div>
  );
};
