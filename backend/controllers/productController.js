import { ProductModel } from "../models/product-model.js";
import { FarmerModel } from "../models/farmerModel.js";
import { StoreModel } from "../models/storeModel.js";
import { StoreController } from "./storeController.js";
import fs from 'fs';

class ProductController{
    static async searchByName(req, res){
        const searchString = req.body;

        try{
            searchResultList = await ProductModel.searchByName(searchString);

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
        const { productName, category, description, price } = req.body;

        if(!(productName && category && price)){
            return res.json({ message: 'All required input fields must be filled!'});
        }

        const thumbnailImgPath = req.store.galleryImgsPath.replace('gallery','product') + req.uniqueProductName + '.jpg';

        try{
            await ProductModel.add(req.params.storeId, category, productName, description, price, thumbnailImgPath);
            return res.redirect('/farmer/store/' + req.params.storeId);
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)

                if(sqlMessageParse[2] == 'product_AK'){
                    return res.json({ message: 'This store already has another product with this name!' });
                }

                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another product!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }


    static async update(req, res){
        const { productName, category, description, price } = req.body;

        if(!(productName && category && price)){
            return res.json({ message: 'All required input fields must be filled!'});
        }

        try{
            await ProductModel.update(req.params.productId, category, productName, description, price);
            return res.redirect('/farmer/store/' + req.params.storeId);
        }catch(err) {
            if(err.code == 'ER_DUP_ENTRY'){
                const sqlMessageParse = /^Duplicate entry '(.*)' for key '(.*)'$/.exec(err.sqlMessage)

                if(sqlMessageParse[2] == 'product_AK'){
                    return res.json({ message: 'This store already has another product with this name!' });
                }

                return res.json({ message: 'The ' + sqlMessageParse[2] + ' enterred is in use by another product!' });
            }
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    static async delete(req, res){
        try{
            const productImagePath = res.locals.product.thumbnailImgPath;
            fs.rmSync(productImagePath);
            await ProductModel.delete(req.params.productId);
            res.redirect('/farmer/store/' + req.params.storeId);
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }
    

}

export { ProductController };