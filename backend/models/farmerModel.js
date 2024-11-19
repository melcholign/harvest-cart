import {pool} from '../db/pool.js';

class FarmerModel{
    static async getAll(){
        const query =
        `SELECT * FROM farmer;`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByEmail(email) {
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.email = "${email}";`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(id){
        const query = 
        `SELECT * 
         FROM farmer f
         WHERE f.farmer_id = "${id}";`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async register(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash) {

        const query = 
        `INSERT into farmer (firstname, lastname, gender, dob, mobile, address, nid_img_path, pfp_img_path, email, pass_hash)
         VALUES ('${firstname}', '${lastname}', '${gender}', '${dob}', '${mobile}', '${address}', '${NID_img_path}', '${pfp_img_path}', '${email}', '${pass_hash}');`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
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
         pass_hash = '${pass_hash}'
         WHERE farmer_id = ${farmer_id};`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async delete(farmer_ID){
        const query =
        `DELETE FROM farmer
        WHERE farmer_id = '${farmer_ID}';`;

        try{
            const [results, fields] = await pool.query(query);
            return [results, fields];
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }

    }
}

// testing
if(0){console.log(await FarmerModel.register("Person", "I", "M", "2001-10-22", "01430850152", "Sylhet", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "personI@gmail.com", "141fwei81AEF4014080"));}
if(0){console.log(await FarmerModel.register("Person", "II", "F", "1991-06-05", "01518530911", "Barishal", "src/imgs/farmer/NID/vwojvwow.jpg", "src/imgs/farmer/pfp/fowf32j.jpg", "personII@gmail.com", "fwojfweAEF4014080"));}
if(0){console.log(await FarmerModel.getAll());}
if(0){console.log(await FarmerModel.getByEmail('personI@gmail.com'));}
if(0){console.log(await FarmerModel.delete("8"));}
if(0){console.log(await FarmerModel.update("Edited", "Person", "E", "24-02-2010", "10853581", "Chittagong", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "farmer@gmail.com", "14103481AEF4014080", "7"));}


export { FarmerModel };