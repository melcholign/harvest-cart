import { body } from 'express-validator';

/**
 * Creates a validator for confirming password fields.
 *
 * @param {Object} errorMessages - Object containing custom error messages.
 * @param {string} errorMessages.mismatch - Message when the password confirmation does not match the original password.
 * @returns {ValidationChain} An `express-validator` validation chain for password confirmation validation.
 */
export default function createPasswordConfirmationValidator({ mismatch }) {
    return body('passwordConfirmation').trim()
        .custom((value, { req }) => value === req.body.password).withMessage(mismatch);
}
