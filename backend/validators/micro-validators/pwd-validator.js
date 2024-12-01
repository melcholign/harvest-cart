import { body } from 'express-validator';

/**
 * Creates a validator for the password field with multiple criteria.
 *
 * @param {Object} lengthConfig - The configuration for the minimum and maximum length of the password.
 * @param {number} lengthConfig.min - The minimum allowed length for the password.
 * @param {number} lengthConfig.max - The maximum allowed length for the password.
 * @param {Object} errorMessages - Custom error messages for validation failures.
 * @param {string} errorMessages.emptyPassword - Message when the password field is empty.
 * @param {string} errorMessages.invalidLength - Message when the password length is invalid.
 * @param {string} errorMessages.noUpperCase - Message when the password has no uppercase letter.
 * @param {string} errorMessages.noLowerCase - Message when the password has no lowercase letter.
 * @param {string} errorMessages.noDigit - Message when the password has no digit.
 * @returns {ValidationChain} An `express-validator` validation chain for password validation.
 */
export default function createPasswordValidator(
    { min, max },
    {
        emptyPassword,
        invalidLength,
        noUpperCase,
        noLowerCase,
        noDigit,
    }) {
    return body('password').trim()
        .notEmpty().withMessage(emptyPassword)
        .isLength({ min, max }).withMessage(invalidLength)
        .custom(hasUpperCase).withMessage(noUpperCase)
        .custom(hasLowerCase).withMessage(noLowerCase)
        .custom(hasDigit).withMessage(noDigit);
}

/**
 * Validates that the password contains at least one lowercase letter.
 * @param {string} string - The password string to check.
 * @returns {boolean} `true` if the password contains a lowercase letter, otherwise `false`.
 */
function hasLowerCase(string) {
    return (/(?=.*[a-z])/).test(string);
}

/**
 * Validates that the password contains at least one uppercase letter.
 * @param {string} string - The password string to check.
 * @returns {boolean} `true` if the password contains an uppercase letter, otherwise `false`.
 */
function hasUpperCase(string) {
    return (/(?=.*[A-Z])/).test(string);
}

/**
 * Validates that the password contains at least one digit.
 * @param {string} string - The password string to check.
 * @returns {boolean} `true` if the password contains a digit, otherwise `false`.
 */
function hasDigit(string) {
    return (/(?=.*\d)/).test(string);
}
