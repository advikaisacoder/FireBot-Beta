CREATE DATABASE IF NOT EXISTS firebot_db;
USE firebot_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    theme VARCHAR(50) NOT NULL
);
INSERT INTO users (name, email, password, theme) VALUES ('$name', '$email', '$pass', '$theme');