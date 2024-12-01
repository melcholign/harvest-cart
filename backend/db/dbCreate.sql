CREATE DATABASE cse327_project;

USE cse327_project;

CREATE TABLE farmer(
    farmerId int NOT NULL AUTO_INCREMENT,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender ENUM('male', 'female', 'other') NULL,
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL UNIQUE,
    address varchar(50) NOT NULL,
    nidImgPath varchar(1024) NOT NULL UNIQUE,
    pfpImgPath varchar(1024) NULL UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    passHash varchar(1024) NOT NULL,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(farmerId)
);

CREATE table store(
    storeId int NOT NULL AUTO_INCREMENT,
    farmerId int NOT NULL,

    storeName varchar(50) NOT NULL,
    rating float NULL,
    isOpen BOOLEAN NOT NULL DEFAULT 0,
    description varchar(5000) NULL,
    galleryImgsPath varchar(255) UNIQUE,
    coverImgPath varchar(255) UNIQUE,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(storeId),
    FOREIGN KEY(farmerId) REFERENCES farmer(farmerId)
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
    customerId int NOT NULL AUTO_INCREMENT,
    customer_name varchar(100) NOT NULL,

    PRIMARY KEY(customerId)
);

CREATE table rating(
    rating_id int NOT NULL AUTO_INCREMENT,
    productId int NOT NULL,
    customerId int NOT NULL,

    rating int NOT NULL,
    comment varchar(1500) NULL,
    
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(rating_id),
    FOREIGN KEY(productId) REFERENCES product(productId),
    FOREIGN KEY(customerId) REFERENCES customer(customerId)
);

