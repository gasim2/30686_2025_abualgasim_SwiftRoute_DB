-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 4: Insert Sample Data
-- ============================================

-- Customers
INSERT INTO customer (full_name, phone, email, address) VALUES ('Jean Mugabo',     '+250788100200', 'jean@email.com',   'Kimironko, Kigali');
INSERT INTO customer (full_name, phone, email, address) VALUES ('Alice Uwimana',   '+250788100300', 'alice@email.com',  'Nyamirambo, Kigali');
INSERT INTO customer (full_name, phone, email, address) VALUES ('David Niyonzima', '+250788100400', 'david@email.com',  'Gisozi, Kigali');

-- Drivers
INSERT INTO driver (full_name, phone, license_no) VALUES ('Patrick Habimana',  '+250791200100', 'RWA-LIC-001');
INSERT INTO driver (full_name, phone, license_no) VALUES ('Claude Iradukunda', '+250791200200', 'RWA-LIC-002');

-- Vehicles
INSERT INTO vehicle (plate_no, vehicle_type, capacity_kg) VALUES ('RAB 123A', 'Motorcycle', 50.00);
INSERT INTO vehicle (plate_no, vehicle_type, capacity_kg) VALUES ('RAC 456B', 'Van',       500.00);

-- Routes
INSERT INTO route (route_name, origin, destination, est_distance_km) VALUES ('City Center Express', 'Kimironko', 'Nyamirambo', 8.50);
INSERT INTO route (route_name, origin, destination, est_distance_km) VALUES ('Airport Run',        'Gisozi',     'Airport',   12.00);

-- Packages
INSERT INTO package (sender_id, receiver_id, weight_kg, description, status) VALUES (1, 2, 2.50,  'Documents envelope', 'Pending');
INSERT INTO package (sender_id, receiver_id, weight_kg, description, status) VALUES (3, 1, 15.00, 'Electronics box',    'Pending');

-- Deliveries
INSERT INTO delivery (package_id, driver_id, vehicle_id, route_id, delivery_status) VALUES (1, 1, 1, 1, 'Assigned');
INSERT INTO delivery (package_id, driver_id, vehicle_id, route_id, delivery_status) VALUES (2, 2, 2, 2, 'Assigned');

-- Payments
INSERT INTO payment (package_id, amount, payment_method, is_paid) VALUES (1,  2500.00, 'Mobile Money', 1);
INSERT INTO payment (package_id, amount, payment_method, is_paid) VALUES (2, 10000.00, 'Cash',         0);

-- Holidays (Rwanda public holidays 2026)
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('New Year Day',          TO_DATE('01-01-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Heroes Day',            TO_DATE('01-02-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Good Friday',           TO_DATE('03-04-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Easter Monday',         TO_DATE('06-04-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Genocide Memorial Day', TO_DATE('07-04-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Labour Day',            TO_DATE('01-05-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Independence Day',      TO_DATE('01-07-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Liberation Day',        TO_DATE('04-07-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Umuganura Day',         TO_DATE('15-08-2026','DD-MM-YYYY'));
INSERT INTO holiday (holiday_name, holiday_date) VALUES ('Christmas Day',         TO_DATE('25-12-2026','DD-MM-YYYY'));

COMMIT;
