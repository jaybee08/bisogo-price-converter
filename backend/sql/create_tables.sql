-- Begin a transaction
BEGIN;

-- Create the "products" table
CREATE TABLE products (
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    description TEXT
);

-- Commit the transaction to save the changes
COMMIT;
