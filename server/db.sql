drop table if exists reviews;
drop table if exists account;

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

create table reviews (
    id_review serial primary key,
    id_account INTEGER NOT NULL,
    tmdb_id INT NOT NULL,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    review_text TEXT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_movie_unique UNIQUE (id_account, tmdb_id),
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
);

-- Uudet testikäyttäjät bcrypt hashatuilla salasanoilla:
-- test@test.com / test123
INSERT INTO account (email, password) VALUES 
('test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- foo@testi.com / Salasana123 
INSERT INTO account (email, password) VALUES 
('foo@testi.com', '$2b$10$K.nP0zWQ1DtLEQBcXQ2nDO5vTzVh8wlOYCZZGNJqWzIr8qGQVQnAC');

-- Lisätään pari elokuva-arvostelua --

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(1, 550, 'Loistava elokuva, joka saa ajattelemaan elämän tarkoitusta. Brad Pitt ja Edward Norton ovat upeita. Käsikirjoitus on nervokas ja lopetus yllättävä!', 5);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(2, 603, 'The Matrix on aikansa klassikko! Visuaalisuus oli aikanaan vallankumouksellista ja tarina yhä ajankohtainen. Keanu Reeves sopii rooliin täydellisesti.', 4);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(1, 27205, 'Christopher Nolanin Inception on mielenkiintoinen mutta monimutkainen. Unien sisällä olevia unia on vaikea seurata, mutta visuaalisuus on huikeaa.', 4);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(2, 157336, 'Interstellar on tunteellinen ja tieteellinen mestariteos. Matthew McConaughey näyttelee hienosti. Avaruuskohtaukset ovat henkeäsalpaavia!', 5);