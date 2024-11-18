import { body } from 'express-validator';

export default function createFullNameValidator() {
    return body('fullName').trim()
        .exists({ values: 'falsy' }).withMessage('Full name is required.');
}
