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

    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(farmer_id)
);

CREATE table store(
    store_id int NOT NULL AUTO_INCREMENT,
    farmer_id int NOT NULL,

    store_name varchar(50) NOT NULL,
    rating float,
    is_open BOOLEAN NOT NULL,
    description varchar(5000),
    gallery_imgs_path varchar(255),
    cover_img_path varchar(255),

    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(store_id),
    FOREIGN KEY(farmer_id) REFERENCES farmer(farmer_id)
);


CREATE table product(
    product_id int NOT NULL AUTO_INCREMENT,
    store_id int NOT NULL,
    /*
    category_id int NOT NULL,
    */

    category ENUM(  'Fruits', 'Vegetables', 'Herbs', 'Dairy', 
                    'Poultry', 'Seafood', 'Red Meat', 'Fish',
                    'Grains', 'Condiments', 'Spices & Seasonings'),
    
    product_name varchar(50) NOT NULL,
    description varchar(1000),
    rating double(3,2),
    stock_quantity int,
    price float,

    thumbnail_img_path varchar(255),

    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(product_id),
    FOREIGN KEY(store_id) REFERENCES store(store_id)
);

CREATE table customer(
    customer_id int NOT NULL AUTO_INCREMENT,
    customer_name varchar(100) NOT NULL,

    PRIMARY KEY(customer_id)
);

CREATE table rating(
    rating_id int NOT NULL AUTO_INCREMENT,
    product_id int NOT NULL,
    customer_id int NOT NULL,

    rating int NOT NULL,
    comment varchar(1500) NULL,
    
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(rating_id),
    FOREIGN KEY(product_id) REFERENCES product(product_id),
    FOREIGN KEY(customer_id) REFERENCES customer(customer_id)
);

