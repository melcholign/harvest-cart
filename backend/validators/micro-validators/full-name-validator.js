import { body } from 'express-validator';

export default function createFullNameValidator({ emptyFullName }) {
    return body('fullName').trim()
        .notEmpty().withMessage(emptyFullName);
}
