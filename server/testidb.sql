drop table if exists favorites;
drop table if exists reviews;
drop table if exists account;

create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
);

CREATE TABLE favorites (
    id_favorite SERIAL PRIMARY KEY,
    id_account INTEGER NOT NULL,
    movie_title VARCHAR(45),
    tmdb_id INT,
	CONSTRAINT user_favorite_unique UNIQUE (id_account, tmdb_id),
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
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