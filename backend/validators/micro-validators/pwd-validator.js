import { body } from 'express-validator';

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

function hasLowerCase(string) {
    return (/(?=.*[a-z])/).test(string);
}

function hasUpperCase(string) {
    return (/(?=.*[A-Z])/).test(string);
}

function hasDigit(string) {
    return (/(?=.*\d)/).test(string);
}