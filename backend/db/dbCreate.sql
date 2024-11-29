CREATE DATABASE cse327_project;

USE cse327_project;

CREATE TABLE farmer(
    farmer_id int NOT NULL AUTO_INCREMENT,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender ENUM('male', 'female', 'other') NULL,
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL UNIQUE,
    address varchar(50) NOT NULL,
    nid_img_path varchar(1024) NOT NULL UNIQUE,
    pfp_img_path varchar(1024) NULL UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    pass_hash varchar(1024) NOT NULL,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(farmer_id)
);

CREATE table store(
    storeId int NOT NULL AUTO_INCREMENT,
    farmer_id int NOT NULL,

    store_name varchar(50) NOT NULL,
    rating float NULL,
    is_open BOOLEAN NOT NULL DEFAULT 0,
    description varchar(5000) NULL,
    gallery_imgs_path varchar(255) UNIQUE,
    cover_img_path varchar(255) UNIQUE,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(storeId),
    FOREIGN KEY(farmer_id) REFERENCES farmer(farmer_id)
);


CREATE table product(
    productId int NOT NULL AUTO_INCREMENT,
    storeId int NOT NULL,
    /*
    category_id int NOT NULL,
    */

    category ENUM(  'Fruits', 'Vegetables', 'Herbs', 'Dairy', 
                    'Poultry', 'Seafood', 'Red Meat', 'Fish',
                    'Grains', 'Condiments', 'Spices & Seasonings'),
    
    productName varchar(50) NOT NULL,
    description varchar(1000),
    rating double(3,2),
    stockQuantity int,
    price float,

    thumbnailImgPath varchar(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(productId),
    FOREIGN KEY(storeId) REFERENCES store(storeId)
);

CREATE table customer(
    customer_id int NOT NULL AUTO_INCREMENT,
    customer_name varchar(100) NOT NULL,

    PRIMARY KEY(customer_id)
);

CREATE table rating(
    rating_id int NOT NULL AUTO_INCREMENT,
    productId int NOT NULL,
    customer_id int NOT NULL,

    rating int NOT NULL,
    comment varchar(1500) NULL,
    
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(rating_id),
    FOREIGN KEY(productId) REFERENCES product(productId),
    FOREIGN KEY(customer_id) REFERENCES customer(customer_id)
);

