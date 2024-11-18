import { validationResult, matchedData } from 'express-validator';
import { formatValidationResult } from '../validators/formatters.js';
import { Customer } from '../models/customer.model.js';

function customerCreateController(req, res) {
    const result = validationResult(req);
    const formattedResult = formatValidationResult(result);

    if (formattedResult.length != 0) {
        res.status(400).json(formattedResult);
        return;
    }

    const data = matchedData(req);
    res.status(2000).json(data);
}

export {
    customerCreateController,
}