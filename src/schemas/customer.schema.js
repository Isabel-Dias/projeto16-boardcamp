import JoiBase from "joi";
import JoiDate from "@joi/date";

const joi = JoiBase.extend(JoiDate);

const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().regex(/^[0-9]+$/).min(10).max(11).required(),
    cpf: joi.string().length(11).regex(/^[0-9]+$/),
    birthday: joi.date().format('YYYY-MM-DD').greater('1900-01-01').required()
})

export {customerSchema}

