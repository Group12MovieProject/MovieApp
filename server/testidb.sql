drop table if exists reviews;
drop table if exists account;


create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
);

create table reviews (
    id_review serial primary key,
    id_account INTEGER NOT NULL,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    review_text TEXT,
    tmdb_id INT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE
);
