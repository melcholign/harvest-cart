import bcryptjs from 'bcryptjs';
import { FarmerModel } from '../../../models/farmerModel.js';
import { Strategy as LocalStrategy } from 'passport-local';

async function authenticateFarmer(email, password, done) {
    try {
        const farmer = await FarmerModel.getByEmail(email);

        console.log("Authenticating farmer:")
        console.log(farmer);

        if (!farmer) {
            console.log("No such email account.");
            return done(null, false, { message: "Email or password incorrect." });
        }

        console.log("FarmerID: " + farmer.farmerId);
        if (!(await bcryptjs.compare(password, farmer.passHash))) {
            console.log("Password NOT correct!");
            return done(null, false, { message: "Email or password incorrect." });
        }

        farmer.userType = 'farmer';
        console.log("Password correct!");
        return done(null, farmer);
    } catch (err) {
        return done(err);
    }
}

export function useLocalFarmerStrategy(passport) {
    const options = { usernameField: 'email'};
    passport.use('local-farmer', new LocalStrategy(options, authenticateFarmer));
}
