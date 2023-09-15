-- Drop the "products" table if it exists
DROP TABLE IF EXISTS products;

-- Create the "products" table
CREATE TABLE products (
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    description TEXT
);
