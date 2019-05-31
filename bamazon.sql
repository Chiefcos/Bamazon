DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products
(
    item_id INT NOT NULL
    AUTO_INCREMENT,
product_name VARCHAR
    (30) NOT NULL,
department_name VARCHAR
    (30),
price INT
    (10),
stock_quantity INT
    (10),
PRIMARY KEY
    (item_id)
);

    INSERT INTO products
        (product_name, department_name, price, stock_quantity)
    VALUES
        ("yPhone", "Electronics", 432, 20),
        ("Pacbook Pro", "Electronics", 2164, 45),
        ("Mamsung Nebula", "Electronics", 754, 24),
        ("Wiele Dishwasher", "Appliances", 489, 12),
        ("MIKEA Couch", "Furniture", 735, 5),
        ("Madidas sneakers", "Clothing", 84, 43),
        ("Boreman Grill", "Appliances", 235, 7),
        ("Virkenstocks sandals", "Clothing", 43, 34),
        ("Bom Slancy - Ghost Peeking", "Books", 23, 123),
        ("Manon Inkjet", "Electronics", 256, 25);

    ALTER TABLE products
    ADD product_sales INT(10);

    CREATE TABLE departments
    (
        department_id INT NOT NULL
        AUTO_INCREMENT,
    department_name VARCHAR
        (30),
    over_head_costs INT
        (10),
        PRIMARY KEY
        (department_id)
);

        INSERT INTO departments
            (department_name, over_head_costs)
        SELECT department_name
        FROM products

        VALUES