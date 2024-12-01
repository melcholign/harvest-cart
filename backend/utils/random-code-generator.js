/**
 * Generates a random numeric code of the specified length.
 *
 * @function generateRandomCode
 * @param {number} [length=6] - The length of the random code to generate. Defaults to 6.
 * @returns {string} A string containing the generated numeric code.
 *
 * @example
 * const code = generateRandomCode(4);
 * console.log(code); // e.g., "3489"
 */
export function generateRandomCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; ++i) {
        code += '' + Math.floor(Math.random() * 10);
    }
    return code;
}
