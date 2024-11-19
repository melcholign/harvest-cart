import {pool} from '../db/config.js';

class storeModel{
    static async getAll(){
        const query =
        `SELECT * FROM store`;

        [results, fields] = pool.query(query);
        return [results, fields];
    }

    static async getByID(store_id){
        const query =
        `SELECT * FROM store
        WHERE store_id = '${store_id}'`;

        [results, fields] = pool.query(query);
        return [results, fields];
    }

    static async create(farmer_id, store_name, description, gallery_imgs_path, cover_img_path){
        const query =
        `INSERT INTO store (farmer_id, store_name, description, gallery_imgs_path, cover_img_path)
        VALUES ('${farmer_id}', '${store_name}', '${description}', '${gallery_imgs_path}', '${cover_img_path}');`;

        [results, fields] = pool.query(query);
        return [results, fields];
    }


    static async update(store_id, farmer_id, store_name, description, gallery_imgs_path, cover_img_path){
        const query =
        `UPDATE store
         SET farmer_id = '${farmer_id}',
             store_name = '${store_name}'
             description = '${description}'
             gallery_imgs_path = '${gallery_imgs_path}'
             cover_img_path = '${cover_img_path}')
         WHERE store_id = '${store_id}';`;

        [results, fields] = pool.query(query);
        return [results, fields];
    }

    static async delete(store_id){
        const query =
        `DELETE FROM store
         WHERE store_id = '${store_id}';`

         [results, fields] = pool.query(query);
         return [results, fields];
    }
}

export {storeModel};