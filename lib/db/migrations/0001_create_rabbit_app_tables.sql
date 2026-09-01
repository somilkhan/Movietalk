CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  username varchar(100) NOT NULL,
  password_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  title_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 10),
  title_snapshot jsonb NOT NULL,
  rated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ratings_session_title UNIQUE (session_id, title_id, media_type)
);

CREATE TABLE IF NOT EXISTS public.watchlist (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  title_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title_snapshot jsonb NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT watchlist_session_title UNIQUE (session_id, title_id, media_type)
);

CREATE INDEX IF NOT EXISTS ratings_session_id_idx ON public.ratings(session_id);
CREATE INDEX IF NOT EXISTS watchlist_session_id_idx ON public.watchlist(session_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
