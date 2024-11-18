import createFullNameValidator from '../micro-validators/full-name-validator.js';
import createEmailValidator from '../micro-validators/email-validator.js';
import createPasswordValidator from '../micro-validators/pwd-validator.js';
import createPasswordConfirmationValidator from '../micro-validators/pwd-confirmation-validator.js';
import createPhoneNumberValidator from '../micro-validators/phone-no-validator.js';
import valArgs from './validator-arguments.js';

function createCustomerValidator() {
    return [
        createFullNameValidator(valArgs.fullName.errorMessages),
        createEmailValidator(valArgs.email.errorMessages),
        createPasswordValidator(valArgs.password.length, valArgs.password.errorMessages),
        createPasswordConfirmationValidator(valArgs.passwordConfirmation.errorMessages),
        createPhoneNumberValidator(valArgs.phoneNumber.locale, valArgs.phoneNumber.errorMessages),
    ]
}

export default createCustomerValidator;