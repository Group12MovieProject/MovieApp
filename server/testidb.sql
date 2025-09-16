drop table if exists account

create table account (
    id_account serial primary key,
    email varchar(45) not null unique,
    password varchar(255) not null
)
