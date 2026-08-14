// Curated visual-only lists for browse rails that don't map to a single TMDB endpoint.

export const STUDIOS = [
  { name: 'Hotstar Specials', image: 'https://api.bingr.one/static/categories/1739441155598-a.webp' },
  { name: 'Disney+', image: 'https://api.bingr.one/static/categories/1747996723703-a.webp' },
  { name: 'HBO Max', image: 'https://api.bingr.one/static/categories/1775539725531-a.webp' },
  { name: 'Peacock', image: 'https://api.bingr.one/static/categories/1739359307816-a.webp' },
  { name: 'Paramount+', image: 'https://api.bingr.one/static/categories/1739358280583-a.webp' },
  { name: 'Netflix', image: 'https://api.bingr.one/static/netflix.webp' },
  { name: 'Hulu', image: 'https://api.bingr.one/static/hulu.webp' },
  { name: 'Prime Video', image: 'https://api.bingr.one/static/prime-video.webp' },
  { name: 'Apple TV+', image: 'https://api.bingr.one/static/apple-tv.webp' },
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
  { name: 'English', sublabel: undefined, image: 'https://api.bingr.one/static/categories/1526660-a-afdd1ecfd8ae.webp' },
  { name: '日本', sublabel: 'Japanese', image: 'https://api.bingr.one/static/categories/1750233039896-a.webp' },
  { name: '한국어', sublabel: 'Korean', image: 'https://api.bingr.one/static/categories/1526670-a-ec8fb58a5fb8.webp' },
  { name: 'हिन्दी', sublabel: 'Hindi', image: 'https://api.bingr.one/static/categories/1526661-a-00b818b5bc0e.webp' },
  { name: 'Português', sublabel: 'Portuguese', image: 'https://api.bingr.one/static/portuguese.webp' },
  { name: 'Español', sublabel: 'Spanish', image: 'https://api.bingr.one/static/spanish.webp' },
  { name: 'Tamil', sublabel: 'Tamil', image: 'https://api.bingr.one/static/categories/1526682-a-fd4e220ba563.webp' },
  { name: 'Telugu', sublabel: 'Telugu', image: 'https://api.bingr.one/static/categories/1526685-a-5f5995a53f61.webp' },
  { name: 'Kannada', sublabel: 'Kannada', image: 'https://api.bingr.one/static/categories/1781241136059-a.webp' },
  { name: 'Malayalam', sublabel: 'Malayalam', image: 'https://api.bingr.one/static/categories/1526672-a-eafe6913c6c8.webp' },
  { name: 'Marathi', sublabel: 'Marathi', image: 'https://api.bingr.one/static/categories/1526674-a-fdd5233a7699.webp' },
  { name: 'Bengali', sublabel: 'Bengali', image: 'https://api.bingr.one/static/categories/1526659-a-7271cf19114e.webp' },
] as const;

/** Browse section: top-level content types — image cards matching bingr.one. */
export const CATEGORY_GROUPS = [
  { name: 'Sports', href: '/sports', image: 'https://api.bingr.one/static/categories/Sports.webp' },
  { name: 'Sparks', href: '/spark', image: 'https://api.bingr.one/static/categories/Sparks.webp' },
  { name: 'Anime', href: '/anime', image: 'https://api.bingr.one/static/categories/anime.webp' },
  { name: 'TV', href: '/tv', image: 'https://api.bingr.one/static/categories/TV.webp' },
  { name: 'Movies', href: '/movies', image: 'https://api.bingr.one/static/categories/Movie.webp' },
  { name: 'News', href: '/categories', image: 'https://api.bingr.one/static/categories/News.webp' },
] as const;

/** Popular sports for the Categories page sports rail — image cards */
export const POPULAR_SPORTS = [
  { name: 'Cricket', image: 'https://api.bingr.one/static/categories/cricket.webp' },
  { name: 'Football', image: 'https://api.bingr.one/static/categories/football.webp' },
  { name: 'Hockey', image: 'https://api.bingr.one/static/categories/hockey.webp' },
  { name: 'Formula 1', image: 'https://api.bingr.one/static/categories/f1.webp' },
  { name: 'Tennis', image: 'https://api.bingr.one/static/categories/tennis.webp' },
  { name: 'WWE', image: 'https://api.bingr.one/static/categories/wwe.webp' },
  { name: 'Kabaddi', image: 'https://api.bingr.one/static/categories/kabaddi.webp' },
  { name: 'Basketball', image: 'https://api.bingr.one/static/categories/basketball.webp' },
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
