import { body } from 'express-validator';

export default function createPasswordConfirmationValidator() {
    return body('passwordConfirmation').trim()
        .custom((value, { req }) => value === req.body.password).withMessage('Password does not match');
}