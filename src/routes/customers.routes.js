import { Router } from "express";
import { getCustomers, getOneCustomer, postCustomer, updateCustomer} from "../controllers/customers.controller.js";
const router = Router();

router.get("/customers", getCustomers);
router.get("/customers/:id", getOneCustomer);
router.post("/customers", postCustomer);
router.put("/customers/:id", updateCustomer);

export default router;