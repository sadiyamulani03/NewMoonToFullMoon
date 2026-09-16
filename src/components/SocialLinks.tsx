import { useState } from 'react';
import { X_HANDLE, X_PROFILE_URL, X_PROFILE_STATUS, GITHUB_URL, DEMO_VIDEO_URL } from '../config';

function XIcon(props: { size?: number }) {
  return (
    <svg width={props.size ?? 14} height={props.size ?? 14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.9 7.9L23 22h-6.4l-5-6.5L5.9 22H2.8l7.4-8.4L2 2h6.6l4.5 5.9L18.9 2Zm-1.1 18h1.8L6.2 3.9H4.1L17.8 20Z" />
    </svg>
  );
}
function GitHubIcon(props: { size?: number }) {
  return (
    <svg width={props.size ?? 14} height={props.size ?? 14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69a3.7 3.7 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.37.95.13 1.99.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function XProfileLink({ variant = 'default', showHandle = true }: { variant?: 'default' | 'pill' | 'inline' | 'card'; showHandle?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(`@${X_HANDLE}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  if (variant === 'pill') {
    return (
      <a
        href={X_PROFILE_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="x-pill"
        aria-label={`X profile @${X_HANDLE} — opens in new tab`}
        title={`@${X_HANDLE} on X — ${X_PROFILE_STATUS === 'appeal' ? 'currently under appeal, backup via GitHub' : 'live'}`}
      >
        <XIcon size={13} />
        {showHandle && <span>@{X_HANDLE}</span>}
        <span aria-hidden="true">↗</span>
        {X_PROFILE_STATUS === 'appeal' && <span className="x-pill-badge">appeal</span>}
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <a href={X_PROFILE_URL} target="_blank" rel="noreferrer noopener" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <XIcon /> @{X_HANDLE} ↗
        </a>
        <button onClick={copy} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.74rem' }} type="button">
          {copied ? 'Copied ✓' : 'Copy handle'}
        </button>
        {X_PROFILE_STATUS === 'appeal' && (
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', border: '1px solid var(--line)', padding: '2px 6px', borderRadius: 999 }}>
            under appeal — see GitHub/docs backup
          </span>
        )}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className="ledger" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ledger-head">
          <span className="ledger-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><XIcon /> X — public product profile</span>
          <span className={X_PROFILE_STATUS === 'appeal' ? 'stamp stamp-pending stamp-small' : 'stamp stamp-verify stamp-small'}>{X_PROFILE_STATUS === 'appeal' ? 'Appeal' : 'Live'}</span>
        </div>
        <div style={{ padding: '14px 14px', display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={X_PROFILE_URL} target="_blank" rel="noreferrer noopener" className="btn btn-primary" style={{ gap: 8 }}>
              <XIcon /> Open @{X_HANDLE} ↗
            </a>
            <button onClick={copy} className="btn btn-cream" type="button">{copied ? 'Copied ✓' : 'Copy @handle'}</button>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" className="btn btn-ghost" style={{ gap: 6 }}><GitHubIcon /> GitHub ↗</a>
          </div>
          <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
            {X_PROFILE_URL} · <span style={{ color: X_PROFILE_STATUS === 'appeal' ? 'var(--ochre)' : 'var(--verify)' }}>{X_PROFILE_STATUS === 'appeal' ? 'Account flagged — appeal filed. Use GitHub + demo as primary verification until restored.' : 'Live profile with launch threads.'}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Launch threads mirror <code className="mono">docs/posts.md</code>. Backup verification: <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub repo</a> · <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer">demo video</a> · <a href="/about">privacy model</a>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <a href={X_PROFILE_URL} target="_blank" rel="noreferrer noopener" aria-label={`X profile @${X_HANDLE}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <XIcon /> X @{X_HANDLE} ↗
    </a>
  );
}

export function SocialBar({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <a href={X_PROFILE_URL} target="_blank" rel="noreferrer noopener" className={compact ? 'x-pill' : 'btn btn-ghost'} style={compact ? undefined : { padding: '6px 10px', fontSize: '0.8rem' }}>
        <XIcon /> @{X_HANDLE} ↗
      </a>
      <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" className={compact ? 'x-pill x-pill-ghost' : 'btn btn-ghost'} style={compact ? undefined : { padding: '6px 10px', fontSize: '0.8rem' }}>
        <GitHubIcon /> GitHub ↗
      </a>
      {!compact && (
        <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer noopener" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
          Demo video ↗
        </a>
      )}
    </div>
  );
}
