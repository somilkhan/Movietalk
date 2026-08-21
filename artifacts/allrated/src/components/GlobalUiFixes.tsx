/**
 * Global interaction/accessibility safeguards.
 *
 * Keep this file deliberately small: page-specific styling belongs with the
 * component/page that owns it. These rules exist only for cross-app behavior.
 */
export function GlobalUiFixes() {
  return (
    <style>{`
      :root {
        color-scheme: dark;
        --rr-focus-ring: 0 0 0 2px rgba(71, 82, 196, .95), 0 0 0 4px rgba(71, 82, 196, .22);
        --rr-safe-bottom: env(safe-area-inset-bottom, 0px);
      }

      html {
        background: #09090b;
        text-rendering: optimizeLegibility;
        -webkit-text-size-adjust: 100%;
      }

      body {
        min-height: 100dvh;
        margin: 0;
        background: #09090b;
        overscroll-behavior-y: none;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      :where(button, a, input, select, textarea, [role="button"], [tabindex]):focus-visible {
        outline: none !important;
        box-shadow: var(--rr-focus-ring) !important;
      }

      :where(button, a, [role="button"]) {
        -webkit-tap-highlight-color: transparent;
      }

      :where(button, a, input, select, textarea) {
        touch-action: manipulation;
      }

      img, video, canvas, svg {
        max-width: 100%;
      }

      img {
        display: block;
      }

      ::selection {
        background: rgba(71, 82, 196, .38);
        color: #fff;
      }

      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,.16) transparent;
      }

      *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      *::-webkit-scrollbar-track {
        background: transparent;
      }

      *::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,.14);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      *::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,.24);
        background-clip: padding-box;
      }

      [data-testid="page-explore"] [data-testid="title-card"] {
        width: 100% !important;
        min-width: 0 !important;
      }

      [data-testid="page-explore"] [data-testid="title-card"] > div {
        width: 100% !important;
      }

      [data-testid="page-explore"] [data-testid="title-card"] img {
        transition: transform .3s ease, opacity .3s ease;
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior: auto !important;
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }

      @media (max-width: 767px) {
        body {
          padding-bottom: var(--rr-safe-bottom);
        }
      }
    `}</style>
  );
}
