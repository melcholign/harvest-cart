import passport from 'passport';
import { useLocalCustomerStrategy } from './local-strategies/customer.js';
import { useLocalFarmerStrategy } from './local-strategies/farmer.js';
import { CustomerModel } from '../../models/customer-model.js';
import { FarmerModel } from '../../models/farmer-model.js';


useLocalCustomerStrategy(passport);
useLocalFarmerStrategy(passport);

/**
 * Serializes user data for session storage in Passport.
 * 
 * This function stores the user's type (either 'customer' or 'farmer') and email in the session
 * during login for future authentication requests.
 * 
 * @param {Object} user - The user object to be serialized.
 * @param {Function} done - The callback function used to complete the serialization.
 * @returns {void} Calls the `done` function with the user data to be stored in the session.
 */
passport.serializeUser((user, done) => {
    if (user.userType === 'customer') {
        return done(null, { email: user.email, type: 'customer' });
    }

    if (user.userType === 'farmer') {
        return done(null, { email: user.email, type: 'farmer' });
    }
});

/**
 * Deserializes user data from session storage in Passport.
 * 
 * This function retrieves the user object from the database based on the session data.
 * 
 * @param {Object} user - The user data stored in the session.
 * @param {Function} done - The callback function used to complete the deserialization.
 * @returns {void} Calls the `done` function with the retrieved user data.
 */
passport.deserializeUser(async (user, done) => {
    if (user.type === 'customer') {
        const customer = await CustomerModel.get(user.email);
        return done(null, customer);
    }

    if (user.type === 'farmer') {
        const farmer = await FarmerModel.getByEmail(user.email);
        return done(null, farmer);
    }
});

export {
    passport,
}