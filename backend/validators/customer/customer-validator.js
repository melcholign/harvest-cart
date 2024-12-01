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
