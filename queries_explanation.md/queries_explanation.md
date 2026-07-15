# Queries Explanation

## 30686_2025_abualgasim_Project_DB

---

## 1. Delivery Dashboard View (`V_DELIVERY_DASHBOARD`)

**File:** `sql_scripts/04_create_view.sql`

**Purpose:** Joins all major tables (delivery, package, driver, vehicle, route, payment, customer) into a single flat view for easy reporting and dashboard consumption.

**Key Columns:**
- `delivery_id`, `package_id` — identifiers
- `driver_name`, `plate_no`, `vehicle_type` — assigned resources
- `route_name`, `origin`, `destination`, `est_distance_km` — route details
- `delivery_fee`, `is_paid` — payment info
- `assigned_date`, `delivered_date`, `delivery_days` — timing
- `sender_name`, `receiver_name` — customer info

**Use Case:** Primary data source for Power BI dashboards and all analytics queries.

---

## 2. Overall KPI Summary

**Purpose:** Provides total deliveries, completion rate, total revenue, and average delivery time in a single row.

**Use Case:** Executive dashboard card visuals.

---

## 3. Driver Performance Query

**Purpose:** Aggregates deliveries per driver, calculates success rate (percentage of completed deliveries), and total fees generated.

**Key Metric:** `success_rate_pct` — helps identify top-performing drivers.

**Use Case:** Driver leaderboard bar chart.

---

## 4. Revenue by Route

**Purpose:** Groups total revenue by delivery route, showing which routes are most profitable. Includes average fee per delivery.

**Key Metric:** `total_revenue` — identifies most profitable routes.

**Use Case:** Route optimization decisions.

---

## 5. Vehicle Utilization Query

**Purpose:** Shows how many trips each vehicle has completed, total weight carried, and average weight per trip.

**Key Metric:** `total_trips` — helps with fleet management.

**Use Case:** Vehicle maintenance scheduling and capacity planning.

---

## 6. Payment Collection Summary

**Purpose:** Breaks down payments by method (Cash, Mobile Money, Card, Bank Transfer), showing total collected vs outstanding amounts.

**Key Metric:** `collection_rate_pct` — percentage of payments collected.

**Use Case:** Financial reporting dashboard.

---

## 7. Daily Delivery Trend

**Purpose:** Tracks packages assigned and delivered per day with daily revenue.

**Key Metric:** Daily delivery count and revenue.

**Use Case:** Line chart for trend analysis and peak period identification.

---

## 8. Performance Report Procedure

**File:** `plsql_scripts/02_procedures.sql`

**Purpose:** A PL/SQL procedure that outputs a formatted KPI report to the console, including total deliveries, completion rate, total revenue, and a driver leaderboard.

**Use Case:** Live demonstration during presentation.

---

## 9. Pending Deliveries Query

**File:** `plsql_scripts/02_procedures.sql`

**Purpose:** Uses an explicit cursor to iterate through all undelivered packages and print their details.

**Use Case:** Operational dashboard for dispatchers.

---

## 10. Fee Calculation Function

**File:** `plsql_scripts/01_functions.sql`

**Purpose:** Calculates delivery fee using the formula: `500 + (weight_kg * 200) + (distance_km * 150)` RWF.

**Use Case:** Automatic fee calculation during package registration.

---

## 11. Holiday Check Function

**File:** `plsql_scripts/01_functions.sql`

**Purpose:** Checks the `holiday` table to determine if a given date is a public holiday. Returns 1 (holiday) or 0 (not holiday).

**Use Case:** Used by security triggers to block DML on holidays.
