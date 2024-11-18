import createFullNameValidator from './micro-validators/full-name-validator.js';
import createEmailValidator from './micro-validators/email-validator.js';
import createPasswordValidator from './micro-validators/pwd-validator.js';
import createPasswordConfirmationValidator from './micro-validators/pwd-confirmation-validator.js';
import createPhoneNumberValidator from './micro-validators/phone-no-validator.js';

function createCustomerValidator() {
    return [
        createFullNameValidator(),
        createEmailValidator(),
        createPasswordValidator(),
        createPasswordConfirmationValidator(),
        createPhoneNumberValidator(),
    ]
}

export { createCustomerValidator };