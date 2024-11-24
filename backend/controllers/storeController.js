import { StoreModel } from "../models/StoreModel";

class StoreController{
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
        const { store_id } = req.body;

        try{
            const matchingStore = await StoreModel.getByID(store_id);
            if(!matchingStore){
                return res.json({message: 'There are no stores with this id.'});;
            }
            return res.json({ matchingStore });    
            
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }

    static async create(req, res){
        const { store_name, description, gallery_imgs, cover_img } = req.body;
        const farmer_id = req.user.farmer_id;

        if(!(store_name && description && gallery_imgs && cover_img)){
            return res.json({ message: 'All input fields must be filled!'});
        }

        const storesOfFarmer = StoreModel.getByFarmer(farmer_id);
        for(let x of storesOfFarmer){
            if(x.store_name == store_name){
                return res.json({ message: "Farmer already has a store with such name." });
            }
        }

        try{
            await StoreModel.create(farmer_id, store_name, description, gallery_imgs_path, cover_img_path);
            return res.redirect('/farmer/store/:name');
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }
}

export { StoreController };