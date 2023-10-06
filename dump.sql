create table usuarios (
    id serial primary key,
    nome text not null,
    email text unique not null,
    senha text not null
);

create table categorias (
    id serial primary key,
    descricao text not null
);

create table transacoes (
    id serial primary key,
    descricao text not null,
    valor integer not null,
    data timestamp not null,
    categoria_id integer not null,
    usuario_id integer not null,
    tipo text not null,
    foreign key (categoria_id) references categorias(id),
    foreign key (usuario_id) references usuarios(id)
);