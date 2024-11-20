import LocalStrategy from 'passport-local' 
import bcryptjs from 'bcryptjs';
 
function initializePassport(passport, getFarmerByEmail, getFarmerByID){
    const authenticateFarmer = async (email, password, done) => {
        
        const farmer = await getFarmerByEmail(email);
        
        console.log("Authenticating farmer:")
        console.log(farmer);
        
        if(!farmer){
            console.log("No such email account.");
            return done(null, false, {message: "Email or password incorrect."});
        }

        console.log("FarmerID: " + farmer.farmer_id);

        try {
            if (!(await bcryptjs.compare(password, farmer.pass_hash))){
                console.log("Password NOT correct!");
                return done(null, false, {message: "Email or password incorrect."});
            }
            console.log("Password correct!");
            return done(null, farmer);
        } catch(err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateFarmer));
    passport.serializeUser((farmer, done) => {
        console.log("Serializing farmer:" + farmer.farmer_id);
        done(null,farmer.farmer_id);
    });
    passport.deserializeUser(async (farmer_id, done) => {
        console.log("Deserializing farmer: ");
        console.log("FarmerID: " + farmer_id);
        console.log(await getFarmerByID(farmer_id));
        return done(null, await getFarmerByID(farmer_id));
    });
} 


export {initializePassport};