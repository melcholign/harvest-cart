import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { CustomerModel } from '../models/customer-model.js';

async function authenticateCustomer(email, password, done) {
    try {
        const customer = CustomerModel.get(email);

        if (!customer) {
            done(null, false, { message: 'Incorrect email.' });
        }

        const isCorrectPassword = await bcrypt.compare(password, customer.hashedPassword);

        if (!isCorrectPassword) {
            done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, customer);
    } catch (err) {
        return done(err);
    }
}

export function useLocalCustomerStrategy(passport) {
    passport.use('local-customer', new LocalStrategy(authenticateCustomer));
}
