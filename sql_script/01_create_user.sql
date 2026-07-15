-- ============================================
-- 30686_2025_abualgasim_Project_DB
-- Block 1: Create Oracle User
-- ============================================

CREATE USER c##abualgasim IDENTIFIED BY SwiftRoute2025;
GRANT CONNECT, RESOURCE TO c##abualgasim;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE TRIGGER TO c##abualgasim;
ALTER USER c##abualgasim QUOTA UNLIMITED ON USERS;
