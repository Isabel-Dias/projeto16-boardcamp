import { Router } from "express";
import { getGames, postGames } from "../controllers/games.controller.js";
const router = Router();

router.get("/games", getGames);
router.post("/games", postGames);

export default router;