-- Tabla de niveles o planes
CREATE TABLE tiers (
    idTier INTEGER PRIMARY KEY AUTOINCREMENT,
    webs INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- Tabla de usuarios registrados (incluyendo colaboradores))
CREATE TABLE users (
    idUser INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mail TEXT NOT NULL UNIQUE,
    pwd TEXT NOT NULL
);

-- Tabla de usuarios que son clientes
CREATE TABLE clients (
    idClient INTEGER PRIMARY KEY AUTOINCREMENT,
    idUser INTEGER NOT NULL UNIQUE,
    idTier INTEGER NOT NULL,
    status INTEGER NOT NULL DEFAULT 1, -- 0: Inactivo, 1: Activo
    FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE,
    FOREIGN KEY (idTier) REFERENCES tiers(idTier) ON DELETE CASCADE
);

-- Tabla de webs
CREATE TABLE webs (
    idWeb INTEGER PRIMARY KEY AUTOINCREMENT,
    idClient INTEGER NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    mode TEXT NOT NULL,
    anonName TEXT NOT NULL DEFAULT 'Anónimo',
    modName TEXT NULL,
    addName TEXT NOT NULL DEFAULT '<Moderador>',
    status INTEGER NOT NULL DEFAULT 1, -- 0: Inactivo, 1: Activo
    FOREIGN KEY (idClient) REFERENCES clients(idClient) ON DELETE CASCADE
);

-- Tabla de colaboradores de una web
CREATE TABLE mods (
    idMod INTEGER PRIMARY KEY AUTOINCREMENT,
    idUser INTEGER NOT NULL,
    idWeb INTEGER NOT NULL,
    FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE,
    FOREIGN KEY (idWeb) REFERENCES webs(idWeb) ON DELETE CASCADE
);

-- Tabla de comentarios anónimos sin referencia a users
CREATE TABLE comments (
    idComment INTEGER PRIMARY KEY AUTOINCREMENT,
    idWeb INTEGER NOT NULL,
    rootId INTEGER NULL,
    replyTo INTEGER NULL,
    fullURL TEXT NOT NULL,
    user TEXT NOT NULL DEFAULT 'Anónimo',
    userRef TEXT NULL,
    content TEXT NOT NULL,
    created TIMESTAMP DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (idWeb) REFERENCES webs(idWeb) ON DELETE CASCADE,
    FOREIGN KEY (rootId) REFERENCES comments(idComment) ON DELETE CASCADE,
    FOREIGN KEY (replyTo) REFERENCES comments(idComment) ON DELETE CASCADE
);