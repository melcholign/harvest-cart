import {FarmerModel} from '../models/farmerModel';
import bcrypt from 'bcrypt';


class farmerController{
    static async getAll(req, res){
        try{
            farmers = FarmerModel.getAll();

            if(farmers){
                return res.json({ farmers });
            }else{
                return res.json({message: 'No farmer accounts registered'});
            }
        } catch(err) {
            console.log(err);
            res.status(500).json({message: "Server Error"});
        }
    }

    static async getByID(req, res){
        const {id} = req.body;
        
        try{
            matchingFarmer = FarmerModel.getByID(id);
            if(matchingFarmer){
                return res.json({ matchingFarmer });
            }else{
                return res.json({message: 'No farmer of given ID'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server Error"});
        }
    }

    static async register(req, res){
        const {firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, password} = req.body;
        
        if(!(firstname && lastname && gender && dob && mobile && address && NID_img_path && pfp_img_path && email && password)){
            return res.json({message: "All input fields must be filled!"});
        }

        try {
            const existingFarmer = await FarmerModel.getByEmail(email);
            if(existingFarmer) {
                return res.status(400).json({message: 'An account with this email already exists'});
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            await FarmerModel.register(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, hashedPassword);
            
            res.status(201).json({ message: 'User registered successfully.'});
        }catch(err) {
            console.error(err);
            res.status(500).json({message: "Server Error"});
        }
    };
    
    
    static async login(req, res){
        const {email, password} = req.body;
        
        try{
            const farmer = await Farmer.getAccountByEmail(email);
            if(!farmer){
                return res.status(404).json({message: 'User not found'});
            }
            const passwordMatch = await bcrypt.compare(password, farmer.pass_hash);
            
            if(!passwordMatch){
                return res.status(401).json({message: 'Incorrect password or email.'});
            }
            


        
        }



            
    }
        
}

export { farmerController };