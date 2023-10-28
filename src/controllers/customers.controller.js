import db from "../database/database.js"
import { customerSchema } from "../schemas/customer.schema.js";

async function getCustomers(req, res) {
    try {
        const customersList = await db.query(`
                SELECT
                    id, 
                    name,
                    phone,
                    cpf,
                    TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday
                FROM 
                    customers;
            `)
            
        return res.status(200).send(customersList.rows);

    } catch {
        return res.sendStatus(500);
    }
}

async function getOneCustomer(req, res) {
    try {
        const { id } = req.params
        const customer = await db.query(`
                SELECT 
                    id,
                    name,
                    phone,
                    cpf,
                    TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday
                FROM 
                    customers 
                WHERE 
                    id = $1;
            `, [id])

        if (customer.rows.length == 0) {
            return res.sendStatus(404);
        }

        return res.status(200).send(customer.rows[0]);
    } catch {
        return res.sendStatus(500);
    }
}

async function postCustomer(req, res) {
    try {
        const { name, phone, cpf, birthday } = req.body;
        const validationSchema = customerSchema.validate({ name, phone, cpf, birthday });

        if (validationSchema.error) {
            return res.status(400).send("Todos os campos são obrigatórios")
        }

        const customerAlreadyExists = await db.query(
            `SELECT cpf FROM customers WHERE cpf = $1`, [cpf])

        if (customerAlreadyExists.rows.length > 0) return res.sendStatus(409)

        await db.query(`
            INSERT INTO customers 
                (name, phone, cpf, birthday) 
            VALUES 
                ($1, $2, $3, $4);`, [name, phone, cpf, birthday])

        return res.sendStatus(201);

    } catch {
        return res.sendStatus(500);
    }
}

async function updateCustomer(req, res) {
    try {
        const { id } = req.params
        const { name, phone, cpf, birthday } = req.body;
        const validationSchema = customerSchema.validate({ name, phone, cpf, birthday });

        if (validationSchema.error) {
            return res.status(400).send("Todos os campos são obrigatórios")
        }
        const idByCpf = await db.query(
            `SELECT id FROM customers WHERE cpf = $1`, [cpf]
        )
            console.log(idByCpf.rows.length, "a");
        if(idByCpf.rows.length == 0 || idByCpf.rows[0].id == id){
            await db.query(
                `UPDATE 
                    customers 
                SET 
                    name = $1,
                    phone = $2,
                    cpf = $3,
                    birthday = $4
                WHERE 
                    id = $5`,
                [name, phone, cpf, birthday, id]
            ) 
        
        return res.sendStatus(200);
        }

        if (idByCpf.rows[0].id != id) {
            return res.sendStatus(409)
        }
    } catch {
        return res.sendStatus(500);
    }
}

export { getCustomers, getOneCustomer, postCustomer, updateCustomer };