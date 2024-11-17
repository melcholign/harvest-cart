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
        }
    }

    static async register(req, res){
        const {firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, password} = req.body;
        
        try {
            const existingFarmer = await Farmer.getByEmail(email);
            if(existingFarmer) {
                return res.status(400).json({message: 'An account with this email already exists'});
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            await Farmer.registerAccount(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, hashedPassword);
            
            res.status(201).json({ message: 'User registered successfully.'});
        }catch(error) {
            console.error(error);
            res.status(500).json({message: "Server Error"});
        }
    };
    
    
    static async loginFarmer(req, res){
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

