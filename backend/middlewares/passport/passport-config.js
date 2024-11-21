import passport from 'passport';
import { useLocalCustomerStrategy } from './local-strategies/customer.js';
import { CustomerModel } from '../../models/customer-model.js';

useLocalCustomerStrategy(passport);

passport.serializeUser((user, done) => {
    if (user.userType === 'customer') {
        return done(null, { email: user.email, type: 'customer' });
    }
});

passport.deserializeUser(async (user, done) => {
    if (user.type === 'customer') {
        const customer = await CustomerModel.get(user.email);
        return done(null, customer);
    }
});

export {
    passport,
}