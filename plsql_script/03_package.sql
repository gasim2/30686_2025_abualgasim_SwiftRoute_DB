-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 7: Create Package
-- ============================================

-- Package Specification
CREATE OR REPLACE PACKAGE courier_pkg AS
    FUNCTION calc_fee(p_weight_kg IN NUMBER, p_distance_km IN NUMBER) RETURN NUMBER;
    FUNCTION check_holiday(p_date IN DATE) RETURN NUMBER;
    PROCEDURE register_package(p_sender_id IN NUMBER, p_receiver_id IN NUMBER,
                               p_weight_kg IN NUMBER, p_description IN VARCHAR2, p_package_id OUT NUMBER);
    PROCEDURE assign_delivery(p_package_id IN NUMBER, p_driver_id IN NUMBER,
                              p_vehicle_id IN NUMBER, p_route_id IN NUMBER);
    PROCEDURE update_status(p_delivery_id IN NUMBER, p_new_status IN VARCHAR2);
END courier_pkg;
/

-- Package Body
CREATE OR REPLACE PACKAGE BODY courier_pkg AS

    FUNCTION calc_fee(p_weight_kg IN NUMBER, p_distance_km IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN calc_delivery_fee(p_weight_kg, p_distance_km);
    END calc_fee;

    FUNCTION check_holiday(p_date IN DATE) RETURN NUMBER IS
    BEGIN
        RETURN is_holiday(p_date);
    END check_holiday;

    PROCEDURE register_package(p_sender_id IN NUMBER, p_receiver_id IN NUMBER,
                               p_weight_kg IN NUMBER, p_description IN VARCHAR2, p_package_id OUT NUMBER) IS
    BEGIN
        register_package(p_sender_id, p_receiver_id, p_weight_kg, p_description, p_package_id);
    END register_package;

    PROCEDURE assign_delivery(p_package_id IN NUMBER, p_driver_id IN NUMBER,
                              p_vehicle_id IN NUMBER, p_route_id IN NUMBER) IS
    BEGIN
        assign_delivery(p_package_id, p_driver_id, p_vehicle_id, p_route_id);
    END assign_delivery;

    PROCEDURE update_status(p_delivery_id IN NUMBER, p_new_status IN VARCHAR2) IS
    BEGIN
        update_delivery_status(p_delivery_id, p_new_status);
    END update_status;

END courier_pkg;
/
