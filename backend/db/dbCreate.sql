CREATE DATABASE cse327_project;

USE cse327_project;

CREATE TABLE farmer(
    farmer_id int NOT NULL AUTO_INCREMENT,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender varchar(1),
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL,
    address varchar(50) NOT NULL,
    nid_img_path varchar(1024) NOT NULL UNIQUE,
    pfp_img_path varchar(1024) UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    pass_hash varchar(1024) NOT NULL,

    PRIMARY KEY(farmer_id)
);

CREATE table store(
    store_id int NOT NULL AUTO_INCREMENT,
    farmer_id int NOT NULL UNIQUE,

    store_name varchar(50) NOT NULL,
    rating int,
    is_open BOOLEAN NOT NULL,
    description varchar(5000),
    gallery_imgs_path varchar(255),
    cover_img_path varchar(255),


    PRIMARY KEY(store_id),
    FOREIGN KEY(farmer_id) REFERENCES farmer(farmer_id)
);