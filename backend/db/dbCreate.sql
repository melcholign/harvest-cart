CREATE DATABASE cse327_project;

USE cse327_project;

CREATE TABLE farmer(
    farmer_ID int AUTO_INCREMENT,
    store_ID int NOT NULL UNIQUE,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender varchar(1),
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL,
    address varchar(50) NOT NULL,
    NID_img_path varchar(1024) NOT NULL UNIQUE,
    pfp_img_path varchar(1024) UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    pass_hash varchar NOT NULL,

    PRIMARY KEY(farmer_ID),
    FOREIGN KEY(store_ID) references store(store_ID)
);

