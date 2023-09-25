import db from "../database/database.js"
import dayjs from "dayjs"
import { rentalSchema } from "../schemas/rentals.schema.js";

async function getRentals(req, res) {
    try {
        const allRentals = await db.query(
            `SELECT  
                rentals.*,
                games.name AS games_name, 
                customers.name AS customers_name
            FROM 
                rentals 
            JOIN 
                customers ON rentals."customerId" = customers.id
            JOIN
                games ON rentals."gameId" = games.id
           `
        )
        const organizedRentals = allRentals.rows.map(rental => {
            
            return ({
                id: rental.id,
                customerId: rental.id,
                gameId: rental.gameId,
                rentDate: rental.rentDate.toISOString().split('T')[0],
                daysRented: rental.daysRented,
                returnDate: rental.returnDate,
                originalPrice: rental.originalPrice,
                delayFee: rental.delayFee,
                customer: {
                    id: rental.customerId,
                    name: rental.customers_name
                },
                game: {
                    id: rental.gameId,
                    name: rental.games_name
                }
            })
        })
        return res.status(200).json(organizedRentals);
    } catch {
        return res.sendStatus(500);
    }
}

async function postRental(req, res) {
    try {
        const { customerId, gameId, daysRented } = req.body
        const validationSchema = rentalSchema.validate({ customerId, gameId, daysRented });

        if (validationSchema.error) {
            return res.status(400).send("Todos os campos são obrigatórios e o número mínimo de dias de aluguel é 1")
        }

        const rentedGamesbyId = await db.query(
            `SELECT * FROM games WHERE id = $1`, [gameId]
        )

        const customer = await db.query(
            `SELECT * FROM customers WHERE id = $1`, [customerId]
        )

        const { stockTotal, pricePerDay } = rentedGamesbyId.rows[0]


        if (rentedGamesbyId.rows.length == 0
            || customer.rows.length == 0
            || Number(stockTotal) - Number(rentedGamesbyId.rows.length) <= 0) {
            return res.sendStatus(400);
        }

        const originalPrice = pricePerDay * daysRented
        const dateNow = dayjs().format('YYYY-MM-DD')

        await db.query(
            `INSERT INTO rentals (
                "customerId", 
                "gameId",
                "rentDate",
                "daysRented",
                "returnDate",
                "originalPrice",
                "delayFee"
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7
            )`, [
            customerId,
            gameId,
            dateNow,
            daysRented,
            null,
            originalPrice,
            null
        ]
        )

        return res.sendStatus(201);

    } catch {
        return res.sendStatus(500);
    }
}

function calculateFee (startDate, endDate, daysRented, pricePerDay){
    const date1 = startDate;
    const date2 = endDate;

    const timeDifference = date2 - date1;
    const daysPassed = timeDifference / (24 * 60 * 60 * 1000);
    const delayFee = null

    if (daysRented - daysPassed < 0){
        return delayFee = ((daysRented - daysPassed) * -1) * pricePerDay
    } 
    return delayFee;
}

async function rentalReturn(req, res) {
    try {
        const dateNow = dayjs().format('YYYY-MM-DD');
        const { id } = req.params;
       
        const rentalData = await db.query (
            `SELECT
                rentals.*,
                games."pricePerDay"
            FROM
                rentals
            JOIN
                games ON rentals."gameId" = games.id
            WHERE
                rentals.id = $1`, [id]
        )

        if (rentalData.rows.length == 0) {
            return res.sendStatus(404);
        }
       
        const { pricePerDay, rentDate, daysRented, returnDate} = rentalData.rows[0]
        const startDate = rentDate.toISOString().split('T')[0]
        
        if (returnDate != null) {
           return res.sendStatus(400);
        }

        const fee = calculateFee(startDate, dateNow, daysRented, pricePerDay)

        await db.query (
            `UPDATE
                rentals
            SET
                "returnDate" = $1,
                "delayFee" = $2
            WHERE
                id = $3`,
                [dateNow, fee, id]
            
        )

        return res.sendStatus(200);
    } catch {
        return res.sendStatus(500);
    }
}

async function deleteRental(req, res) {
    const { id } = req.params;

    try {
        const rentalData = await db.query (
            `SELECT * FROM rentals WHERE id = $1`, [id]
        )

        if(rentalData.rows.length == 0) {
            return res.sendStatus(404);
        }

        if(rentalData.rows[0].returnDate == null) {
            return res.sendStatus(400);
        }

        await db.query(
            `DELETE FROM rentals WHERE id = $1`, [id]
        )
        
        return res.sendStatus(200);
    } catch {
        return res.sendStatus(500);
    }
}

export { getRentals, postRental, rentalReturn, deleteRental }