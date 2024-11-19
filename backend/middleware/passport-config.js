import LocalStrategy from 'passport-local' 
import bcrypt from 'bcrypt';
 
function initializePassport(passport, getFarmerByEmail, getFarmerByID){
    const authenticateFarmer = async (email, password, done) => {
        const [farmer,] = getFarmerByEmail(email);

        if(!farmer){
            return done(null, false, {message: "No user with that email."});
        }

        try {
            if (await bcrypt.compare(password, farmer.pass_hash)){
                return done(null, farmer);
            } else {
                return done(null, false, {message: "Password Incorrect."})
            }
        } catch(err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateFarmer));
    passport.serializeUser((user, done) => done(null,farmer.farmer_id));
    passport.deserializeUser((farmer_id, done) => {
        return done(null, getFarmerByID(farmer_id));
    });
} 

export {initializePassport};