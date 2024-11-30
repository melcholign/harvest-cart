import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { CustomerModel } from '../../../models/customer-model.js';

async function authenticateCustomer(email, password, done) {
    try {
        const customer = await CustomerModel.get(email);
        if (!customer) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        const isCorrectPassword = await bcrypt.compare(password, customer.hashedPassword);
        console.log(isCorrectPassword)

        if (!isCorrectPassword) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        customer.userType = 'customer';

        return done(null, customer);
    } catch (err) {
        return done(err);
    }
}

export function useLocalCustomerStrategy(passport) {
    const options = { usernameField: 'email', passwordField: 'password' };
    passport.use('local-customer', new LocalStrategy(options, authenticateCustomer));
}
