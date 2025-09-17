create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
);

INSERT INTO account (email, password) Values ('foo@testi.com', 'Salasana123');