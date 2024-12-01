import { body } from 'express-validator';

/**
 * Creates a validator for full name fields.
 *
 * @param {Object} errorMessages - Object containing custom error messages.
 * @param {string} errorMessages.emptyFullName - Message when the full name field is empty.
 * @returns {ValidationChain} An `express-validator` validation chain for full name validation.
 */
export default function createFullNameValidator({ emptyFullName }) {
    return body('fullName').trim()
        .notEmpty().withMessage(emptyFullName);
}
