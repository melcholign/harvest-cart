import {pool} from '../db/pool.js';

class FarmerModel{

    static async getAll(){
        const query =
        `SELECT * FROM farmer;`;

        [results, fields] = await pool.query(query);
        return [results, fields];
    }

    static async getByEmail(email) {
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.email = "${email}";`;

         [results, fields] = await pool.query(query);
         return [results, fields];
    }

    static async getByID(id){
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.farmer_id = "${id}";`;

         [results, fields] = await pool.query(query);
         return [results, fields];
    }


    static async register(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash) {

        const query = 
        `INSERT into profile (firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash)
         VALUES ('${firstname}', '${lastname}', '${gender}', '${dob}', '${mobile}', '${address}', '${NID_img_path}', '${pfp_img_path}', '${email}', '${pass_hash}');`;

        [results, fields] = await pool.query(query);
        return [results, fields];
    }

    static async update(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash, farmer_ID){
        const query =
        `UPDATE farmer
         SET firstname = '${firstname}', 
         lastname = '${lastname}', 
         gender = '${gender}', 
         dob = '${dob}', 
         mobile = '${mobile}',
         address = '${address}',
         NID_img_path = '${NID_img_path}',
         pfp_img_path = '${pfp_img_path}',
         email = '${email}',
         pass_hash = '${pass_hash}',
         WHERE farmer_ID = '${farmer_ID}';`;

        [results, fields] = await pool.query(query);
        return [results, fields];
    }


    static async delete(farmer_ID){
        const query =
        `DELETE FROM farmer
        WHERE farmer_ID = '${farmer_ID}';`;

        [results, fields] = await pool.query(query);
        return [results, fields];

    }
}

export { FarmerModel };