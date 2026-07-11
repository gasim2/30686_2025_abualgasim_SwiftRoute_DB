-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 6: Create Procedures
-- ============================================

-- Procedure 1: Register a new package
CREATE OR REPLACE PROCEDURE register_package(
    p_sender_id   IN NUMBER,
    p_receiver_id IN NUMBER,
    p_weight_kg   IN NUMBER,
    p_description IN VARCHAR2,
    p_package_id  OUT NUMBER
) IS
BEGIN
    INSERT INTO package (sender_id, receiver_id, weight_kg, description, status)
    VALUES (p_sender_id, p_receiver_id, p_weight_kg, p_description, 'Pending')
    RETURNING package_id INTO p_package_id;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Package registered. ID: ' || p_package_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20020, 'Error registering package: ' || SQLERRM);
END;
/

-- Procedure 2: Assign delivery to driver/vehicle/route
CREATE OR REPLACE PROCEDURE assign_delivery(
    p_package_id IN NUMBER,
    p_driver_id  IN NUMBER,
    p_vehicle_id IN NUMBER,
    p_route_id   IN NUMBER
) IS
    v_status VARCHAR2(20);
    v_fee    NUMBER;
    v_dist   NUMBER;
    v_weight NUMBER;
BEGIN
    SELECT status INTO v_status FROM package WHERE package_id = p_package_id;
    IF v_status != 'Pending' THEN
        RAISE_APPLICATION_ERROR(-20030, 'Package not Pending. Status: ' || v_status);
    END IF;

    SELECT est_distance_km INTO v_dist FROM route WHERE route_id = p_route_id;
    SELECT weight_kg INTO v_weight FROM package WHERE package_id = p_package_id;
    v_fee := calc_delivery_fee(v_weight, v_dist);

    INSERT INTO delivery (package_id, driver_id, vehicle_id, route_id, delivery_status)
    VALUES (p_package_id, p_driver_id, p_vehicle_id, p_route_id, 'Assigned');

    UPDATE package SET status = 'Assigned' WHERE package_id = p_package_id;

    INSERT INTO payment (package_id, amount, payment_method, is_paid)
    VALUES (p_package_id, v_fee, 'Cash', 0);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Delivery assigned. Pkg: ' || p_package_id || ' | Fee: ' || v_fee || ' RWF');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20031, 'Invalid package_id or route_id.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20032, 'Error: ' || SQLERRM);
END;
/

-- Procedure 3: Update delivery status
CREATE OR REPLACE PROCEDURE update_delivery_status(
    p_delivery_id IN NUMBER,
    p_new_status  IN VARCHAR2
) IS
    v_pkg_id NUMBER;
BEGIN
    UPDATE delivery
    SET    delivery_status = p_new_status,
           delivered_date  = CASE WHEN p_new_status = 'Delivered' THEN SYSDATE ELSE delivered_date END
    WHERE  delivery_id = p_delivery_id
    RETURNING package_id INTO v_pkg_id;

    UPDATE package SET status = p_new_status WHERE package_id = v_pkg_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Delivery ' || p_delivery_id || ' updated to ' || p_new_status);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20040, 'Error: ' || SQLERRM);
END;
/

-- Procedure 4: List pending deliveries using cursor
CREATE OR REPLACE PROCEDURE list_pending_deliveries IS
    CURSOR c_pending IS
        SELECT d.delivery_id, p.package_id, p.weight_kg,
               dr.full_name AS driver_name, v.plate_no, r.route_name
        FROM   delivery d
        JOIN   package  p ON d.package_id = p.package_id
        JOIN   driver  dr ON d.driver_id  = dr.driver_id
        JOIN   vehicle  v ON d.vehicle_id = v.vehicle_id
        JOIN   route    r ON d.route_id   = r.route_id
        WHERE  d.delivery_status != 'Delivered';
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- Pending Deliveries ---');
    FOR rec IN c_pending LOOP
        DBMS_OUTPUT.PUT_LINE('Delivery#' || rec.delivery_id || ' | Pkg#' || rec.package_id ||
                             ' | ' || rec.driver_name || ' | ' || rec.plate_no || ' | ' || rec.route_name);
    END LOOP;
END;
/

-- Procedure 5: Generate performance report
CREATE OR REPLACE PROCEDURE generate_performance_report IS
    v_total     NUMBER;
    v_completed NUMBER;
    v_revenue   NUMBER;
BEGIN
    SELECT COUNT(*),
           SUM(CASE WHEN delivery_status = 'Delivered' THEN 1 ELSE 0 END),
           SUM(amount)
    INTO   v_total, v_completed, v_revenue
    FROM   v_delivery_dashboard;

    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('  SWIFT ROUTE - PERFORMANCE REPORT');
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('Date           : ' || TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI'));
    DBMS_OUTPUT.PUT_LINE('----------------------------------------');
    DBMS_OUTPUT.PUT_LINE('Total Deliveries : ' || v_total);
    DBMS_OUTPUT.PUT_LINE('Completed        : ' || v_completed);
    DBMS_OUTPUT.PUT_LINE('Pending          : ' || (v_total - v_completed));
    DBMS_OUTPUT.PUT_LINE('Completion Rate  : ' || ROUND(v_completed / v_total * 100, 1) || '%');
    DBMS_OUTPUT.PUT_LINE('Total Revenue    : ' || v_revenue || ' RWF');
    DBMS_OUTPUT.PUT_LINE('========================================');
END;
/
