import { StoreModel } from "../models/storeModel.js";
import { FarmerModel } from "../models/farmerModel.js";
import { ProductModel } from "../models/product-model.js";
import fs from 'fs';

class StoreController{
    static async searchByName(req, res){
        const searchString = req.body;

        try{
            searchResultList = await StoreModel.searchByName(searchString);

            if(searchResultList.length == 0){
                res.json({ message: 'No stores match your searched name.'});
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
            const stores = await StoreModel.getAll();
            if(stores.length == 0){
                return res.json({message: 'There are no stores.'});
            }
            return res.json({ stores });

        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }
    
    static async getByID(req, res){
        const { storeId } = req.body;
        
        try{
            const matchingStore = await StoreModel.getByID(storeId);
            if(!matchingStore){
                return res.json({message: 'There are no stores with this id.'});;
            }
            return res.json({ matchingStore });    
            
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }
    */

    static async add(req, res){
        console.log(req.body);
        const { store_name, description } = req.body;

        if(!store_name){
            return res.json({ message: 'All required input fields must be filled!'});
        }
        
        const cover_img_path =  req.user.nid_img_path.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/cover.jpg';
        const gallery_imgs_path = req.user.nid_img_path.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/gallery/';


        try{
            await StoreModel.add(req.user.farmer_id, store_name, description, gallery_imgs_path, cover_img_path);
            return res.redirect('/farmer');
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)

                if(sqlMessageParse[2] == 'store_AK'){
                    return res.json({ message: 'This farmer account already has another store with this name!' });
                }

                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another store!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    static async enterStore(req, res){
        try{
            res.render('store.ejs', {
                store: res.locals.store,
                products: await StoreModel.getProducts(req.params.storeId)
            });
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }

    static async update(req, res){
        console.log('Updating store:');
        console.log(req.body);
        console.log('This stores id:' + req.params.storeId);

        const {store_name, description} = req.body;

        if(!(store_name)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        try {
            await StoreModel.update(req.params.storeId, store_name, description);
            res.redirect('/farmer/store/' + req.params.storeId);
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)

                // index 2 because the second capturing grp in the regex contains the key that is being duplicated
                if(sqlMessageParse[2] == 'store_AK'){
                    return res.json({ message: 'This farmer account already has another store with this name!' });
                }

                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another store!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    };

    static async delete(req, res){
        try{
            const storeFolderPath = res.locals.store.cover_img_path.replace('cover.jpg','');
            fs.rmSync(storeFolderPath, { recursive: true, force: true });
            await StoreModel.delete(req.params.storeId);
            res.redirect('/farmer');
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
}

export { StoreController };