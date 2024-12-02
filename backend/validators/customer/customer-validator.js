import createFullNameValidator from '../micro-validators/full-name-validator.js';
import createEmailValidator from '../micro-validators/email-validator.js';
import createPasswordValidator from '../micro-validators/pwd-validator.js';
import createPasswordConfirmationValidator from '../micro-validators/pwd-confirmation-validator.js';
import createPhoneNumberValidator from '../micro-validators/phone-no-validator.js';
import valArgs from './validator-arguments.js';

/**
 * Creates a set of validators for customer-related fields such as full name, email, password, 
 * password confirmation, and phone number.
 *
 * @function createCustomerValidator
 * @returns {Array<Function>} An array of validation middleware functions.
 *
 * @example
 * import createCustomerValidator from './validators/create-customer-validator.js';
 * 
 * const customerValidators = createCustomerValidator();
 * app.post('/customers', customerValidators, (req, res) => {
 *     // Handle request after validation
 * });
 */
function createCustomerValidator() {
    return [
        createFullNameValidator(valArgs.fullName.errorMessages),
        createEmailValidator(valArgs.email.errorMessages),
        createPasswordValidator(valArgs.password.length, valArgs.password.errorMessages),
        createPasswordConfirmationValidator(valArgs.passwordConfirmation.errorMessages),
        createPhoneNumberValidator(valArgs.phoneNumber.locale, valArgs.phoneNumber.errorMessages),
    ];
}

export default createCustomerValidator;
