# Problem Statement

## Project Title
Swift Route Courier Logistics & Package Delivery Guard System

## Student Information
- **Name:** Abualgasim
- **Student ID:** 30686/2025
- **Course:** DPR400210 – Database Programming
- **University:** University of Lay Adventists of Kigali (UNILAK)
- **Instructor:** Eric Maniraguha
- **Academic Year:** 2025-2026

---

## Problem Definition

Rwanda's courier and package delivery industry is experiencing rapid growth driven by e-commerce expansion and urban development. However, most courier companies in Kigali still rely on manual dispatch systems, paper-based tracking, and informal communication channels (phone calls, WhatsApp). This leads to delayed deliveries, lost packages, lack of real-time visibility, and poor customer satisfaction. There is no centralized system to manage drivers, vehicles, packages, routes, and delivery confirmation in an integrated manner.

This project addresses the need for a digital courier logistics and package delivery management system that centralizes all operations — from package intake to final delivery confirmation — within a secure Oracle database. The system tracks packages through every stage, assigns drivers and vehicles efficiently, enforces business rules via PL/SQL triggers (blocking operations on weekdays and public holidays), maintains a full audit trail, and provides dashboard-ready data for management decision-making.

---

## Context of Use

The system is designed for a courier logistics company operating in Kigali, Rwanda, handling same-day and next-day parcel deliveries for individual and business customers.

---

## Target Users

| User Role | Description |
|---|---|
| Admin | System manager; controls users, drivers, vehicles, and system settings |
| Dispatcher | Assigns packages to drivers and routes |
| Driver | Receives deliveries, updates status, confirms delivery |
| Customer | Sends/receives packages, tracks delivery status |

---

## Project Objectives

1. Centralize package, driver, vehicle, and route data in a normalized Oracle database
2. Automate delivery assignment and status tracking via PL/SQL procedures
3. Enforce business rules using triggers (block DML on weekdays and holidays)
4. Implement an audit log for all critical database operations
5. Provide dashboard-ready queries for delivery performance analytics

---

## Expected Benefits

- Real-time package tracking and status visibility
- Reduced delivery delays through efficient driver/vehicle assignment
- Full accountability via audit trails
- Data-driven decisions via analytics queries
- Enforced operational security (no modifications on off-days)
