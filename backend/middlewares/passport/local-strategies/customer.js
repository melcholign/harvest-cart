import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { CustomerModel } from '../../../models/customer-model.js';

/**
 * Authenticates a customer using their email and password.
 * 
 * This function checks if the customer exists in the database, verifies the provided password,
 * and returns a user object if successful or an error message if unsuccessful.
 * 
 * @param {string} email - The customer's email address.
 * @param {string} password - The customer's password.
 * @param {Function} done - The callback function used to pass the authentication result.
 * @returns {void} Calls the `done` function with either an error or the authenticated customer.
 */
async function authenticateCustomer(email, password, done) {
    try {
        const customer = await CustomerModel.get(email);
        if (!customer) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        const isCorrectPassword = await bcrypt.compare(password, customer.hashedPassword);

        if (!isCorrectPassword) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        customer.userType = 'customer';

        return done(null, customer);
    } catch (err) {
        return done(err);
    }
}

/**
 * Sets up the local authentication strategy for customer login.
 * 
 * This function configures Passport.js to use the local strategy for authenticating customers
 * based on their email and password.
 * 
 * @param {Object} passport - The Passport instance used to define authentication strategies.
 * @returns {void} Registers the 'local-customer' strategy with Passport.
 */
export function useLocalCustomerStrategy(passport) {
    const options = { usernameField: 'email', passwordField: 'password' };
    passport.use('local-customer', new LocalStrategy(options, authenticateCustomer));
}
