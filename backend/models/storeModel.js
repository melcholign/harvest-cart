import {pool} from '../db/pool.js';

class StoreModel{
    static async getAll(){
        const query =
        `SELECT * FROM store;`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(store_id){
        const query =
        `SELECT *
        FROM store s
        WHERE s.store_id = ${store_id};`;

        try{
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async create(farmer_id, store_name, description, gallery_imgs_path, cover_img_path){
        const query =
        `INSERT INTO store (farmer_id, store_name, description, gallery_imgs_path, cover_img_path)
        VALUES ('${farmer_id}', '${store_name}', '${description}', '${gallery_imgs_path}', '${cover_img_path}');`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async update(store_id, store_name, description, gallery_imgs_path, cover_img_path){
        const query =
        `UPDATE store
         SET store_name = '${store_name}',
             description = '${description}',
             gallery_imgs_path = '${gallery_imgs_path}',
             cover_img_path = '${cover_img_path}'
         WHERE store_id = ${store_id};`;

         try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async delete(store_id){
        const query =
        `DELETE FROM store
         WHERE store_id = ${store_id};`

         try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }
}


// testing (PASSED)
if(0){console.log(await StoreModel.getAll());}
if(0){console.log(await StoreModel.getByID(2));}
if(0){console.log(await StoreModel.create(6,'Slaughterer of all Poultry', 'am chimken seller. all chimken country-raised. very much health :>', 'woejwe/jwgjw', 'owjiowfjjgrgo/efwioj'));}
if(0){console.log(await StoreModel.create(4,'Abduls Groceries', 'Get the freshest groceries grown with care and love on our farmlands in countryside Sylhet.', 'oqjofjw/ifj.png', 'wtowffwe.jpeg'));}
if(0){console.log(await StoreModel.delete(1));}
if(0){console.log(await StoreModel.update(1, 'edited Groceries', 'Get the edited groceries grown with care and love from our farmlands in edited edited.', 'edited/ifj.png', 'edited'));}


export {StoreModel};