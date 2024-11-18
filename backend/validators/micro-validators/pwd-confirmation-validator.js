import { body } from 'express-validator';

export default function createPasswordConfirmationValidator({ mismatch }) {
    return body('passwordConfirmation').trim()
        .custom((value, { req }) => value === req.body.password).withMessage(mismatch);
}