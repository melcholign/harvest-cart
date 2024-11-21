import { FarmerModel } from '../models/farmerModel.js';
import bcryptjs from 'bcryptjs';


class FarmerController{
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
        const {firstname, lastname, gender, dob, mobile, address, nid, pfp, email, password, farmer_id} = req.body;
        
        if(!(firstname && lastname && dob && mobile && address && nid && email && password && farmer_id)){
            return res.json({ message: "All required input fields must be filled!" });
        }
        try {
            const existingFarmer = await FarmerModel.getByEmail(email);

            if(existingFarmer) {
                return res.status(400).json({ message: 'An account with this email already exists' });
            }
            
            const hashedPassword = await bcryptjs.hash(password, 10);
            await FarmerModel.update(firstname, lastname, gender, dob, mobile, address, nid, pfp, email, hashedPassword, farmer_id);
            
            res.redirect('/farmer');
        }catch(err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };

    static async delete(req, res){
        const { id } = req.body;
        
        try{
            await FarmerModel.delete(id);
            res.redirect('/farmer/register');
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
}

export { FarmerController };