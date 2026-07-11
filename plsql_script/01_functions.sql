-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 5: Create Functions
-- ============================================

-- Function 1: Calculate delivery fee based on weight and distance
CREATE OR REPLACE FUNCTION calc_delivery_fee(
    p_weight_kg   IN NUMBER,
    p_distance_km IN NUMBER
) RETURN NUMBER IS
    v_fee NUMBER;
BEGIN
    -- Base fee: 500 RWF + 200 RWF per kg + 150 RWF per km
    v_fee := 500 + (p_weight_kg * 200) + (p_distance_km * 150);
    RETURN ROUND(v_fee, 0);
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20010, 'Error calculating fee: ' || SQLERRM);
END;
/

-- Function 2: Check if a date is a public holiday
CREATE OR REPLACE FUNCTION is_holiday(p_date IN DATE) RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM   holiday
    WHERE  holiday_date = TRUNC(p_date);
    RETURN CASE WHEN v_count > 0 THEN 1 ELSE 0 END;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/
