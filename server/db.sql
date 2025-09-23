create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
)

create table reviews (
    id_review serial primary key,
    id_account INTEGER NOT NULL,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    review_text TEXT,
    tmdb_id INT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
)

-- Uudet testikäyttäjät bcrypt hashatuilla salasanoilla:
-- test@test.com / test123
INSERT INTO account (email, password) VALUES 
('test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')

-- foo@testi.com / Salasana123 
INSERT INTO account (email, password) VALUES 
('foo@testi.com', '$2b$10$K.nP0zWQ1DtLEQBcXQ2nDO5vTzVh8wlOYCZZGNJqWzIr8qGQVQnAC')