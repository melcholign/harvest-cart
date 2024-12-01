/**
 * Configuration object for validation arguments used across different form fields.
 *
 * @namespace valArgs
 * @property {Object} fullName - Configuration for full name validation.
 * @property {Object} fullName.errorMessages
 * @property {string} fullName.errorMessages.emptyFullName - Error message for an empty full name.
 *
 * @property {Object} email - Configuration for email validation.
 * @property {Object} email.errorMessages
 * @property {string} email.errorMessages.emptyEmail - Error message for an empty email field.
 * @property {string} email.errorMessages.invalidEmail - Error message for an invalid email format.
 * @property {string} email.errorMessages.duplicateEmail - Error message for a duplicate email.
 *
 * @property {Object} password - Configuration for password validation.
 * @property {Object} password.length
 * @property {number} password.length.min - Minimum required length for a password.
 * @property {Object} password.errorMessages
 * @property {string} password.errorMessages.emptyPassword - Error message for an empty password field.
 * @property {string} password.errorMessages.invalidLength - Error message for a password that is too short.
 * @property {string} password.errorMessages.noUpperCase - Error message for a password without an uppercase character.
 * @property {string} password.errorMessages.noLowerCase - Error message for a password without a lowercase character.
 * @property {string} password.errorMessages.noDigit - Error message for a password without a digit.
 *
 * @property {Object} passwordConfirmation - Configuration for password confirmation validation.
 * @property {Object} passwordConfirmation.errorMessages
 * @property {string} passwordConfirmation.errorMessages.mismatch - Error message for mismatched passwords.
 *
 * @property {Object} phoneNumber - Configuration for phone number validation.
 * @property {string} phoneNumber.locale - Locale used for phone number validation.
 * @property {Object} phoneNumber.errorMessages
 * @property {string} phoneNumber.errorMessages.invalidPhoneNumber - Error message for an invalid phone number.
 */

const REQUIRED_FIELD_MESSAGE = 'This field is required';
const passwordMinLength = 8;

const fullName = {
    errorMessages: {
        emptyFullName: REQUIRED_FIELD_MESSAGE,
    }
};
const email = {
    errorMessages: {
        emptyEmail: REQUIRED_FIELD_MESSAGE,
        invalidEmail: 'Invalid email',
        duplicateEmail: 'This email is already in use',
    },
};

const min = 8;
const password = {
    length: {
        min,
    },
    errorMessages: {
        emptyPassword: REQUIRED_FIELD_MESSAGE,
        invalidLength: `Must contain at least ${min} characters`,
        noUpperCase: 'Must have at least one uppercase character',
        noLowerCase: 'Must have at least one lowercase character',
        noDigit: 'Must have at least one digit',
    },
};

const passwordConfirmation = {
    errorMessages: {
        mismatch: 'Passwords do not match',
    },
};

const phoneNumber = {
    locale: 'bn-BD',
    errorMessages: {
        invalidPhoneNumber: 'Invalid phone number',
    }
};

export default {
    fullName,
    email,
    password,
    passwordConfirmation,
    phoneNumber,
}