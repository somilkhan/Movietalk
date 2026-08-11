// Curated visual-only lists for browse rails that don't map to a single TMDB endpoint.

export const STUDIOS = [
  { name: 'Hotstar Specials', image: 'https://api.bingr.one/static/categories/1739441155598-a.webp' },
  { name: 'Disney+', image: 'https://api.bingr.one/static/categories/1747996723703-a.webp' },
  { name: 'HBO Max', image: 'https://api.bingr.one/static/categories/1775539725531-a.webp' },
  { name: 'Peacock', image: 'https://api.bingr.one/static/categories/1739359307816-a.webp' },
  { name: 'Paramount+', image: 'https://api.bingr.one/static/categories/1739358280583-a.webp' },
  { name: 'Netflix', image: 'https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp' },
] as const;

export const GENRES = [
  { name: 'Romance', image: 'https://api.bingr.one/static/categories/1750239101112-a.webp' },
  { name: 'Drama', image: 'https://api.bingr.one/static/categories/1535285-a-88035ca1ae69.webp' },
  { name: 'Family', image: 'https://api.bingr.one/static/categories/1535284-a-656c6b45a905.webp' },
  { name: 'Reality', image: 'https://api.bingr.one/static/categories/1535264-a-9e7871687c76.webp' },
  { name: 'Comedy', image: 'https://api.bingr.one/static/categories/1535292-a-5739f9c84b63.webp' },
  { name: 'Action', image: 'https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp' },
  { name: 'Thriller', image: 'https://api.bingr.one/static/categories/1535246-a-27373cc1a222.webp' },
  { name: 'Crime', image: 'https://api.bingr.one/static/categories/1535288-a-690bac400aa1.webp' },
  { name: 'Horror', image: 'https://api.bingr.one/static/categories/1535279-a-c92b487cb711.webp' },
  { name: 'Sci-Fi', image: 'https://api.bingr.one/static/categories/1535259-a-6e0b7daffb29.webp' },
  { name: 'Animation', image: 'https://api.bingr.one/static/categories/1535299-a-e6296badeb14.webp' },
  { name: 'Documentary', image: 'https://api.bingr.one/static/categories/1535286-a-f282f00643b5.webp' },
] as const;

export const LANGUAGES = [
  { name: 'English',   sublabel: undefined,    image: 'https://api.bingr.one/static/categories/1526660-a-afdd1ecfd8ae.webp' },
  { name: '日本',       sublabel: 'Japanese',   image: 'https://api.bingr.one/static/categories/1750233039896-a.webp' },
  { name: '한국어',     sublabel: 'Korean',     image: 'https://api.bingr.one/static/categories/1526670-a-ec8fb58a5fb8.webp' },
  { name: 'हिन्दी',    sublabel: 'Hindi',      image: 'https://api.bingr.one/static/categories/1526661-a-00b818b5bc0e.webp' },
  { name: 'Português', sublabel: 'Portuguese', image: 'https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp' },
  { name: 'Español',   sublabel: 'Spanish',    image: 'https://api.bingr.one/static/categories/1535288-a-690bac400aa1.webp' },
] as const;

/** Browse section: top-level content types — gradient cards with icon watermarks, matching bingr.one. */
export const CATEGORY_GROUPS = [
  { name: 'Sports',  href: '/sports',     gradient: 'from-[#1a2a4a] to-[#0d1a35]' },
  { name: 'Sparks',  href: '/spark',      gradient: 'from-[#1a2a3a] to-[#0d1a2a]' },
  { name: 'Anime',   href: '/anime',      gradient: 'from-[#1e2a3a] to-[#111827]' },
  { name: 'TV',      href: '/tv',         gradient: 'from-[#1a2535] to-[#0e1621]' },
  { name: 'Movies',  href: '/movies',     gradient: 'from-[#1e2030] to-[#12131e]' },
  { name: 'News',    href: '/categories', gradient: 'from-[#1a2028] to-[#0e1318]' },
] as const;

/** Popular sports for the Categories page sports rail — gradient + sport icon */
export const POPULAR_SPORTS = [
  { name: 'Cricket',    gradient: 'from-[#1b2f1b] to-[#0d1a0d]' },
  { name: 'Football',   gradient: 'from-[#1a2a1a] to-[#0e1c0e]' },
  { name: 'Badminton',  gradient: 'from-[#1e1a2e] to-[#12101e]' },
  { name: 'Mixed',      gradient: 'from-[#2e1a1a] to-[#1e0e0e]' },
  { name: 'Racing',     gradient: 'from-[#2e2010] to-[#1e1408]' },
  { name: 'Basketball', gradient: 'from-[#2e1e10] to-[#1e1208]' },
] as const;

export const GENRE_GRADIENTS = [
  'from-amber-500 to-orange-800',
  'from-rose-500 to-red-900',
  'from-sky-500 to-blue-900',
  'from-emerald-500 to-teal-800',
  'from-violet-600 to-fuchsia-900',
  'from-pink-500 to-rose-900',
  'from-indigo-500 to-violet-900',
  'from-yellow-500 to-amber-800',
];
