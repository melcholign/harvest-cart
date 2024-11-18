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