import { body } from 'express-validator';

export default function createPhoneNumberValidator(locale, { invalidPhoneNumber }) {
    return body('phoneNumber').trim()
        .isMobilePhone('bn-BD').withMessage('Invalid phone number')
        .optional({ values: 'falsy' });
}