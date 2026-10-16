INSERT INTO event (title, description, venue, date_time)
SELECT seed.title, seed.description, seed.venue, seed.date_time
FROM (
  SELECT 'Neon Dreams World Tour' AS title, 'Aurora Lights live in concert.' AS description, 'Madison Square Garden' AS venue, '2027-05-15 20:00:00' AS date_time
  UNION ALL SELECT 'Echoes of Tomorrow', 'The Midnight Collective live.', 'The O2 Arena', '2027-06-02 19:30:00'
  UNION ALL SELECT 'Summer Vibes Festival', 'A full day of live music.', 'Coachella Valley', '2027-07-20 16:00:00'
  UNION ALL SELECT 'Acoustic Nights', 'An intimate acoustic performance.', 'Blue Note Jazz Club', '2027-05-28 21:00:00'
  UNION ALL SELECT 'Bass Drop Revolution', 'A late-night electronic music show.', 'Warehouse District', '2027-08-10 22:00:00'
  UNION ALL SELECT 'Classical Reimagined', 'Classical compositions with a modern sound.', 'Carnegie Hall', '2027-09-05 19:00:00'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM event WHERE event.title = seed.title);

INSERT INTO zone (zone_name, price, total_capacity, available_capacity, event_id)
SELECT seed.zone_name, seed.price, seed.capacity, seed.capacity, event.id
FROM (
  SELECT 'Neon Dreams World Tour' AS event_title, 'FRONT' AS zone_name, 5000 AS price, 50 AS capacity
  UNION ALL SELECT 'Neon Dreams World Tour', 'LEFT', 2500, 80
  UNION ALL SELECT 'Neon Dreams World Tour', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Neon Dreams World Tour', 'AWAY', 1500, 120
  UNION ALL SELECT 'Echoes of Tomorrow', 'FRONT', 5000, 50
  UNION ALL SELECT 'Echoes of Tomorrow', 'LEFT', 2500, 80
  UNION ALL SELECT 'Echoes of Tomorrow', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Echoes of Tomorrow', 'AWAY', 1500, 120
  UNION ALL SELECT 'Summer Vibes Festival', 'FRONT', 5000, 50
  UNION ALL SELECT 'Summer Vibes Festival', 'LEFT', 2500, 80
  UNION ALL SELECT 'Summer Vibes Festival', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Summer Vibes Festival', 'AWAY', 1500, 120
  UNION ALL SELECT 'Acoustic Nights', 'FRONT', 5000, 50
  UNION ALL SELECT 'Acoustic Nights', 'LEFT', 2500, 80
  UNION ALL SELECT 'Acoustic Nights', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Acoustic Nights', 'AWAY', 1500, 120
  UNION ALL SELECT 'Bass Drop Revolution', 'FRONT', 5000, 50
  UNION ALL SELECT 'Bass Drop Revolution', 'LEFT', 2500, 80
  UNION ALL SELECT 'Bass Drop Revolution', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Bass Drop Revolution', 'AWAY', 1500, 120
  UNION ALL SELECT 'Classical Reimagined', 'FRONT', 5000, 50
  UNION ALL SELECT 'Classical Reimagined', 'LEFT', 2500, 80
  UNION ALL SELECT 'Classical Reimagined', 'RIGHT', 2500, 80
  UNION ALL SELECT 'Classical Reimagined', 'AWAY', 1500, 120
) AS seed
JOIN event ON event.title = seed.event_title
WHERE NOT EXISTS (
  SELECT 1 FROM zone
  WHERE zone.event_id = event.id AND zone.zone_name = seed.zone_name
);

INSERT IGNORE INTO users (id, name, email, password, role)
VALUES (1, 'Local Demo User', 'demo@example.com', 'demo-password', 'USER');