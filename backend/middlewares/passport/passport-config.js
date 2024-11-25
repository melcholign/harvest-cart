import passport from 'passport';
import { useLocalCustomerStrategy } from './local-strategies/customer.js';
import { useLocalFarmerStrategy } from './local-strategies/farmer.js';
import { CustomerModel } from '../../models/customer-model.js';
import { FarmerModel } from '../../models/farmerModel.js';

useLocalCustomerStrategy(passport);
useLocalFarmerStrategy(passport);

passport.serializeUser((user, done) => {
    if (user.userType === 'customer') {
        return done(null, { email: user.email, type: 'customer' });
    }

    if (user.userType === 'farmer') {
        // console.log("Serializing farmer...");
        return done(null, { email: user.email, type: 'farmer' });
    }
});

passport.deserializeUser(async (user, done) => {
    if (user.type === 'customer') {
        const customer = await CustomerModel.get(user.email);
        return done(null, customer);
    }

    if (user.type === 'farmer') {
        // console.log("Deserializing farmer...");
        const farmer = await FarmerModel.getByEmail(user.email);
        return done(null, farmer);
    }
});

export {
    passport,
}