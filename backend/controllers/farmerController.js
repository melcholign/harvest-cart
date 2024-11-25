import { FarmerModel } from '../models/farmerModel.js';
import bcryptjs from 'bcryptjs';


class FarmerController{

    static async searchByName(req, res){
        const searchString = req.body;

        try{
            searchResultList = await FarmerModel.searchByName(searchString);

            if(searchResultList.length == 0){
                res.json({ message: 'No farmers match your searched name.'});
            }
            res.json({ searchResultList });
        } catch(err){
            console.log(err);
            res.json({ message: "Server error" });
        }
    }

    /*
    static async getAll(req, res){
        try{
            farmers = FarmerModel.getAll();

            if(farmers.length == 0){
                return res.json({message: 'No farmer accounts registered'})
            }
            return res.json({ farmers });

        } catch(err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
    
    static async getByID(req, res){
        const { id } = req.body;
        
        try{
            matchingFarmer = FarmerModel.getByID(id);
            
            if(!matchingFarmer){
                return res.json({ message: 'No farmer of given ID' });
            }
            return res.json({ matchingFarmer });

        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
    */

    static async register(req, res){
        console.log(req.body);
        const {firstname, lastname, gender, dob, mobile, address, nid, pfp, email, password} = req.body;
        
        if(!(firstname && lastname && dob && mobile && address && nid && email && password)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        try {
            console.log(email);
            const existingFarmer = await FarmerModel.getByEmail(email);
    
            if(existingFarmer) {
                return res.status(400).json({ message: 'An account with this email already exists' });
            }
            
            const hashedPassword = await bcryptjs.hash(password, 10);
            await FarmerModel.register(firstname, lastname, gender, dob, mobile, address, nid, pfp, email, hashedPassword);
            
            res.redirect('/farmer/login');
        }catch(err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };
    
    /*
    static async login(req, res){
        const {email, password} = req.body;
        
        try{
            const [matchingFarmer, ] = await FarmerModel.getByEmail(email);
            if(!matchingFarmer){
                return res.status(404).json({ message: 'Incorrect email address' });
            }

            const passwordMatch = await bcryptjs.compare(password, matchingFarmer.pass_hash);
            if(!passwordMatch){
                return res.status(401).json({ message: 'Incorrect password or email.' });
            }
            


        
        }            
    }
    */
        

    static async update(req, res){
        console.log('Updating:');
        console.log(req.body);

        const {firstname, lastname, gender, dob, mobile, address, nid, pfp, email, password} = req.body;
        
        const thisFarmerID = req.user.farmer_id;
        console.log('This farmers id:' + thisFarmerID);

        if(!(firstname && lastname && dob && mobile && address && nid && email)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        try {
            // should ideally return nothing (new email address) OR their own farmer account (same old email address)
            const  checkFarmer = await FarmerModel.getByEmail(email);
            console.log('checkFarmer: ' + checkFarmer);
            if(checkFarmer && checkFarmer.farmer_id != thisFarmerID) {
                return res.status(400).json({ message: 'This email is in use by another account!' });
            }
            
            let hashedPassword;
            if(!password){
                // no password enterred so reinsert old password hash
                console.log("Old pass reinserted");
                const storeFarmer = await FarmerModel.getByID(thisFarmerID);
                hashedPassword = storeFarmer.pass_hash;
                console.log(hashedPassword);
            } else {
                // new password enterred so hash new password into db
                console.log("Hashing new pass");
                hashedPassword = await bcryptjs.hash(password, 10);
            }

            await FarmerModel.update(firstname, lastname, gender, dob, mobile, address, nid, pfp, email, hashedPassword, thisFarmerID);
            
            res.redirect('/farmer');
        }catch(err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };

    static async delete(req, res){
        try{
            const storedID = req.user.farmer_id;
            req.logout((err) => {
                if (err) { 
                    return next(err); 
                }
            });
            await FarmerModel.delete(storedID);
            res.redirect('/farmer/register');
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
}

export { FarmerController };