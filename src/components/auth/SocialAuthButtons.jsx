import React from 'react';
import ButtonSpinner from '../common/ButtonSpinner';

/**
 * Reusable Social Authentication Provider Buttons
 * Supports Google, Microsoft, GitHub, and future OAuth providers seamlessly.
 */
export default function SocialAuthButtons({
  onGoogleSignIn,
  onMicrosoftSignIn,
  onGithubSignIn,
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
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
      )
    },
    {
      id: 'github',
      name: 'GitHub',
      label: 'Continue with GitHub',
      action: onGithubSignIn,
      icon: (
        <svg
          className="w-4 h-4 shrink-0 fill-current text-[var(--text-primary)]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`space-y-2.5 ${className}`}>
      {providers.map((p) => {
        const isCurrentLoading = loadingProvider === p.id;
        const isAnyLoading = Boolean(loadingProvider);

        return (
          <button
            key={p.id}
            type="button"
            onClick={p.action}
            disabled={disabled || isAnyLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-3 transition-all duration-150 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] hover:border-slate-400 dark:hover:border-slate-700 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isCurrentLoading ? (
              <>
                <ButtonSpinner className="text-emerald-500 w-4 h-4" />
                <span className="text-[var(--text-secondary)]">Connecting to {p.name}...</span>
              </>
            ) : (
              <>
                {p.icon}
                <span>{p.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
