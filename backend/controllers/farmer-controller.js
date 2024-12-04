import { FarmerModel } from '../models/farmer-model.js';
import bcryptjs from 'bcryptjs';
import fs from 'fs';


class FarmerController{
    /**
     * Search farmers by name.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
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


    /**
     * Add new farmer after validating input.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async register(req, res){
        console.log(req.body);
        const {firstname, lastname, gender, dob, mobile, address, email, password} = req.body;
        
        // must check for empty strings because they don't count as NULL in mysql (so NOT NULL constraint does not check for them)
        if(!(firstname && lastname && dob && mobile && address && email && password)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        const nidImgPath = 'src/farmer/' + req.uniqueFarmerFolderName + '/nid.jpg';
        const pfpImgPath = 'src/farmer/' + req.uniqueFarmerFolderName + '/pfp.jpg';

        try {
            const hashedPassword = await bcryptjs.hash(password, 10);
            await FarmerModel.register(firstname, lastname, gender, dob, mobile, address, nidImgPath, pfpImgPath, email, hashedPassword);
            
            res.redirect('/farmer/login');
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)
                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another account!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };
        

    /**
     * Update farmer by ID, after validating input.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async update(req, res){
        console.log('Updating:');
        console.log(req.body);

        const {firstname, lastname, gender, dob, mobile, address, email, password} = req.body;
        console.log('This farmers id:' + req.user.farmerId);

        if(!(firstname && lastname && dob && mobile && address && email)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        try {
            let hashedPassword;
            if(!password){
                // no password enterred so reinsert old password hash
                console.log("Old pass reinserted");
                const storeFarmer = await FarmerModel.getByID(req.user.farmerId);
                hashedPassword = storeFarmer.passHash;
                console.log(hashedPassword);
            } else {
                // new password enterred so hash new password into db
                console.log("Hashing new pass");
                hashedPassword = await bcryptjs.hash(password, 10);
            }

            await FarmerModel.update(firstname, lastname, gender, dob, mobile, address, email, hashedPassword, req.user.farmerId);
            req.session.passport.user.email = email;
            res.redirect('/farmer');
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)
                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another account!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };

    /**
     * Delete farmer by ID and corresponding image directories stored in server.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async delete(req, res){
        try{
            const farmerFolderPath = req.user.nidImgPath.replace('nid.jpg','');
            fs.rmSync(farmerFolderPath, { recursive: true, force: true });
            // must store the farmer's id as req.user.farmerId is not available after logging out
            const storedID = req.user.farmerId;
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