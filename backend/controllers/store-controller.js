import { StoreModel } from "../models/store-model.js";
import fs from 'fs';

class StoreController{
    /**
     * Search stores by name.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
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

    /**
     * Add a new store, after validating input.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async add(req, res){
        console.log(req.body);
        const { storeName, description } = req.body;

        if(!storeName){
            return res.json({ message: 'All required input fields must be filled!'});
        }
        
        const coverImgPath =  req.user.nidImgPath.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/cover.jpg';
        const galleryImgsPath = req.user.nidImgPath.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/gallery/';


        try{
            await StoreModel.add(req.user.farmerId, storeName, description, galleryImgsPath, coverImgPath);
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

    /**
     * Render store page.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
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

    /**
     * Update a store's information, after validating input.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async update(req, res){
        console.log('Updating store:');
        console.log(req.body);
        console.log('This stores id:' + req.params.storeId);

        const {storeName, description} = req.body;

        if(!(storeName)){
            return res.json({ message: "All required input fields must be filled!" });
        }

        try {
            await StoreModel.update(req.params.storeId, storeName, description);
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

    /**
     * Delete store by ID and corresponding image directories stored in server.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    static async delete(req, res){
        try{
            const storeFolderPath = res.locals.store.coverImgPath.replace('cover.jpg','');
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