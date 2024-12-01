/**
 * Formats the validation result into a structured object where each field maps
 * to its associated validation error messages.
 *
 * @param {ValidationResult} validationResult - The result from express-validator containing the validation errors.
 * @returns {Object} A map where keys are field names and values are objects containing an array of error messages.
 * 
 * @example
 * const formatted = formatValidationResult(validationResult);
 * console.log(formatted);
 * // { email: { messages: ['Invalid email', 'Email already taken'] } }
 */
function formatValidationResult(validationResult) {
    const emptyMap = {};

    return validationResult.array().reduce((fieldMap, validationError) => {
        const field = validationError.path;

        if (!(field in fieldMap)) {
            fieldMap[field] = {
                messages: [],
            }
        }

        fieldMap[field]['messages'].push(validationError.msg);
        return fieldMap;
        
    }, emptyMap);
}

export { formatValidationResult };
