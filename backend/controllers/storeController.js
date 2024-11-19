import { storeModel } from "../models/storeModel";



class storeController{
    static async getAll(req, res){
        try{
            const stores = await storeModel.getAll();
            if(!stores){
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
            const matchingStore = await storeModel.getByID(store_id);
            if(!matchingStore){
                return res.json({message: 'There are no stores with this id.'});;
            }
            return res.json({ matchingStore});    
            
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }

    static async create(req, res){
        const { store_name, description, gallery_imgs, cover_img } = req.body;

        if(!(store_name && description && gallery_imgs && cover_img)){
            return res.json({ message: 'All input fields must be filled!'});
        }

        


        try{
            await storeModel.create(farmer_id, store_name, description, gallery_imgs_path, cover_img_path);
            if(!matchingStore){
                return res.json({message: 'There are no stores with this id.'});;
            }
            return res.json({ matchingStore});    
            
        }catch(err){
            console.log(err);
            return res.json({message: 'Server Error'});
        }
    }
}

export { storeController };