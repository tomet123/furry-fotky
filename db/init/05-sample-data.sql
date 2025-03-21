-- Vkládání testovacích dat

-- Vložení fotografů
INSERT INTO photographers (name, bio)
VALUES 
  ('FOXA', 'Zkušený fotograf zaměřený na události'),
  ('SkiaA', 'Fotograf specializující se na portréty'),
  ('TygrA', 'Landscape a wildlife fotograf'),
  ('PandaA', 'Nadšený amatérský fotograf'),
  ('VlkA', 'Fotí především v přírodě'),
  ('OtterA', 'Městský fotograf'),
  ('ŠakalA', 'Event fotograf');

-- Vložení událostí
INSERT INTO events (name, description, date)
VALUES 
  ('Furmeet PrahaA', 'Pravidelné setkání furry komunity v Praze', '2023-06-15'),
  ('Czech Furry ConA', 'Největší furry konvence v Česku', '2023-10-20'),
  ('FurFestA', 'Mezinárodní furry festival', '2023-08-05'),
  ('PelíškováníA', 'Komorní setkání', '2023-05-12'),
  ('FotomeetA', 'Setkání zaměřené na fotografování', '2023-09-30');

-- Vložení tagů
INSERT INTO tags (name)
VALUES 
  ('fursuitA'),
  ('outdoorA'),
  ('indoorA'),
  ('conA'),
  ('meetupA'),
  ('portraitA'),
  ('groupA'),
  ('black_whiteA'),
  ('colorfulA'),
  ('nightA'),
  ('summerA'),
  ('winterA'),
  ('springA'),
  ('autumnA'),
  ('studioA'),
  ('natureA'),
  ('urbanA'),
  ('candidA');

-- Vložení fotografií
INSERT INTO photos (event_id, photographer_id, likes, date)
VALUES
  (1, 1, 15, '2023-06-15'),
  (1, 2, 8, '2023-06-15'),
  (2, 3, 25, '2023-10-20'),
  (2, 1, 30, '2023-10-20'),
  (3, 4, 12, '2023-08-05'),
  (3, 5, 5, '2023-08-05'),
  (4, 6, 18, '2023-05-12'),
  (4, 7, 22, '2023-05-12'),
  (5, 2, 9, '2023-09-30'),
  (5, 3, 14, '2023-09-30');

-- Přidání tagů k fotografiím
INSERT INTO photo_tags (photo_id, tag_id)
VALUES
  (1, 1), (1, 3), (1, 5),
  (2, 2), (2, 6), (2, 9),
  (3, 1), (3, 4), (3, 7),
  (4, 3), (4, 4), (4, 8),
  (5, 1), (5, 2), (5, 10),
  (6, 2), (6, 15), (6, 16),
  (7, 3), (7, 5), (7, 18),
  (8, 1), (8, 7), (8, 9),
  (9, 2), (9, 6), (9, 16),
  (10, 3), (10, 17), (10, 18);

