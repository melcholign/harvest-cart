/**
 * Authenticates a farmer using their email and password.
 * 
 * This function checks if the farmer exists in the database, verifies the provided password,
 * and returns the farmer object if successful, or an error message if authentication fails.
 * 
 * @param {string} email - The farmer's email address.
 * @param {string} password - The farmer's password.
 * @param {Function} done - The callback function to return the authentication result.
 * @returns {void} Calls the `done` function with either an error or the authenticated farmer.
 */
async function authenticateFarmer(email, password, done) {
    try {
        const farmer = await FarmerModel.getByEmail(email);

        if (!farmer) {
            return done(null, false, { message: "Email or password incorrect." });
        }

        if (!(await bcryptjs.compare(password, farmer.pass_hash))) {
            return done(null, false, { message: "Email or password incorrect." });
        }

        farmer.userType = 'farmer';
        return done(null, farmer);
    } catch (err) {
        return done(err);
    }
}

/**
 * Sets up the local authentication strategy for farmer login.
 * 
 * This function configures Passport.js to use the local strategy for authenticating farmers
 * based on their email and password.
 * 
 * @param {Object} passport - The Passport instance used to define authentication strategies.
 * @returns {void} Registers the 'local-farmer' strategy with Passport.
 */
export function useLocalFarmerStrategy(passport) {
    const options = { usernameField: 'email'};
    passport.use('local-farmer', new LocalStrategy(options, authenticateFarmer));
}
