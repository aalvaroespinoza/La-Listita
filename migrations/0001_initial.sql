CREATE TABLE profiles (id TEXT PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO profiles VALUES ('leticia','Leticia'),('sofia','Sofía'),('lorenzo','Lorenzo'),('ariel','Ariel'),('alvaro','Álvaro');
CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT NOT NULL, normalized TEXT NOT NULL UNIQUE, emoji TEXT NOT NULL DEFAULT '🛒', uses INTEGER NOT NULL DEFAULT 0, last_added TEXT);
CREATE TABLE items (id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), profile_id TEXT NOT NULL REFERENCES profiles(id), quantity TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', done INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE UNIQUE INDEX one_pending_product ON items(product_id) WHERE done=0;
CREATE INDEX items_status ON items(done,created_at);
CREATE TABLE requests (id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT INTO products (id,name,normalized,emoji) VALUES ('leche','Leche','leche','🥛'),('pan','Pan','pan','🥖'),('huevos','Huevos','huevos','🥚'),('bananas','Bananas','bananas','🍌'),('tomates','Tomates','tomates','🍅'),('arroz','Arroz','arroz','🍚'),('pollo','Pollo','pollo','🍗'),('yerba','Yerba','yerba','🧉'),('papel','Papel higiénico','papel higienico','🧻'),('queso','Queso','queso','🧀'),('manzanas','Manzanas','manzanas','🍎'),('fideos','Fideos','fideos','🍝');
