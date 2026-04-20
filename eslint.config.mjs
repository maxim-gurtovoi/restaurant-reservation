import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

/**
 * ESLint 9 flat config for Next.js 16 + TypeScript.
 *
 * Baseline:
 *  - Next.js `core-web-vitals` (react, react-hooks, @next/next, jsx-a11y, import)
 *  - typescript-eslint `recommended` (catches real TS foot-guns: unused vars,
 *    unsafe `any`-casts, wrong `await` usage, etc.)
 *
 * Everything not explicitly allow-listed below relies on plugin defaults.
 * Keep rule tweaks minimal: only override when a rule produces more noise
 * than signal for this codebase.
 */
const config = [
  // Global ignores: generated code, external references, infra scripts,
  // migration SQL, and editor/build artifacts.
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'next-env.d.ts',
      'docs/**',
      'prisma/migrations/**',
      // CLI/cron scripts use node APIs + ad-hoc console — lint them separately
      // when we introduce dedicated rules for Node scripts.
      'scripts/**',
      // Generated Prisma client (just in case it leaks out of node_modules).
      '**/.prisma/**',
    ],
  },

  ...nextCoreWebVitals,
  ...tseslint.configs.recommended,

  // Project-wide rule adjustments.
  {
    rules: {
      // Allow `_`-prefixed unused args / vars. Matches common patterns where
      // server actions accept an unused `prevState` or we ignore a Promise result.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Next app-router components often take broad prop types from route params;
      // flipping this to a warning keeps the feedback without blocking builds.
      '@typescript-eslint/no-explicit-any': 'warn',

      // React 19 / react-hooks@7 rules. These catch real anti-patterns
      // (cascading renders, unstable refs). All existing call-sites have been
      // migrated (derived state, render-time state sync, `useSyncExternalStore`,
      // `useOptimistic`, refs updated in a commit-phase effect). A single
      // legitimate exception in `booking-mini-calendar` uses a point
      // `eslint-disable-next-line` with a rationale comment.
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/refs': 'error',
    },
  },

  // Config files and PostCSS — CommonJS-style globals and `require` are expected.
  {
    files: ['*.config.{js,mjs,cjs,ts}', 'postcss.config.{js,mjs}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
