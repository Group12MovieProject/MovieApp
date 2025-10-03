DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS group_account;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS account;

-- Account table: stores user account data, email and password.
CREATE TABLE account (
    id_account SERIAL PRIMARY KEY,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Favorites table: stores user saved favorites. Movies are uniquely id:d so single movie can be added only once.
CREATE TABLE favorites (
    id_favorite SERIAL PRIMARY KEY,
    id_account INTEGER NOT NULL,
    movie_title VARCHAR(45),
    tmdb_id INT,
    CONSTRAINT user_favorites_unique UNIQUE(id_account, tmdb_id),
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
);

-- Reviews table: stores user created reviews. One user can review many movies but only one review per unique movie.
CREATE TABLE reviews (
    id_review SERIAL PRIMARY KEY,
    id_account INTEGER NOT NULL,
    tmdb_id INT NOT NULL,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    review_text TEXT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_movie_unique UNIQUE (id_account, tmdb_id),
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
);

-- Groups table: stores group metadata. A group can have many members.
CREATE TABLE groups (
    id_group SERIAL PRIMARY KEY,
    group_name VARCHAR(45) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_group_name UNIQUE (group_name),
    CONSTRAINT fk_groups_owner FOREIGN KEY (owner_id) REFERENCES account(id_account) ON DELETE CASCADE
);

-- Join table to represent membership (many-to-many between account and groups)
CREATE TABLE group_account (
    id_group_account SERIAL PRIMARY KEY,
    id_account INTEGER NOT NULL,
    id_group INTEGER NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_account_user FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE,
    CONSTRAINT fk_group_account_group FOREIGN KEY (id_group) REFERENCES groups(id_group) ON DELETE CASCADE,
    CONSTRAINT unique_membership UNIQUE (id_account, id_group)
);

-- New test users: dunno if these work.
-- test@test.com / test123
INSERT INTO account (email, password) VALUES 
('test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- foo@testi.com / Salasana123 
INSERT INTO account (email, password) VALUES 
('foo@testi.com', '$2b$10$K.nP0zWQ1DtLEQBcXQ2nDO5vTzVh8wlOYCZZGNJqWzIr8qGQVQnAC');

-- Let's add couple of movie reviews with test users --

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(1, 550, 'Loistava elokuva, joka saa ajattelemaan elämän tarkoitusta. Brad Pitt ja Edward Norton ovat upeita. Käsikirjoitus on nervokas ja lopetus yllättävä!', 5);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(2, 603, 'The Matrix on aikansa klassikko! Visuaalisuus oli aikanaan vallankumouksellista ja tarina yhä ajankohtainen. Keanu Reeves sopii rooliin täydellisesti.', 4);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(1, 27205, 'Christopher Nolanin Inception on mielenkiintoinen mutta monimutkainen. Unien sisällä olevia unia on vaikea seurata, mutta visuaalisuus on huikeaa.', 4);

INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES 
(2, 157336, 'Interstellar on tunteellinen ja tieteellinen mestariteos. Matthew McConaughey näyttelee hienosti. Avaruuskohtaukset ovat henkeäsalpaavia!', 5);



