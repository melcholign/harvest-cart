import { body } from 'express-validator';

export default function createPasswordValidator() {
    return body('password').trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .custom(hasUpperCase).withMessage('Password must have at least 1 upper case character.')
        .custom(hasLowerCase).withMessage('Password must have at least 1 lower case character.')
        .custom(hasDigit).withMessage('Password must have at least 1 digit.');
}

function hasLowerCase(string) {
    return (/(?=.*[a-z])/).test(string);
}

function hasUpperCase(string) {
    return (/(?=.*[A-Z])/).test(string);
}

function hasDigit(string) {
    return (/(?=.*\d)/).test(string);
}