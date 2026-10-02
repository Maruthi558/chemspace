import React from 'react';
import ButtonSpinner from '../common/ButtonSpinner';

/**
 * SocialAuthButtons
 * Strict 3-provider authentication interface for ChemSpace:
 * 1. Continue with Google
 * 2. Continue with Microsoft
 * 3. Continue with Apple
 *
 * Implements refined micro-interactions, consistent dimensions, official SVG icons,
 * keyboard accessibility, and non-blocking real loading states.
 */
export default function SocialAuthButtons({
  onGoogleSignIn,
  onMicrosoftSignIn,
  onAppleSignIn,
  loadingProvider = null,
  disabled = false,
  className = ''
}) {
  const providers = [
    {
      id: 'google',
      name: 'Google',
      label: 'Continue with Google',
      action: onGoogleSignIn,
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
          />
        </svg>
      )
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      label: 'Continue with Microsoft',
      action: onMicrosoftSignIn,
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
      )
    },
    {
      id: 'apple',
      name: 'Apple',
      label: 'Continue with Apple',
      action: onAppleSignIn,
      icon: (
        <svg
          className="w-5 h-5 shrink-0 fill-current text-[var(--text-primary)]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.85 2.74 1 .08 2.01-.54 2.55-1.24" />
        </svg>
      )
    }
  ];

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {providers.map((p) => {
        const isCurrentLoading = loadingProvider === p.id;
        const isAnyLoading = Boolean(loadingProvider);

        return (
          <button
            key={p.id}
            type="button"
            onClick={p.action}
            disabled={disabled || isAnyLoading}
            aria-label={p.label}
            className="group relative w-full h-12 px-5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3.5 transition-all duration-200 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] hover:border-slate-400 dark:hover:border-slate-600 shadow-sm hover:shadow-md hover:shadow-black/5 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isCurrentLoading ? (
              <div className="flex items-center gap-2.5">
                <ButtonSpinner className="text-orange-500 w-4 h-4" />
                <span className="text-[var(--text-secondary)] font-medium">Signing in with {p.name}...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="transition-transform duration-200 group-hover:scale-105">
                  {p.icon}
                </div>
                <span className="tracking-tight">{p.label}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
