-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 3: Create Tables
-- ============================================

CREATE TABLE customer (
    customer_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR2(100) NOT NULL,
    phone         VARCHAR2(20)  NOT NULL UNIQUE,
    email         VARCHAR2(100),
    address       VARCHAR2(200),
    order_role    VARCHAR2(20) DEFAULT 'Sender' CHECK (order_role IN ('Sender','Receiver')),
    created_date  DATE DEFAULT SYSDATE
);

CREATE TABLE driver (
    driver_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR2(100) NOT NULL,
    phone         VARCHAR2(20)  NOT NULL UNIQUE,
    license_no    VARCHAR2(50)  NOT NULL UNIQUE,
    plate_no      VARCHAR2(20),
    is_available  NUMBER(1) DEFAULT 1 CHECK (is_available IN (0,1)),
    created_date  DATE DEFAULT SYSDATE,
    CONSTRAINT fk_driver_vehicle FOREIGN KEY (plate_no) REFERENCES vehicle(plate_no)
);

CREATE TABLE vehicle (
    vehicle_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plate_no      VARCHAR2(20)  NOT NULL UNIQUE,
    vehicle_type  VARCHAR2(50)  NOT NULL,
    capacity_kg   NUMBER(6,2)   NOT NULL CHECK (capacity_kg > 0),
    status        VARCHAR2(20) DEFAULT 'Active' CHECK (status IN ('Active','Maintenance','Retired'))
);

CREATE TABLE route (
    route_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_name      VARCHAR2(100) NOT NULL,
    origin          VARCHAR2(100) NOT NULL,
    destination     VARCHAR2(100) NOT NULL,
    est_distance_km NUMBER(6,2) CHECK (est_distance_km > 0)
);

CREATE TABLE package (
    package_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    package_code VARCHAR2(10) UNIQUE NOT NULL,
    sender_id    NUMBER NOT NULL,
    receiver_id  NUMBER NOT NULL,
    weight_kg    NUMBER(6,2)  NOT NULL CHECK (weight_kg > 0),
    description  VARCHAR2(200),
    status       VARCHAR2(20) DEFAULT 'Pending'
                   CHECK (status IN ('Pending','Assigned','In Transit','Delivered','Returned')),
    created_date DATE DEFAULT SYSDATE,
    CONSTRAINT fk_pkg_sender   FOREIGN KEY (sender_id)   REFERENCES customer(customer_id),
    CONSTRAINT fk_pkg_receiver FOREIGN KEY (receiver_id) REFERENCES customer(customer_id)
);

CREATE TABLE delivery (
    delivery_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    package_id      NUMBER NOT NULL UNIQUE,
    driver_id       NUMBER NOT NULL,
    vehicle_id      NUMBER NOT NULL,
    route_id        NUMBER NOT NULL,
    assigned_date   DATE DEFAULT SYSDATE,
    delivered_date  DATE,
    delivery_status VARCHAR2(20) DEFAULT 'Assigned'
                      CHECK (delivery_status IN ('Assigned','Picked Up','In Transit','Delivered','Failed')),
    CONSTRAINT fk_del_package FOREIGN KEY (package_id) REFERENCES package(package_id),
    CONSTRAINT fk_del_driver  FOREIGN KEY (driver_id)  REFERENCES driver(driver_id),
    CONSTRAINT fk_del_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id),
    CONSTRAINT fk_del_route   FOREIGN KEY (route_id)   REFERENCES route(route_id)
);

CREATE TABLE payment (
    payment_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    package_id     NUMBER NOT NULL UNIQUE,
    amount         NUMBER(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR2(20) CHECK (payment_method IN ('Cash','Mobile Money','Card','Bank Transfer')),
    payment_date   DATE DEFAULT SYSDATE,
    is_paid        NUMBER(1) DEFAULT 0 CHECK (is_paid IN (0,1)),
    CONSTRAINT fk_pay_package FOREIGN KEY (package_id) REFERENCES package(package_id)
);

CREATE TABLE holiday (
    holiday_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    holiday_name VARCHAR2(100) NOT NULL,
    holiday_date DATE NOT NULL UNIQUE
);

CREATE TABLE audit_log (
    log_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name    VARCHAR2(50)  NOT NULL,
    operation     VARCHAR2(10)  NOT NULL,
    old_value     CLOB,
    new_value     CLOB,
    changed_by    VARCHAR2(50)  DEFAULT SYS_CONTEXT('USERENV','SESSION_USER'),
    changed_date  DATE DEFAULT SYSDATE
);
