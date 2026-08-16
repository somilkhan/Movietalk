export function GlobalUiFixes() {
  return <style>{`
    input:focus, input:focus-visible, select:focus, select:focus-visible, button:focus { outline: none !important; }
    input:focus-visible, select:focus-visible, button:focus-visible, a:focus-visible {
      box-shadow: 0 0 0 2px rgba(255,255,255,.16) !important;
    }
    [data-testid="page-explore"] [data-testid="title-card"] { width: 100% !important; min-width: 0 !important; }
    [data-testid="page-explore"] [data-testid="title-card"] > div { width: 100% !important; }
    [data-testid="page-explore"] [data-testid="title-card"] img { transition: transform .3s ease, opacity .3s ease; }
  `}</style>;
}
