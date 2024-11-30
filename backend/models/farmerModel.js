import { pool } from '../db/pool.js';

/* //STUPID CODE RUNS IN PHPMYADMIN BUT throws <<<DUMB>>> "sYnTAx ErRoR" WHEN RUNNING THROUGH POOL.QUERY AAAAAAAAAAAAAAAAAAAHHHHHHHHHHHH
const schema =
    `
CREATE TABLE IF NOT EXISTS farmer(
    farmer_id int NOT NULL AUTO_INCREMENT,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL UNIQUE,
    address varchar(50) NOT NULL,
    nid_img_path varchar(255) NOT NULL UNIQUE,
    pfp_img_path varchar(255) NULL UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    pass_hash varchar(255) NOT NULL,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(farmer_id)
);

CREATE TABLE IF NOT EXISTS store(
    storeId int NOT NULL AUTO_INCREMENT,
    farmer_id int NOT NULL,

    store_name varchar(50) NOT NULL,
    rating float,
    is_open BOOLEAN NOT NULL,
    description varchar(5000),
    gallery_imgs_path varchar(255),
    cover_img_path varchar(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(storeId),
    FOREIGN KEY(farmer_id) REFERENCES farmer(farmer_id)
);
`
await pool.query(schema);
*/



class FarmerModel {
    static async getAll() {
        const query =
            `SELECT * FROM farmer;`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByEmail(email) {
        const query =
            `SELECT * 
         FROM farmer f
         WHERE f.email = "${email}";`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(id) {
        const query =
            `SELECT * 
         FROM farmer f
         WHERE f.farmer_id = "${id}";`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async searchByName(search_string) {
        const query =
            `SELECT *
        FROM farmer f
        WHERE (f.firstname, ' ', f.lastname) LIKE '%${search_string}%'
        ORDER BY
          CASE
            WHEN (f.firstname, ' ', f.lastname) LIKE '${search_string}' THEN 0
            WHEN (f.firstname, ' ', f.lastname) LIKE '${search_string}%' THEN 1
            WHEN (f.firstname, ' ', f.lastname) LIKE '%${search_string}' THEN 2
            ELSE 3
          END`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getStores(farmer_id) {
        const query =
        `SELECT *
        FROM store s
        WHERE s.farmer_id = ${farmer_id};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }



    static async register(firstname, lastname, gender, dob, mobile, address, NID_img_path, pfp_img_path, email, pass_hash) {

        const query =
            `INSERT into farmer (firstname, lastname, gender, dob, mobile, address, nid_img_path, pfp_img_path, email, pass_hash)
         VALUES ('${firstname}', '${lastname}', '${gender}', '${dob}', '${mobile}', '${address}', '${NID_img_path}', '${pfp_img_path}', '${email}', '${pass_hash}');`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async update(firstname, lastname, gender, dob, mobile, address, email, pass_hash, farmer_id) {
        const query =
            `UPDATE farmer
         SET firstname = '${firstname}', 
         lastname = '${lastname}', 
         gender = '${gender}', 
         dob = '${dob}', 
         mobile = '${mobile}',
         address = '${address}',
         email = '${email}',
         pass_hash = '${pass_hash}'
         WHERE farmer_id = ${farmer_id};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async delete(farmer_ID) {
        const query =
            `DELETE FROM farmer
        WHERE farmer_id = '${farmer_ID}';`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }

    }
}

// testing (PASSED)
if (0) { console.log(await FarmerModel.register("Person", "I", "M", "2001-10-22", "01430850152", "Sylhet", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "personI@gmail.com", "141fwei81AEF4014080")); }
if (0) { console.log(await FarmerModel.register("Person", "II", "F", "1991-06-05", "01518530911", "Barishal", "src/imgs/farmer/NID/vwojvwow.jpg", "src/imgs/farmer/pfp/fowf32j.jpg", "personII@gmail.com", "fwojfweAEF4014080")); }
if (0) { console.log(await FarmerModel.getAll()); }
if (0) { console.log(await FarmerModel.getByID(1)); }
if (0) { console.log(await FarmerModel.getByEmail('abrar123@gmail.com')); }
if (0) { console.log(await FarmerModel.delete("10")); }
if (0) { console.log(await FarmerModel.update("Edited", "Person", "E", "24-02-2010", "10853581", "Chittagong", "src/imgs/farmer/NID/wejofoej.jpg", "src/imgs/farmer/pfp/fowjfoj.jpg", "farmer@gmail.com", "14103481AEF4014080", "7")); }


export { FarmerModel };