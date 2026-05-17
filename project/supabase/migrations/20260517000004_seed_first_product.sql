/*
  # Seed First Product - Camisa Acampamento Convictios

  Inserts the first product into the catalog.
*/

INSERT INTO products (name, slug, description, price, category, images, featured, active, stock)
VALUES (
  'Camisa Acampamento Convictios',
  'camisa-acampamento-convictios',
  'Camisa oficial do Acampamento dos Convictos. Uma peça exclusiva para quem vive pela fé e carrega essa mensagem consigo.',
  65.00,
  'camisas',
  '{}',
  true,
  true,
  50
);
