import { body } from 'express-validator';

/**
 * Creates a validator for phone number fields.
 *
 * @param {string} locale - The locale to be used for validating the phone number format (e.g., 'bn-BD' for Bangladesh).
 * @param {Object} errorMessages - Object containing custom error messages.
 * @param {string} errorMessages.invalidPhoneNumber - Message when the phone number is invalid.
 * @returns {ValidationChain} An `express-validator` validation chain for phone number validation.
 */
export default function createPhoneNumberValidator(locale, { invalidPhoneNumber }) {
    return body('phoneNumber').trim()
        .isMobilePhone('bn-BD').withMessage('Invalid phone number')
        .optional({ values: 'falsy' });
}
