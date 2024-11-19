import {pool} from '../db/pool.js';

class FarmerModel{
    static async getAll(){
        const query =
        `SELECT * FROM farmer;`;

        const [results, fields] = await pool.query(query);
        return [results, fields];
    }

    static async getByEmail(email) {
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.email = "${email}";`;

         const [results, fields] = await pool.query(query);
         return [results, fields];
    }

    static async getByID(id){
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.farmer_id = "${id}";`;

         const [results, fields] = await pool.query(query);
         return [results, fields];
    }


    static async register(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash) {

        const query = 
        `INSERT into farmer (firstname, lastname, gender, dob, mobile, address, nid_img_path, pfp_img_path, email, pass_hash)
         VALUES ('${firstname}', '${lastname}', '${gender}', '${dob}', '${mobile}', '${address}', '${NID_img_path}', '${pfp_img_path}', '${email}', '${pass_hash}');`;

        try{
            await pool.query(query);
            console.log("Completed")
            return "1 row inserted";
        }catch(err){
            console.log(err);
            return err;
        }
    }

    static async update(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash, farmer_id){
        const query =
        `UPDATE farmer
         SET firstname = '${firstname}', 
         lastname = '${lastname}', 
         gender = '${gender}', 
         dob = '${dob}', 
         mobile = '${mobile}',
         address = '${address}',
         nid_img_path = '${NID_img_path}',
         pfp_img_path = '${pfp_img_path}',
         email = '${email}',
         pass_hash = '${pass_hash}',
         WHERE farmer_ID = '${farmer_id}';`;

        try{
            await pool.query(query);
            return "1 row updated";
         }catch(err){
            return err;
         }
    }


    static async delete(farmer_ID){
        const query =
        `DELETE FROM farmer
        WHERE farmer_id = '${farmer_ID}';`;

        try{
            await pool.query(query);
            return "1 row updated";
         }catch(err){
            return err;
         }

    }
}

// testing
//console.log(FarmerModel.register("fjwo", "fjowo", "M", "24-02-2010", "10853581", "Someplace", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "farmer@gmail.com", "14103481AEF4014080"));
console.log(await FarmerModel.getAll());
console.log(await FarmerModel.getByEmail('farmer@gmail.com'));
//console.log(FarmerModel.update("Mweojf", "wofj", "F", "24-02-2010", "10853581", "Noplace", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "farmer@gmail.com", "14103481AEF4014080", "3"));

export { FarmerModel };