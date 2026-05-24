USE cahier_sante_maroc;

INSERT INTO regions (name)
SELECT 'Casablanca-Settat'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Casablanca-Settat');

INSERT INTO cities (region_id, name)
SELECT r.id, 'Casablanca'
FROM regions r
WHERE r.name = 'Casablanca-Settat'
  AND NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Casablanca');

INSERT INTO establishments (city_id, name, type, address, phone, status)
SELECT c.id, 'Administration Locale Casablanca-Anfa', 'local_admin',
       'Boulevard Mohammed V', '+212 522 000 000', 'active'
FROM cities c
WHERE c.name = 'Casablanca'
  AND NOT EXISTS (
    SELECT 1 FROM establishments WHERE name = 'Administration Locale Casablanca-Anfa'
  );

INSERT INTO users (role_id, establishment_id, name, email, password, employee_number, phone, status)
SELECT r.id, e.id, 'Admin Local Casablanca', 'admin@csm.ma', 'password',
       'LOC-001', '+212 522 000 000', 'active'
FROM roles r
CROSS JOIN establishments e
WHERE r.name = 'admin_local'
  AND e.name = 'Administration Locale Casablanca-Anfa'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@csm.ma');

UPDATE users
SET employee_number = 'LOC-001',
    name = 'Admin Local Casablanca',
    password = 'password',
    status = 'active'
WHERE email = 'admin@csm.ma';

UPDATE users
SET password = 'password',
    status = 'active'
WHERE employee_number = 'LOC-001';

INSERT INTO users (role_id, establishment_id, name, email, password, employee_number, phone, status)
SELECT r.id, e.id, 'Super Administrateur', 'super@csm.ma', 'password',
       'SA-0001', '+212 522 000 000', 'active'
FROM roles r
CROSS JOIN establishments e
WHERE r.name = 'admin_general'
  AND e.name = 'Administration Locale Casablanca-Anfa'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'super@csm.ma');
