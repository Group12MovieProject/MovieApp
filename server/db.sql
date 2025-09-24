create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
);

CREATE TABLE favorites (
    id_favorite SERIAL PRIMARY KEY,
    id_account INT REFERENCES account(id_account),
    movie_title VARCHAR(45),
    tmdb_id INT,
    UNIQUE(id_account, tmdb_id)
);

-- Uudet testikäyttäjät bcrypt hashatuilla salasanoilla:
-- test@test.com / test123
INSERT INTO account (email, password) VALUES 
('test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')

-- foo@testi.com / Salasana123 
INSERT INTO account (email, password) VALUES 
('foo@testi.com', '$2b$10$K.nP0zWQ1DtLEQBcXQ2nDO5vTzVh8wlOYCZZGNJqWzIr8qGQVQnAC')