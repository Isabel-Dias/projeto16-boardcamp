import { Router } from "express";
import { getRentals, postRental, rentalReturn, deleteRental} from "../controllers/rentals.controller.js";
const router = Router();

router.get("/rentals", getRentals);
router.post("/rentals", postRental);
router.post("/rentals/:id/return", rentalReturn)
router.delete("/rentals/:id", deleteRental)

export default router;