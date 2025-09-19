create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
);

-- Vanha käyttäjä (salasana ei ole hashattu - ei toimi!)
-- INSERT INTO account (email, password) Values ('foo@testi.com', 'Salasana123');

-- Uudet testikäyttäjät bcrypt hashatuilla salasanoilla:
-- test@test.com / test123
INSERT INTO account (email, password) VALUES 
('test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- foo@testi.com / Salasana123 (oikein hashattu)
INSERT INTO account (email, password) VALUES 
('foo@testi.com', '$2b$10$K.nP0zWQ1DtLEQBcXQ2nDO5vTzVh8wlOYCZZGNJqWzIr8qGQVQnAC');