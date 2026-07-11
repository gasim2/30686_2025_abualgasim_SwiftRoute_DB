-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 8: Create Triggers
-- ============================================

-- Trigger 1: Block DML on package table during weekdays and holidays
CREATE OR REPLACE TRIGGER trg_block_dml_offdays
BEFORE INSERT OR UPDATE OR DELETE ON package
FOR EACH STATEMENT
DECLARE
    v_day VARCHAR2(10);
BEGIN
    v_day := TRIM(TO_CHAR(TRUNC(SYSDATE), 'DAY'));
    IF v_day IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY') THEN
        RAISE_APPLICATION_ERROR(-20100, 'DML blocked on weekdays.');
    END IF;
    IF is_holiday(TRUNC(SYSDATE)) = 1 THEN
        RAISE_APPLICATION_ERROR(-20101, 'DML blocked on holidays.');
    END IF;
END;
/

-- Trigger 2: Block DML on delivery table during weekdays and holidays
CREATE OR REPLACE TRIGGER trg_block_delivery_offdays
BEFORE INSERT OR UPDATE OR DELETE ON delivery
FOR EACH STATEMENT
DECLARE
    v_day VARCHAR2(10);
BEGIN
    v_day := TRIM(TO_CHAR(TRUNC(SYSDATE), 'DAY'));
    IF v_day IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY') THEN
        RAISE_APPLICATION_ERROR(-20102, 'DML blocked on weekdays.');
    END IF;
    IF is_holiday(TRUNC(SYSDATE)) = 1 THEN
        RAISE_APPLICATION_ERROR(-20103, 'DML blocked on holidays.');
    END IF;
END;
/

-- Trigger 3: Audit all package changes
CREATE OR REPLACE TRIGGER trg_audit_package
AFTER INSERT OR UPDATE OR DELETE ON package
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO audit_log (table_name, operation, new_value)
        VALUES ('PACKAGE', 'INSERT', 'ID:' || :NEW.package_id || ' Status:' || :NEW.status);
    ELSIF UPDATING THEN
        INSERT INTO audit_log (table_name, operation, old_value, new_value)
        VALUES ('PACKAGE', 'UPDATE', 'Status:' || :OLD.status, 'Status:' || :NEW.status);
    ELSIF DELETING THEN
        INSERT INTO audit_log (table_name, operation, old_value)
        VALUES ('PACKAGE', 'DELETE', 'ID:' || :OLD.package_id);
    END IF;
END;
/

-- Trigger 4: Audit delivery status changes (conditional)
CREATE OR REPLACE TRIGGER trg_audit_delivery
AFTER UPDATE ON delivery
FOR EACH ROW
WHEN (OLD.delivery_status != NEW.delivery_status)
BEGIN
    INSERT INTO audit_log (table_name, operation, old_value, new_value)
    VALUES ('DELIVERY', 'STATUS_CHANGE',
            'Delivery#' || :OLD.delivery_id || ' Status:' || :OLD.delivery_status,
            'Delivery#' || :NEW.delivery_id || ' Status:' || :NEW.delivery_status);
END;
/

-- Trigger 5: Auto-set package created_date
CREATE OR REPLACE TRIGGER trg_package_created_date
BEFORE INSERT ON package
FOR EACH ROW
BEGIN
    IF :NEW.created_date IS NULL THEN
        :NEW.created_date := SYSDATE;
    END IF;
END;
/
