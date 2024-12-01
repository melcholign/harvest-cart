import { validationResult, matchedData } from 'express-validator';
import bcrypt from 'bcrypt';
import { formatValidationResult } from '../validators/formatters.js';
import { CustomerModel } from '../models/customer-model.js';

/**
 * @classdesc Controller that handles customer-related operations.
 */
class CustomerController {

    /**
     * Creates a new customer by validating input, hashing the password, 
     * and storing customer data in the database.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async createCustomer(req, res) {
        const result = validationResult(req);

        // Check for validation errors
        if (!result.isEmpty()) {
            const formattedResult = formatValidationResult(result);
            res.status(400).json(formattedResult);
            return;
        }

        // Extract matched data and hash the password
        const data = matchedData(req);
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create the customer record
        await CustomerModel.create({ ...data, hashedPassword });

        res.sendStatus(200);
    }
}

export {
    CustomerController,
};
