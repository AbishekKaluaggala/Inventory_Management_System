create database inventoty_system; 
use inventory_system;

create table users(
userID varchar(50) primary key,
username varchar(100) not null,
password varchar(255) not null,
role varchar(20) not null
);

create table products (
productID varchar(50) primary key,
name varchar(100) not null,
description text,
price decimal(10,2) not null,
stockQty INT not null,
minStockLevel int not null,
maxStockLevel int not null
);
