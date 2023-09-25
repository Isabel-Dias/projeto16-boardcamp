import { gamesSchema } from "../schemas/games.schema.js";
import db from "../database/database.js"

async function getGames(req, res) {
    try {
        const gamesList = await db.query(`
            SELECT * FROM games;
        `)
        return res.status(200).send(gamesList.rows);
    } catch {
        return res.sendStatus(500)
    }
}

async function postGames(req, res) {
    try {
        const {name, image, stockTotal, pricePerDay} = req.body;
        const validationSchema = gamesSchema.validate({name, image, stockTotal, pricePerDay});
        
        if(validationSchema.error){
            return res.status(400).send("Todos os campos são obrigatórios")
        }
        const nameAlreadyExists = await db.query(
            `SELECT name FROM games WHERE name = $1`, [name])

         
       if (nameAlreadyExists.rows.length > 0) return res.sendStatus(409)
        
        await db.query(`
            INSERT INTO games 
                (name, image, "stockTotal", "pricePerDay") 
            VALUES 
                ($1, $2, $3, $4);`,[name, image, stockTotal, pricePerDay])

        return res.sendStatus(201);

    } catch {
        return res.sendStatus(500)
    }
}

export {getGames, postGames};