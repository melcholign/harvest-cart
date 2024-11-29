import { StoreModel } from "../models/storeModel.js";
import { FarmerModel } from "../models/farmerModel.js";
import { ProductModel } from "../models/product-model.js";

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
        const { store_name, description, gallery_imgs, cover_img } = req.body;
        const farmer_id = req.user.farmer_id;

        if(!store_name){
            return res.json({ message: 'All required input fields must be filled!'});
        }

        const storesOfFarmer = await FarmerModel.getStores(farmer_id);
        console.log(storesOfFarmer);
        for(let x of storesOfFarmer){
            if(x.store_name == store_name){
                return res.json({ message: "Farmer already has a store with such name." });
            }
        }

        try{
            await StoreModel.add(farmer_id, store_name, description, gallery_imgs, cover_img);
            return res.redirect('/farmer');
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }

    static async enterStore(req, res){
        try{
            const store = await StoreModel.getByID(req.body.storeId);
            
            // some access restriction in case post request body is altered by attackers
            if(store.farmer_id != req.user.farmer_id){
                return res.json({ message: 'Access denied!'});
            }

            res.render('store.ejs', {
                store: store,
                products: await StoreModel.getProducts(req.body.storeId)
            });
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }

    

}

export { StoreController };