import { validationResult, matchedData } from 'express-validator';
import bcrypt from 'bcrypt';
import { formatValidationResult } from '../validators/formatters.js';
import { CustomerModel } from '../models/customer-model.js';

class CustomerController {

    static async createCustomer(req, res) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            const formattedResult = formatValidationResult(result);
            res.status(400).json(formattedResult);
            return;
        }

        const data = matchedData(req);
        const hashedPassword = await bcrypt.hash(data.password, 10);

        await CustomerModel.create({ ...data, hashedPassword });

        res.sendStatus(200);
    }
}

export {
    CustomerController,
}