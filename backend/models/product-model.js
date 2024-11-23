import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS Product (
    productId INT NOT NULL AUTO_INCREMENT,
    -- storeId INT NOT NULL,

    productName VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    category ENUM(
        'fruits', 'vegetables', 'herbs', 'dairy', 
        'poultry', 'seafood', 'red meat', 'fish',
        'grains', 'condiments', 'spices & seasonings',
        'miscellaneous'
    ) NOT NULL DEFAULT 'miscellaneous',
    rating DOUBLE(3,2),
    stockQuantity INT,
    price FLOAT,

    thumbnailImgPath VARCHAR(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(productId)
    -- FOREIGN KEY(storeId) REFERENCES store(storeId),
);
`
await loadSchema(pool, schema, 'Product');

class ProductModel {

    static CATEGORIES = {
        FRUITS: 'fruit',
        VEGETABLES: 'vegetables',
        HERBS: 'herbs',
        DIARY: 'dairy',
        POULTRY: 'poultry',
        SEAFOOD: 'seafood',
        RED_MEAT: 'red meat',
        FISH: 'fish',
        GRAINS: 'grains',
        CONDIMENTS: 'condiments',
        SPICES_AND_SEASONINGS: 'spices & seasonings',
    }
}

export {
    ProductModel,
}