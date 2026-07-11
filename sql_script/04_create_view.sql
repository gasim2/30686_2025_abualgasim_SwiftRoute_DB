-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 9: Create View
-- ============================================

CREATE OR REPLACE VIEW v_delivery_dashboard AS
SELECT d.delivery_id, p.package_id, p.weight_kg, p.status AS package_status,
       d.delivery_status, dr.full_name AS driver_name, v.plate_no, v.vehicle_type,
       r.route_name, r.origin, r.destination, r.est_distance_km,
       pay.amount AS delivery_fee, pay.is_paid,
       d.assigned_date, d.delivered_date,
       CASE WHEN d.delivered_date IS NOT NULL
            THEN ROUND(d.delivered_date - d.assigned_date, 1)
            ELSE NULL END AS delivery_days,
       c1.full_name AS sender_name, c2.full_name AS receiver_name
FROM   delivery d
JOIN   package  p   ON d.package_id  = p.package_id
JOIN   driver  dr   ON d.driver_id   = dr.driver_id
JOIN   vehicle  v   ON d.vehicle_id  = v.vehicle_id
JOIN   route    r   ON d.route_id    = r.route_id
JOIN   payment pay  ON p.package_id  = pay.package_id
JOIN   customer c1  ON p.sender_id   = c1.customer_id
JOIN   customer c2  ON p.receiver_id = c2.customer_id;
/
