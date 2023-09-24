import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import gamesRoutes from "./routes/games.routes.js"
import customerRoutes from "./routes/customers.routes.js"
import rentalRoutes from "./routes/rentals.routes.js"

dotenv.config()

const app = express();
app.use(cors());
app.use(express.json());

app.use(gamesRoutes)
app.use(customerRoutes)
app.use(rentalRoutes)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Running server on port 5000`));