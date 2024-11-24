/**
 * Maps an array of similar objects to an object where each 
 * key is an id from the input objects, and 
 * the corresponding value is the full object.
 * 
 * @param {Array<Object>} array - array of objects
 * @param {String} key - key identifier present in every
 *  object of the array
 * @returns {Object} - nested object
 */
export function mapObjectsByKey(objects, key) {
    return objects.reduce((accumulator, obj) => ({
        ...accumulator,
        [obj[key]]: obj,
    }), {})
}