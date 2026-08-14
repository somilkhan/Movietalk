import { Router, type IRouter } from "express";
import {
  GetTrendingQueryParams,
  GetTrendingResponse,
  GetCatalogListQueryParams,
  GetCatalogListResponse,
  GetAnimeResponse,
  GetGenresQueryParams,
  GetGenresResponse,
  SearchCatalogQueryParams,
  SearchCatalogResponse,
  GetTitleDetailParams,
  GetTitleDetailResponse,
} from "@workspace/api-zod";
import * as tmdb from "../../lib/tmdb";

const router: IRouter = Router();

router.get("/catalog/trending", async (req, res): Promise<void> => {
  const params = GetTrendingQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { mediaType, window, page } = params.data;
  const region = req.query.region as string | undefined;
  const results = await tmdb.getTrending(mediaType, window, page, region);
  res.json(GetTrendingResponse.parse(results));
});

router.get("/catalog/list", async (req, res): Promise<void> => {
  const params = GetCatalogListQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { mediaType, category, page } = params.data;
  const region = req.query.region as string | undefined;
  try {
    const results = await tmdb.getCatalogList(mediaType, category, page, region);
    res.json(GetCatalogListResponse.parse(results));
  } catch (err) {
    req.log.error({ err }, "Failed to load catalog list");
    res.status(400).json({ error: "Unsupported category for media type" });
  }
});

router.get("/catalog/anime", async (_req, res): Promise<void> => {
  const results = await tmdb.getAnime();
  res.json(GetAnimeResponse.parse(results));
});

/** Regional content by origin country */
router.get("/catalog/regional", async (req, res): Promise<void> => {
  const mediaType = req.query.mediaType as tmdb.MediaType | undefined;
  const country = (req.query.country as string) || "IN";
  const page = Number(req.query.page) || 1;

  if (!mediaType || !["movie", "tv"].includes(mediaType)) {
    res.status(400).json({ error: "Invalid mediaType" });
    return;
  }

  try {
    const results = await tmdb.getRegionalContent(mediaType, country, page);
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to load regional content");
    res.status(500).json({ error: "Failed to load regional content" });
  }
});

/** Content by original language */
router.get("/catalog/language", async (req, res): Promise<void> => {
  const mediaType = req.query.mediaType as tmdb.MediaType | undefined;
  const language = (req.query.language as string) || "hi";
  const page = Number(req.query.page) || 1;

  if (!mediaType || !["movie", "tv"].includes(mediaType)) {
    res.status(400).json({ error: "Invalid mediaType" });
    return;
  }

  try {
    const results = await tmdb.getContentByLanguage(mediaType, language, page);
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to load language content");
    res.status(500).json({ error: "Failed to load language content" });
  }
});

router.get("/catalog/genres", async (req, res): Promise<void> => {
  const params = GetGenresQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const results = await tmdb.getGenres(params.data.mediaType);
  res.json(GetGenresResponse.parse(results));
});

router.get("/catalog/search", async (req, res): Promise<void> => {
  const params = SearchCatalogQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { query } = params.data;
  const region = req.query.region as string | undefined;
  const results = await tmdb.searchCatalog(query, region);
  res.json(SearchCatalogResponse.parse(results));
});

router.get("/catalog/tv/:id/season/:season", async (req, res): Promise<void> => {
  const showId = Number(req.params.id);
  const seasonNumber = Number(req.params.season);
  if (!Number.isFinite(showId) || !Number.isFinite(seasonNumber)) {
    res.status(400).json({ error: "Invalid id or season" });
    return;
  }
  try {
    const episodes = await tmdb.getTvSeason(showId, seasonNumber);
    res.json(episodes);
  } catch (err) {
    req.log.error({ err }, "Failed to load TV season");
    res.status(404).json({ error: "Season not found" });
  }
});

router.get(
  "/catalog/title/:mediaType/:id/videos",
  async (req, res): Promise<void> => {
    const mediaType = req.params.mediaType as "movie" | "tv";
    const id = Number(req.params.id);
    if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
      res.status(400).json({ key: null });
      return;
    }
    try {
      const result = await tmdb.getTitleVideos(mediaType, id);
      res.json(result);
    } catch (err) {
      req.log.error({ err }, "Failed to load title videos");
      res.json({ key: null });
    }
  },
);

router.get(
  "/catalog/title/:mediaType/:id/logo",
  async (req, res): Promise<void> => {
    const mediaType = req.params.mediaType as "movie" | "tv";
    const id = Number(req.params.id);
    if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
      res.status(400).json({ logoPath: null });
      return;
    }
    try {
      const result = await tmdb.getTitleLogo(mediaType, id);
      res.json(result);
    } catch (err) {
      req.log.error({ err }, "Failed to load title logo");
      res.json({ logoPath: null });
    }
  },
);

router.get(
  "/catalog/title/:mediaType/:id/similar",
  async (req, res): Promise<void> => {
    const mediaType = req.params.mediaType as "movie" | "tv";
    const id = Number(req.params.id);
    if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid media type or id" });
      return;
    }
    try {
      const detail = await tmdb.getTitleDetail(mediaType, id);
      res.json(detail?.similar ?? []);
    } catch (err) {
      req.log.error({ err }, "Failed to load similar titles");
      res.json([]);
    }
  },
);

router.get(
  "/catalog/title/:mediaType/:id",
  async (req, res): Promise<void> => {
    const params = GetTitleDetailParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    try {
      const detail = await tmdb.getTitleDetail(
        params.data.mediaType,
        params.data.id,
      );
      if (!detail) {
        res.status(404).json({ error: "Title not found" });
        return;
      }
      res.json({ ...GetTitleDetailResponse.parse(detail), similar: detail.similar, cast: detail.cast, certification: detail.certification });
    } catch (err) {
      req.log.error({ err }, "Failed to load title detail");
      res.status(404).json({ error: "Title not found" });
    }
  },
);

export default router;
