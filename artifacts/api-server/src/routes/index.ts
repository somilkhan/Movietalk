import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import ratingsRouter from "./ratings";
import watchlistRouter from "./watchlist";
import streamRouter from "./stream";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use(catalogRouter);
router.use(ratingsRouter);
router.use(watchlistRouter);
router.use(streamRouter);

export default router;
