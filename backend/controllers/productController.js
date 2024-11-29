import { ProductModel } from "../models/product-model.js";
import { FarmerModel } from "../models/farmerModel.js";
import { StoreModel } from "../models/storeModel.js";
import { StoreController } from "./storeController.js";

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
        const { productName, category, description, price, thumbnailImg, storeId } = req.body;

        if(!(productName && category && price && thumbnailImg)){
            return res.json({ message: 'All required input fields must be filled!'});
        }

        const productsOfFarmer = await StoreModel.getProducts(storeId);
        console.log(productsOfFarmer);
        for(let x of productsOfFarmer){
            if(x.productName == productName){
                return res.json({ message: "Store already has a products with such name." });
            }
        }

        try{
            await ProductModel.add(storeId, category, productName, description, price, thumbnailImg);
            return StoreController.enterStore(req, res);
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }



    

}

export { ProductController };