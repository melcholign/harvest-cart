import LocalStrategy from 'passport-local' 
import bcryptjs from 'bcryptjs';
 
function initializePassport(passport, getFarmerByEmail, getFarmerByID){
    const authenticateFarmer = async (email, password, done) => {
        const [farmer,] = getFarmerByEmail(email);
        if(!farmer){
            return done(null, false, {message: "Email or password incorrect."});
        }
        try {
            if (!(await bcryptjs.compare(password, farmer.pass_hash))){
                return done(null, false, {message: "Email or password incorrect."});
            }
            return done(null, farmer);
        } catch(err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateFarmer));
    passport.serializeUser((farmer, done) => done(null,farmer.farmer_id));
    passport.deserializeUser((farmer_id, done) => {
        return done(null, getFarmerByID(farmer_id));
    });
} 


export {initializePassport};