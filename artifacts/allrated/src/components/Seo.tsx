import { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
}

export function Seo({
  title,
  description = "Discover and stream movies, TV shows, anime and live sports. Personalised recommendations, watchlists — all in one place.",
}: SeoProps) {
  const fullTitle = title ? (title.includes("Movie Talk") ? title : `${title} — Movie Talk`) : "Movie Talk — Stream Movies, Shows, Anime & Live Sports";

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (property) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", description, true);

    return () => {
      document.title = "Movie Talk — Stream Movies, Shows, Anime & Live Sports";
    };
  }, [fullTitle, description]);

  return null;
}
