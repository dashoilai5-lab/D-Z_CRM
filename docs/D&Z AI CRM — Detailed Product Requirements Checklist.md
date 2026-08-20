# D&Z AI CRM — Detailed Product Requirements Checklist

**Document:** `requirements.md`\
**Product:** D&Z AI CRM\
**Product Type:** AI-native CRM + Dealer Management + Workshop Management + Customer Retention Platform\
**Primary Industry:** Motorcycle dealers, motorcycle workshops/service centers, parts shops, multi-branch dealer networks\
**Requirement Priority:** All requirements in this document are **MUST requirements** unless explicitly stated otherwise.

---

# 1. Product Vision

D&Z AI CRM must provide a single operating system for motorcycle dealers, service centers, workshops, parts retailers, and multi-branch dealer networks.

The platform must allow a business to:

- Capture enquiries.
- Convert enquiries into customers.
- Record customers and motorcycles.
- Schedule test rides.
- Schedule service appointments.
- Operate workshop jobs.
- Track technicians.
- Maintain motorcycle service history.
- Manage parts inventory.
- Communicate with customers.
- Automate reminders and follow-ups.
- Operate customer loyalty programs.
- Measure revenue, leads, bookings, retention, and branch performance.
- Centralize operations across multiple locations.
- Use AI to reduce manual administrative work.

---

# 2. Core Platform Architecture

## 2.1 SaaS / Tenant Architecture

- [ ] `PLT-001` System must support multiple independent dealer organizations.
- [ ] `PLT-002` Each dealer organization must operate as an isolated tenant.
- [ ] `PLT-003` Data belonging to one tenant must never be visible to another tenant.
- [ ] `PLT-004` Each tenant must support one or multiple branches.
- [ ] `PLT-005` Tenant administrators must be able to configure business name, logo, address, contact information, tax information, timezone, currency, and operating hours.
- [ ] `PLT-006` Tenant must support Malaysia as a primary market.
- [ ] `PLT-007` Currency configuration must support MYR.
- [ ] `PLT-008` Platform architecture must allow additional currencies.
- [ ] `PLT-009` Platform must support organization-level configuration.
- [ ] `PLT-010` Platform must support branch-level configuration.
- [ ] `PLT-011` Platform must support centralized head-office administration.
- [ ] `PLT-012` Platform must support branch-specific users.
- [ ] `PLT-013` Platform must maintain a unique tenant ID for every organization.
- [ ] `PLT-014` Platform must maintain a unique branch ID for every branch.
- [ ] `PLT-015` All customer, lead, appointment, transaction, job, and inventory records must identify their tenant.
- [ ] `PLT-016` Branch-dependent records must additionally identify their branch.

---

# 3. Authentication and User Management

## 3.1 Authentication

- [ ] `AUTH-001` Users must authenticate before accessing internal CRM functionality.
- [ ] `AUTH-002` System must support email/password authentication.
- [ ] `AUTH-003` Passwords must never be stored in plaintext.
- [ ] `AUTH-004` System must support secure password reset.
- [ ] `AUTH-005` System must support email verification.
- [ ] `AUTH-006` System must support user session expiration.
- [ ] `AUTH-007` System must support forced logout.
- [ ] `AUTH-008` System must support administrator disabling of user accounts.
- [ ] `AUTH-009` System must prevent disabled users from logging in.
- [ ] `AUTH-010` System must support multi-factor authentication for administrators.
- [ ] `AUTH-011` Authentication events must be logged.
- [ ] `AUTH-012` Failed login attempts must be logged.
- [ ] `AUTH-013` Platform must apply protection against brute-force authentication attacks.

## 3.2 Required User Roles

- [ ] `ROLE-001` Super Admin.
- [ ] `ROLE-002` Dealer Owner.
- [ ] `ROLE-003` Head Office Administrator.
- [ ] `ROLE-004` Branch Manager.
- [ ] `ROLE-005` Sales Manager.
- [ ] `ROLE-006` Sales Advisor.
- [ ] `ROLE-007` Service Manager.
- [ ] `ROLE-008` Service Advisor.
- [ ] `ROLE-009` Technician.
- [ ] `ROLE-010` Parts Manager.
- [ ] `ROLE-011` Parts Staff.
- [ ] `ROLE-012` Marketing User.
- [ ] `ROLE-013` Customer Service User.
- [ ] `ROLE-014` Finance/Reporting User.
- [ ] `ROLE-015` Read-Only/Auditor User.

## 3.3 Role-Based Access Control

- [ ] `RBAC-001` Permissions must be role-based.
- [ ] `RBAC-002` Administrators must be able to create custom roles.
- [ ] `RBAC-003` Roles must support module-level permissions.
- [ ] `RBAC-004` Roles must support view permission.
- [ ] `RBAC-005` Roles must support create permission.
- [ ] `RBAC-006` Roles must support edit permission.
- [ ] `RBAC-007` Roles must support delete permission.
- [ ] `RBAC-008` Roles must support export permission.
- [ ] `RBAC-009` Roles must support financial data visibility restrictions.
- [ ] `RBAC-010` Roles must support branch-level access restrictions.
- [ ] `RBAC-011` Head office users must optionally see all branches.
- [ ] `RBAC-012` Branch users must optionally be limited to their assigned branch.
- [ ] `RBAC-013` Technicians must only access workshop information relevant to their responsibilities unless granted additional permissions.
- [ ] `RBAC-014` Every privileged operation must be auditable.

---

# 4. Main Dashboard

- [ ] `DASH-001` System must provide a dashboard immediately after login.
- [ ] `DASH-002` Dashboard must show total leads.
- [ ] `DASH-003` Dashboard must show new leads.
- [ ] `DASH-004` Dashboard must show appointments/bookings.
- [ ] `DASH-005` Dashboard must show service bookings.
- [ ] `DASH-006` Dashboard must show estimated or recorded revenue.
- [ ] `DASH-007` Dashboard must show repeat customer percentage.
- [ ] `DASH-008` Dashboard must show outstanding follow-up tasks.
- [ ] `DASH-009` Dashboard must show upcoming appointments.
- [ ] `DASH-010` Dashboard must show recent customer activity.
- [ ] `DASH-011` Dashboard must show lead source performance.
- [ ] `DASH-012` Dashboard must show lead conversion trend.
- [ ] `DASH-013` Dashboard must show booking trend.
- [ ] `DASH-014` Dashboard must allow configurable date ranges.
- [ ] `DASH-015` Dashboard must support today.
- [ ] `DASH-016` Dashboard must support yesterday comparison.
- [ ] `DASH-017` Dashboard must support last 7 days.
- [ ] `DASH-018` Dashboard must support last 30 days.
- [ ] `DASH-019` Dashboard must support current month.
- [ ] `DASH-020` Dashboard must support custom date range.
- [ ] `DASH-021` Dashboard metrics must respect the user's branch permissions.
- [ ] `DASH-022` Head office dashboard must aggregate multiple branches.
- [ ] `DASH-023` Dashboard data must link to the underlying records.

---

# 5. Smart Dealer Website

## 5.1 Website Management

- [ ] `WEB-001` Each dealer must be able to operate a customer-facing website.
- [ ] `WEB-002` Website must be mobile responsive.
- [ ] `WEB-003` Website must work on desktop.
- [ ] `WEB-004` Website must work on tablet.
- [ ] `WEB-005` Website must allow dealer branding.
- [ ] `WEB-006` Website must allow custom dealer logo.
- [ ] `WEB-007` Website must allow dealer contact information.
- [ ] `WEB-008` Website must display branch information.
- [ ] `WEB-009` Website must display business operating hours.
- [ ] `WEB-010` Website must support enquiry forms.
- [ ] `WEB-011` Website must support service booking forms.
- [ ] `WEB-012` Website must support test ride booking forms.
- [ ] `WEB-013` Website must provide WhatsApp contact functionality.
- [ ] `WEB-014` Website submissions must enter the CRM automatically.
- [ ] `WEB-015` Staff must not need to manually re-enter website enquiries.

## 5.2 Motorcycle Catalogue

- [ ] `WEB-016` Website must support motorcycle catalogue pages.
- [ ] `WEB-017` Catalogue must support motorcycle make.
- [ ] `WEB-018` Catalogue must support model.
- [ ] `WEB-019` Catalogue must support variant.
- [ ] `WEB-020` Catalogue must support price.
- [ ] `WEB-021` Catalogue must support product images.
- [ ] `WEB-022` Catalogue must support specifications.
- [ ] `WEB-023` Catalogue must support availability/status.
- [ ] `WEB-024` Catalogue enquiry must identify the motorcycle the prospect is interested in.

---

# 6. Lead Capture

- [ ] `LEAD-001` Every website enquiry must create a CRM lead.
- [ ] `LEAD-002` WhatsApp enquiries must be recordable as leads.
- [ ] `LEAD-003` Walk-in enquiries must be recordable manually.
- [ ] `LEAD-004` Phone enquiries must be recordable manually.
- [ ] `LEAD-005` Social media leads must be importable.
- [ ] `LEAD-006` Leads must contain a unique lead ID.
- [ ] `LEAD-007` Leads must record creation date/time.
- [ ] `LEAD-008` Leads must record customer name.
- [ ] `LEAD-009` Leads must record phone number.
- [ ] `LEAD-010` Leads must optionally record email.
- [ ] `LEAD-011` Leads must record lead source.
- [ ] `LEAD-012` Leads must record branch.
- [ ] `LEAD-013` Leads must record motorcycle interest.
- [ ] `LEAD-014` Leads must support free-text enquiry notes.
- [ ] `LEAD-015` Leads must support estimated deal value.
- [ ] `LEAD-016` Leads must support assigned salesperson.
- [ ] `LEAD-017` Leads must support next follow-up date.
- [ ] `LEAD-018` Leads must support next follow-up time.
- [ ] `LEAD-019` Leads must support tags.
- [ ] `LEAD-020` Leads must support attachments.
- [ ] `LEAD-021` System must detect likely duplicate leads using phone number and/or email.
- [ ] `LEAD-022` User must be warned before creating an obvious duplicate.

---

# 7. Sales Pipeline

The required standard sales pipeline must support:

**New Enquiry → Contacted → Qualified → Test Ride → Proposal → Closed Won / Closed Lost**

- [ ] `PIPE-001` System must provide Kanban-style lead pipeline.
- [ ] `PIPE-002` Leads must be movable between pipeline stages.
- [ ] `PIPE-003` Pipeline changes must be timestamped.
- [ ] `PIPE-004` Pipeline changes must record the user responsible.
- [ ] `PIPE-005` Pipeline must show number of leads in each stage.
- [ ] `PIPE-006` Pipeline must show estimated monetary value by stage.
- [ ] `PIPE-007` Pipeline must allow filtering by salesperson.
- [ ] `PIPE-008` Pipeline must allow filtering by branch.
- [ ] `PIPE-009` Pipeline must allow filtering by motorcycle model.
- [ ] `PIPE-010` Pipeline must allow filtering by lead source.
- [ ] `PIPE-011` Pipeline must allow filtering by date.
- [ ] `PIPE-012` Pipeline must support closed-lost reason.
- [ ] `PIPE-013` Closed-lost reasons must be configurable.
- [ ] `PIPE-014` System must report conversion rate between stages.
- [ ] `PIPE-015` System must calculate average time in stage.
- [ ] `PIPE-016` System must identify stale leads.
- [ ] `PIPE-017` Sales managers must be able to reassign leads.
- [ ] `PIPE-018` Salespeople must see their assigned leads.
- [ ] `PIPE-019` Lead history must remain available after conversion.
- [ ] `PIPE-020` Closed-won lead must be convertible into a customer record without duplicate data entry.

---

# 8. Sales Follow-Up Tasks

- [ ] `TASK-001` Users must create tasks against leads.
- [ ] `TASK-002` Users must create tasks against customers.
- [ ] `TASK-003` Users must create tasks against bookings.
- [ ] `TASK-004` Users must create tasks against vehicles.
- [ ] `TASK-005` Tasks must have an owner.
- [ ] `TASK-006` Tasks must have a due date.
- [ ] `TASK-007` Tasks must optionally have a due time.
- [ ] `TASK-008` Tasks must have status.
- [ ] `TASK-009` Required statuses must include Open.
- [ ] `TASK-010` Required statuses must include Completed.
- [ ] `TASK-011` Required statuses must include Overdue.
- [ ] `TASK-012` Tasks must support priority.
- [ ] `TASK-013` Tasks must support notes.
- [ ] `TASK-014` Staff must receive notification of due tasks.
- [ ] `TASK-015` Managers must see overdue tasks.
- [ ] `TASK-016` System must support automatic creation of follow-up tasks.
- [ ] `TASK-017` Completing a task must record timestamp and completing user.

---

# 9. Test Ride Management

- [ ] `TEST-001` Sales users must be able to schedule test rides.
- [ ] `TEST-002` Customer-facing website must support test ride requests.
- [ ] `TEST-003` Test ride must reference the lead/customer.
- [ ] `TEST-004` Test ride must reference motorcycle model.
- [ ] `TEST-005` Test ride must reference branch.
- [ ] `TEST-006` Test ride must record date.
- [ ] `TEST-007` Test ride must record time.
- [ ] `TEST-008` Test ride must record assigned salesperson.
- [ ] `TEST-009` Test ride must support Pending status.
- [ ] `TEST-010` Test ride must support Confirmed status.
- [ ] `TEST-011` Test ride must support Completed status.
- [ ] `TEST-012` Test ride must support Cancelled status.
- [ ] `TEST-013` Test ride must support No Show status.
- [ ] `TEST-014` Test ride completion must update customer timeline.
- [ ] `TEST-015` Test ride completion must trigger sales follow-up workflow.

---

# 10. Customer CRM

## 10.1 Customer Profiles

- [ ] `CRM-001` Every customer must have a unique customer ID.
- [ ] `CRM-002` Customer profile must contain full name.
- [ ] `CRM-003` Customer profile must contain phone number.
- [ ] `CRM-004` Customer profile must optionally contain email.
- [ ] `CRM-005` Customer profile must optionally contain address.
- [ ] `CRM-006` Customer profile must record preferred branch.
- [ ] `CRM-007` Customer profile must record creation date.
- [ ] `CRM-008` Customer profile must show total visits.
- [ ] `CRM-009` Customer profile must show lifetime spend when revenue data exists.
- [ ] `CRM-010` Customer profile must show registered vehicles.
- [ ] `CRM-011` Customer profile must show leads.
- [ ] `CRM-012` Customer profile must show sales history.
- [ ] `CRM-013` Customer profile must show service history.
- [ ] `CRM-014` Customer profile must show bookings.
- [ ] `CRM-015` Customer profile must show communication history.
- [ ] `CRM-016` Customer profile must show reminders.
- [ ] `CRM-017` Customer profile must show tasks.
- [ ] `CRM-018` Customer profile must show notes.
- [ ] `CRM-019` Customer profile must show loyalty status.
- [ ] `CRM-020` Customer profile must show loyalty points.
- [ ] `CRM-021` Customer profile must show referrals.
- [ ] `CRM-022` Staff must be able to add customer notes.
- [ ] `CRM-023` Notes must identify author.
- [ ] `CRM-024` Notes must record date and time.
- [ ] `CRM-025` Customer records must support tags.
- [ ] `CRM-026` Customer records must support document attachments.
- [ ] `CRM-027` Customer records must support marketing consent status.
- [ ] `CRM-028` Customer records must support communication preference.

---

# 11. Motorcycle / Vehicle Registry

- [ ] `VEH-001` A customer may own multiple motorcycles.
- [ ] `VEH-002` A motorcycle must belong to a customer or organization.
- [ ] `VEH-003` Motorcycle must have a unique vehicle ID.
- [ ] `VEH-004` Vehicle record must support manufacturer/make.
- [ ] `VEH-005` Vehicle record must support model.
- [ ] `VEH-006` Vehicle record must support variant.
- [ ] `VEH-007` Vehicle record must support registration number.
- [ ] `VEH-008` Vehicle record must support VIN/chassis number.
- [ ] `VEH-009` Vehicle record must support engine number.
- [ ] `VEH-010` Vehicle record must support model year.
- [ ] `VEH-011` Vehicle record must support purchase date.
- [ ] `VEH-012` Vehicle record must support current mileage.
- [ ] `VEH-013` Vehicle record must support warranty information.
- [ ] `VEH-014` Vehicle record must support notes.
- [ ] `VEH-015` Vehicle record must show complete service history.
- [ ] `VEH-016` Vehicle record must show previous mileage entries.
- [ ] `VEH-017` Vehicle record must show future recommended service date.
- [ ] `VEH-018` Vehicle record must show future recommended service mileage.
- [ ] `VEH-019` Vehicle record must support transfer to another customer with audit trail.
- [ ] `VEH-020` Historical ownership must not be silently destroyed.

---

# 12. Online Service Booking

## 12.1 Customer Booking Flow

- [ ] `BOOK-001` Customers must be able to request service appointments online.
- [ ] `BOOK-002` Booking must work on mobile.
- [ ] `BOOK-003` Customer must be able to choose motorcycle.
- [ ] `BOOK-004` Customer must be able to choose service type.
- [ ] `BOOK-005` Customer must be able to choose branch.
- [ ] `BOOK-006` Customer must be able to choose available date.
- [ ] `BOOK-007` Customer must be able to choose available time slot.
- [ ] `BOOK-008` System must prevent booking unavailable slots.
- [ ] `BOOK-009` Booking must create a CRM activity.
- [ ] `BOOK-010` Booking must appear in workshop/service calendar.
- [ ] `BOOK-011` Booking must generate confirmation.
- [ ] `BOOK-012` Confirmation must support WhatsApp.
- [ ] `BOOK-013` Confirmation must support SMS.
- [ ] `BOOK-014` Confirmation must support email where configured.
- [ ] `BOOK-015` Customer must receive booking date.
- [ ] `BOOK-016` Customer must receive booking time.
- [ ] `BOOK-017` Customer must receive branch information.
- [ ] `BOOK-018` Customer must receive motorcycle information.
- [ ] `BOOK-019` Customer must receive booking reference number.

## 12.2 Booking Administration

Required booking lifecycle:

**Requested → Confirmed → Checked In → In Service → Ready → Completed**

Additional outcomes:

**Cancelled / No Show**

- [ ] `BOOK-020` Staff must be able to create bookings manually.
- [ ] `BOOK-021` Staff must be able to reschedule bookings.
- [ ] `BOOK-022` Staff must be able to cancel bookings.
- [ ] `BOOK-023` Staff must be able to confirm bookings.
- [ ] `BOOK-024` Staff must be able to mark no-show.
- [ ] `BOOK-025` Booking changes must be recorded in activity history.
- [ ] `BOOK-026` Booking calendar must support daily view.
- [ ] `BOOK-027` Booking calendar must support weekly view.
- [ ] `BOOK-028` Booking calendar must support monthly view.
- [ ] `BOOK-029` Booking calendar must support branch filtering.
- [ ] `BOOK-030` Booking calendar must support technician/resource filtering where applicable.
- [ ] `BOOK-031` Administrators must configure available appointment slots.
- [ ] `BOOK-032` Administrators must configure operating days.
- [ ] `BOOK-033` Administrators must configure holidays/closure dates.
- [ ] `BOOK-034` Administrators must configure maximum appointments per slot.
- [ ] `BOOK-035` Booking system must prevent unintentional overbooking.

---

# 13. Workshop Operations

## 13.1 Workshop Dashboard

- [ ] `WS-001` Workshop dashboard must show today's total jobs.
- [ ] `WS-002` Dashboard must show jobs in progress.
- [ ] `WS-003` Dashboard must show completed jobs.
- [ ] `WS-004` Dashboard must show pending jobs.
- [ ] `WS-005` Dashboard must show jobs waiting for parts.
- [ ] `WS-006` Dashboard must show technician workload.
- [ ] `WS-007` Dashboard must show service progress.
- [ ] `WS-008` Dashboard must show vehicles ready for delivery.
- [ ] `WS-009` Dashboard must show overdue jobs.
- [ ] `WS-010` Dashboard must support branch-level filtering.

## 13.2 Job Cards

- [ ] `JOB-001` Every workshop job must have a unique job card number.
- [ ] `JOB-002` Job card must reference customer.
- [ ] `JOB-003` Job card must reference motorcycle.
- [ ] `JOB-004` Job card must reference branch.
- [ ] `JOB-005` Job card must reference booking where applicable.
- [ ] `JOB-006` Job card must record check-in date/time.
- [ ] `JOB-007` Job card must record mileage.
- [ ] `JOB-008` Job card must record customer-reported complaint.
- [ ] `JOB-009` Job card must record requested services.
- [ ] `JOB-010` Job card must support technician diagnosis.
- [ ] `JOB-011` Job card must support technician notes.
- [ ] `JOB-012` Job card must support parts used.
- [ ] `JOB-013` Job card must support labour items.
- [ ] `JOB-014` Job card must support photos.
- [ ] `JOB-015` Job card must support attachments.
- [ ] `JOB-016` Job card must support estimated completion date/time.
- [ ] `JOB-017` Job card must support actual completion date/time.
- [ ] `JOB-018` Job card must support assigned technician.
- [ ] `JOB-019` Job card must support multiple technicians if required.
- [ ] `JOB-020` Job card must support service advisor.
- [ ] `JOB-021` Job card must maintain activity timeline.

## 13.3 Workshop Job Status

Required workshop workflow:

**Received → Diagnosis → In Progress → QC Check → Ready → Delivered**

Additional status:

**Waiting Parts / On Hold / Cancelled**

- [ ] `JOB-022` Status changes must be timestamped.
- [ ] `JOB-023` Status changes must record user.
- [ ] `JOB-024` Waiting Parts status must support required-parts notes.
- [ ] `JOB-025` Ready status must trigger optional customer notification.
- [ ] `JOB-026` Delivered status must complete the service record.
- [ ] `JOB-027` Delivered job must update motorcycle service history.
- [ ] `JOB-028` Delivered job must update customer activity history.
- [ ] `JOB-029` Delivered job must trigger future service reminder calculation.

---

# 14. Technician Management

- [ ] `TECH-001` System must maintain technician profiles.
- [ ] `TECH-002` Technician must belong to one or more branches as configured.
- [ ] `TECH-003` Technician must have active/inactive status.
- [ ] `TECH-004` Technician must be assignable to job cards.
- [ ] `TECH-005` System must show jobs assigned to each technician.
- [ ] `TECH-006` System must show technician workload.
- [ ] `TECH-007` System must show technician active jobs.
- [ ] `TECH-008` System must show technician completed jobs.
- [ ] `TECH-009` Managers must be able to reassign jobs.
- [ ] `TECH-010` Technician users must update job status.
- [ ] `TECH-011` Technician users must enter diagnosis.
- [ ] `TECH-012` Technician users must add service notes.
- [ ] `TECH-013` Technician users must record parts used.
- [ ] `TECH-014` Technician users must record work completion.
- [ ] `TECH-015` Technician activity must be auditable.

---

# 15. Service History

- [ ] `HIST-001` Every completed service must create a permanent service history record.
- [ ] `HIST-002` Service history must record service date.
- [ ] `HIST-003` Service history must record motorcycle.
- [ ] `HIST-004` Service history must record customer at time of service.
- [ ] `HIST-005` Service history must record mileage.
- [ ] `HIST-006` Service history must record branch.
- [ ] `HIST-007` Service history must record service advisor.
- [ ] `HIST-008` Service history must record technician.
- [ ] `HIST-009` Service history must record service items performed.
- [ ] `HIST-010` Service history must record parts replaced.
- [ ] `HIST-011` Service history must record labour performed.
- [ ] `HIST-012` Service history must support total service value.
- [ ] `HIST-013` Service history must record next recommended service date.
- [ ] `HIST-014` Service history must record next recommended service mileage.
- [ ] `HIST-015` Historical service records must remain searchable.
- [ ] `HIST-016` Historical records must be visible from customer profile.
- [ ] `HIST-017` Historical records must be visible from vehicle profile.
- [ ] `HIST-018` Critical historical records must not be permanently destroyed by ordinary users.

---

# 16. Parts Inventory and Stock Control

## 16.1 Parts Catalogue

- [ ] `PART-001` System must maintain a parts catalogue.
- [ ] `PART-002` Every part must have unique internal part ID.
- [ ] `PART-003` Part must support SKU.
- [ ] `PART-004` Part must support manufacturer part number.
- [ ] `PART-005` Part must support part name.
- [ ] `PART-006` Part must support category.
- [ ] `PART-007` Part must support compatible motorcycles.
- [ ] `PART-008` Part must support cost price.
- [ ] `PART-009` Part must support selling price.
- [ ] `PART-010` Part must support supplier.
- [ ] `PART-011` Part must support barcode where available.
- [ ] `PART-012` Part must support active/inactive status.

## 16.2 Inventory

- [ ] `INV-001` Stock must be tracked by branch/location.
- [ ] `INV-002` System must show current quantity on hand.
- [ ] `INV-003` System must show available quantity.
- [ ] `INV-004` System must support minimum stock level.
- [ ] `INV-005` System must identify low-stock items.
- [ ] `INV-006` System must identify out-of-stock items.
- [ ] `INV-007` System must support stock receipt.
- [ ] `INV-008` System must support stock issue.
- [ ] `INV-009` System must support stock adjustment.
- [ ] `INV-010` System must support branch-to-branch transfer.
- [ ] `INV-011` Every stock movement must create an inventory ledger record.
- [ ] `INV-012` Inventory ledger must record user.
- [ ] `INV-013` Inventory ledger must record date/time.
- [ ] `INV-014` Inventory ledger must record movement reason.
- [ ] `INV-015` Workshop part consumption must deduct stock.
- [ ] `INV-016` Parts used on job cards must be linked to that job.
- [ ] `INV-017` Parts must be searchable by SKU.
- [ ] `INV-018` Parts must be searchable by part number.
- [ ] `INV-019` Parts must be searchable by description.
- [ ] `INV-020` Parts must be searchable by compatible motorcycle.
- [ ] `INV-021` Low-stock alerts must be configurable.
- [ ] `INV-022` Inventory reports must support branch comparison.

---

# 17. Automated Reminders

## 17.1 Service Reminders

- [ ] `REM-001` System must schedule next-service reminders.
- [ ] `REM-002` Reminder may be based on recommended service date.
- [ ] `REM-003` Reminder may be based on service interval.
- [ ] `REM-004` Reminder must reference customer.
- [ ] `REM-005` Reminder must reference motorcycle.
- [ ] `REM-006` Reminder must reference originating service record.
- [ ] `REM-007` Reminder must have scheduled date/time.
- [ ] `REM-008` Reminder must support WhatsApp.
- [ ] `REM-009` Reminder must support SMS.
- [ ] `REM-010` Reminder must support email.
- [ ] `REM-011` Reminder template must be configurable.
- [ ] `REM-012` Reminder must support placeholders such as customer name.
- [ ] `REM-013` Reminder must support motorcycle model.
- [ ] `REM-014` Reminder must support due date.
- [ ] `REM-015` Reminder must support booking link.
- [ ] `REM-016` Reminder send status must be recorded.
- [ ] `REM-017` Failed reminders must be recorded.
- [ ] `REM-018` Successful reminder delivery must update customer timeline where supported.
- [ ] `REM-019` Customer responses must be associated with customer profile where integration supports it.
- [ ] `REM-020` Reminder conversion into booking must be measurable.

## 17.2 Renewal Alerts

- [ ] `REM-021` System must support configurable renewal reminders.
- [ ] `REM-022` Renewal reminders must support insurance renewal scenarios.
- [ ] `REM-023` Renewal reminders must support warranty expiration scenarios.
- [ ] `REM-024` Renewal reminders must support membership renewal scenarios.
- [ ] `REM-025` Administrators must configure reminder timing.

---

# 18. Workflow Automation

- [ ] `AUTO-001` Platform must contain automation rules.
- [ ] `AUTO-002` Automation must support event triggers.
- [ ] `AUTO-003` Automation must support time-based triggers.
- [ ] `AUTO-004` Automation must support conditions.
- [ ] `AUTO-005` Automation must support actions.
- [ ] `AUTO-006` New lead creation must be usable as a trigger.
- [ ] `AUTO-007` Lead stage change must be usable as a trigger.
- [ ] `AUTO-008` Booking creation must be usable as a trigger.
- [ ] `AUTO-009` Booking approaching date must be usable as a trigger.
- [ ] `AUTO-010` Service completion must be usable as a trigger.
- [ ] `AUTO-011` Service due date must be usable as a trigger.
- [ ] `AUTO-012` Job ready status must be usable as a trigger.
- [ ] `AUTO-013` Customer inactivity must be usable as a trigger.
- [ ] `AUTO-014` Loyalty event must be usable as a trigger.
- [ ] `AUTO-015` Low-stock threshold must be usable as a trigger.
- [ ] `AUTO-016` Automation action must support creating a task.
- [ ] `AUTO-017` Automation action must support assigning a lead.
- [ ] `AUTO-018` Automation action must support sending a message.
- [ ] `AUTO-019` Automation action must support scheduling a reminder.
- [ ] `AUTO-020` Automation action must support updating tags.
- [ ] `AUTO-021` Automation executions must be logged.
- [ ] `AUTO-022` Failed automation executions must be visible to administrators.
- [ ] `AUTO-023` Administrators must be able to disable an automation.
- [ ] `AUTO-024` Automation must not execute indefinitely due to circular trigger conditions.

---

# 19. Messaging and Communications

- [ ] `MSG-001` Platform must support WhatsApp messaging integration.
- [ ] `MSG-002` Platform must support SMS integration.
- [ ] `MSG-003` Platform must support email integration.
- [ ] `MSG-004` Message templates must be configurable.
- [ ] `MSG-005` Templates must support customer name.
- [ ] `MSG-006` Templates must support motorcycle information.
- [ ] `MSG-007` Templates must support appointment date.
- [ ] `MSG-008` Templates must support appointment time.
- [ ] `MSG-009` Templates must support branch information.
- [ ] `MSG-010` Templates must support booking URLs.
- [ ] `MSG-011` Templates must support service due information.
- [ ] `MSG-012` System must record outbound communication history.
- [ ] `MSG-013` Communication record must record channel.
- [ ] `MSG-014` Communication record must record send time.
- [ ] `MSG-015` Communication record must record recipient.
- [ ] `MSG-016` Communication record must record delivery result where provider supports it.
- [ ] `MSG-017` System must prevent marketing messages to opted-out customers.
- [ ] `MSG-018` Transactional messaging consent must be managed according to applicable rules.
- [ ] `MSG-019` Messaging provider credentials must be securely stored.
- [ ] `MSG-020` Message API failures must be logged.

---

# 20. Loyalty and Membership Program

## 20.1 Membership

- [ ] `LOY-001` System must support loyalty membership.
- [ ] `LOY-002` Customer must have unique membership ID.
- [ ] `LOY-003` Membership must support tiers.
- [ ] `LOY-004` Required configuration must support multiple membership tiers.
- [ ] `LOY-005` Administrators must configure tier requirements.
- [ ] `LOY-006` Administrators must configure tier benefits.
- [ ] `LOY-007` System must display current customer tier.
- [ ] `LOY-008` System must display progress toward next tier.
- [ ] `LOY-009` System must support member since date.
- [ ] `LOY-010` System must support digital membership card.

## 20.2 Points

- [ ] `LOY-011` System must support loyalty points.
- [ ] `LOY-012` Points must have transaction ledger.
- [ ] `LOY-013` Points must support earning.
- [ ] `LOY-014` Points must support redemption.
- [ ] `LOY-015` Points must support adjustment.
- [ ] `LOY-016` Points must support expiration where configured.
- [ ] `LOY-017` Points must support service-based earning rules.
- [ ] `LOY-018` Points must support purchase-based earning rules.
- [ ] `LOY-019` Points must support referral-based earning rules.
- [ ] `LOY-020` Points must support promotional bonus rules.
- [ ] `LOY-021` Point changes must be auditable.
- [ ] `LOY-022` Customer must be able to see available points.
- [ ] `LOY-023` Staff must be able to see points history.
- [ ] `LOY-024` Point redemption must prevent balance going below permitted amount.

## 20.3 Rewards

- [ ] `LOY-025` Administrators must create rewards.
- [ ] `LOY-026` Reward must define points required.
- [ ] `LOY-027` Reward must support active/inactive state.
- [ ] `LOY-028` Reward redemption must be recorded.
- [ ] `LOY-029` System must prevent duplicate redemption of single-use rewards.

---

# 21. Referral Program

- [ ] `REF-001` Customers must be able to have a referral code or referral link.
- [ ] `REF-002` Referral relationship must identify referring customer.
- [ ] `REF-003` Referral relationship must identify referred prospect/customer.
- [ ] `REF-004` Referral status must be tracked.
- [ ] `REF-005` Referral reward conditions must be configurable.
- [ ] `REF-006` Referral reward must not be issued until qualifying condition is met.
- [ ] `REF-007` Referral reward must integrate with loyalty points.
- [ ] `REF-008` Referral performance must be reportable.
- [ ] `REF-009` System must prevent obvious self-referrals where identifiable.

---

# 22. Marketing Campaigns

- [ ] `MKT-001` Marketing staff must create campaigns.
- [ ] `MKT-002` Campaign must have name.
- [ ] `MKT-003` Campaign must have start date.
- [ ] `MKT-004` Campaign must optionally have end date.
- [ ] `MKT-005` Campaign must support target audience.
- [ ] `MKT-006` Audience must support customer tags.
- [ ] `MKT-007` Audience must support branch.
- [ ] `MKT-008` Audience must support motorcycle ownership.
- [ ] `MKT-009` Audience must support service history.
- [ ] `MKT-010` Audience must support inactive customers.
- [ ] `MKT-011` Audience must support membership tier.
- [ ] `MKT-012` Audience must respect marketing consent.
- [ ] `MKT-013` Campaign must support promotional offers.
- [ ] `MKT-014` Campaign must support loyalty point promotions.
- [ ] `MKT-015` Campaign performance must track attributable leads where possible.
- [ ] `MKT-016` Campaign performance must track attributable bookings where possible.
- [ ] `MKT-017` Campaign performance must track attributable revenue where available.

---

# 23. Revenue and Transaction Data

Because dashboard analytics require revenue information:

- [ ] `REV-001` Platform must have a reliable source for revenue data.
- [ ] `REV-002` Revenue may originate from native transaction records, imports, POS integrations, accounting integrations, or APIs.
- [ ] `REV-003` Revenue record must contain amount.
- [ ] `REV-004` Revenue record must contain transaction date.
- [ ] `REV-005` Revenue record must contain branch.
- [ ] `REV-006` Revenue record must support customer relationship.
- [ ] `REV-007` Revenue record must support source/type.
- [ ] `REV-008` Revenue source must distinguish workshop/service revenue where known.
- [ ] `REV-009` Revenue source must distinguish parts revenue where known.
- [ ] `REV-010` Revenue source must distinguish motorcycle sales revenue where known.
- [ ] `REV-011` Analytics must not fabricate revenue when financial source data is unavailable.
- [ ] `REV-012` Estimated values must be clearly distinguished from actual revenue.

---

# 24. Analytics and Business Insights

## 24.1 Sales Analytics

- [ ] `ANA-001` Report total leads.
- [ ] `ANA-002` Report leads by source.
- [ ] `ANA-003` Report leads by salesperson.
- [ ] `ANA-004` Report leads by branch.
- [ ] `ANA-005` Report leads by motorcycle model.
- [ ] `ANA-006` Report stage conversion rates.
- [ ] `ANA-007` Report lead-to-sale conversion.
- [ ] `ANA-008` Report lead response time where available.
- [ ] `ANA-009` Report stale leads.
- [ ] `ANA-010` Report closed-lost reasons.

## 24.2 Service Analytics

- [ ] `ANA-011` Report total service bookings.
- [ ] `ANA-012` Report completed services.
- [ ] `ANA-013` Report cancelled bookings.
- [ ] `ANA-014` Report no-shows.
- [ ] `ANA-015` Report workshop throughput.
- [ ] `ANA-016` Report average service completion time.
- [ ] `ANA-017` Report jobs waiting for parts.
- [ ] `ANA-018` Report technician workload.
- [ ] `ANA-019` Report technician completed jobs.
- [ ] `ANA-020` Report most frequently performed services.

## 24.3 Customer Analytics

- [ ] `ANA-021` Report new customers.
- [ ] `ANA-022` Report repeat customers.
- [ ] `ANA-023` Report customer retention.
- [ ] `ANA-024` Report service frequency.
- [ ] `ANA-025` Report inactive customers.
- [ ] `ANA-026` Report loyalty membership.
- [ ] `ANA-027` Report referral performance.

## 24.4 Revenue Analytics

- [ ] `ANA-028` Report total revenue.
- [ ] `ANA-029` Report revenue trend.
- [ ] `ANA-030` Report revenue by branch.
- [ ] `ANA-031` Report revenue by source.
- [ ] `ANA-032` Report revenue by service type.
- [ ] `ANA-033` Report revenue from parts where data exists.
- [ ] `ANA-034` Report revenue from motorcycle sales where data exists.
- [ ] `ANA-035` Report revenue per customer.
- [ ] `ANA-036` Report repeat-customer revenue.

## 24.5 Inventory Analytics

- [ ] `ANA-037` Report current stock.
- [ ] `ANA-038` Report low-stock items.
- [ ] `ANA-039` Report out-of-stock items.
- [ ] `ANA-040` Report inventory movements.
- [ ] `ANA-041` Report frequently used parts.
- [ ] `ANA-042` Report inventory by branch.

## 24.6 Reporting UX

- [ ] `ANA-043` Reports must allow date filters.
- [ ] `ANA-044` Reports must allow branch filters.
- [ ] `ANA-045` Reports must allow comparison periods.
- [ ] `ANA-046` Reports must provide visual charts where appropriate.
- [ ] `ANA-047` Reports must provide underlying tabular data.
- [ ] `ANA-048` Reports must support export.
- [ ] `ANA-049` Export must support CSV.
- [ ] `ANA-050` Export should preserve tenant and permission restrictions.
- [ ] `ANA-051` Dashboard values and report values must use consistent calculation rules.

---

# 25. Multi-Branch Dealer Control

- [ ] `BR-001` Head office must see all authorized branches.
- [ ] `BR-002` Head office dashboard must show total number of branches.
- [ ] `BR-003` Head office dashboard must show leads across branches.
- [ ] `BR-004` Head office dashboard must show bookings across branches.
- [ ] `BR-005` Head office dashboard must show revenue across branches.
- [ ] `BR-006` Head office dashboard must show customer count across branches.
- [ ] `BR-007` Head office must compare branch performance.
- [ ] `BR-008` Head office must filter by branch.
- [ ] `BR-009` Head office must rank branches by configurable KPIs.
- [ ] `BR-010` Customers must be viewable across branches subject to permissions.
- [ ] `BR-011` Customer activity from multiple branches must form a unified customer timeline.
- [ ] `BR-012` Vehicle history must remain unified across branches.
- [ ] `BR-013` Branch-specific transactions must retain originating branch.
- [ ] `BR-014` Branch-specific service jobs must retain originating branch.
- [ ] `BR-015` Branch-specific stock must remain separate.
- [ ] `BR-016` Head office must be able to see stock across branches.
- [ ] `BR-017` System must support branch-to-branch stock transfer.
- [ ] `BR-018` Head office must configure shared workflows.
- [ ] `BR-019` Head office must configure shared service types.
- [ ] `BR-020` Head office must configure common campaign templates.
- [ ] `BR-021` Head office must configure common automation templates.
- [ ] `BR-022` Branches must retain configurable local operating hours.
- [ ] `BR-023` Branches must retain configurable local appointment capacities.
- [ ] `BR-024` New branch onboarding must not require a new independent CRM deployment.
- [ ] `BR-025` New branch must inherit applicable organization-level configurations.

---

# 26. Global Search

- [ ] `SEARCH-001` Platform must provide global search.
- [ ] `SEARCH-002` Search must find customers.
- [ ] `SEARCH-003` Search must find customer phone numbers.
- [ ] `SEARCH-004` Search must find customer email addresses.
- [ ] `SEARCH-005` Search must find motorcycle registration numbers.
- [ ] `SEARCH-006` Search must find motorcycle VIN/chassis numbers.
- [ ] `SEARCH-007` Search must find leads.
- [ ] `SEARCH-008` Search must find bookings.
- [ ] `SEARCH-009` Search must find job cards.
- [ ] `SEARCH-010` Search must find parts.
- [ ] `SEARCH-011` Search must find service records.
- [ ] `SEARCH-012` Search results must respect permissions.
- [ ] `SEARCH-013` Search must provide relevant record type.
- [ ] `SEARCH-014` Selecting search result must open corresponding record.

---

# 27. AI-Native CRM Requirements

AI must assist users while preserving deterministic CRM data and user control.

## 27.1 AI Lead Assistance

- [ ] `AI-001` AI must be able to summarize a lead's interaction history.
- [ ] `AI-002` AI must identify leads requiring follow-up.
- [ ] `AI-003` AI must identify overdue follow-ups.
- [ ] `AI-004` AI must suggest a next action based on CRM history.
- [ ] `AI-005` AI-generated recommendations must be clearly distinguishable from stored facts.
- [ ] `AI-006` AI must not autonomously alter critical CRM records without authorized workflow.
- [ ] `AI-007` Users must be able to accept, edit, or reject AI suggestions.

## 27.2 AI Customer Assistance

- [ ] `AI-008` AI must summarize customer history.
- [ ] `AI-009` AI must summarize motorcycle service history.
- [ ] `AI-010` AI must identify relevant previous interactions.
- [ ] `AI-011` AI must help staff prepare customer follow-up messages.
- [ ] `AI-012` AI must use CRM context only within the user's authorized data scope.

## 27.3 AI Messaging

- [ ] `AI-013` AI must assist with drafting WhatsApp messages.
- [ ] `AI-014` AI must assist with drafting SMS messages.
- [ ] `AI-015` AI must assist with drafting email.
- [ ] `AI-016` AI must support customizable business tone.
- [ ] `AI-017` AI-generated outbound messages must remain editable before manual sending unless they are part of an approved automation.
- [ ] `AI-018` AI must not invent service details, appointment details, pricing, or customer facts.
- [ ] `AI-019` AI must reference structured CRM data when generating factual customer communications.

## 27.4 AI Business Insights

- [ ] `AI-020` AI must explain dashboard metrics in natural language.
- [ ] `AI-021` AI must identify unusual changes in lead volumes.
- [ ] `AI-022` AI must identify unusual changes in bookings.
- [ ] `AI-023` AI must identify customer retention trends.
- [ ] `AI-024` AI must identify branches significantly underperforming others when data supports the conclusion.
- [ ] `AI-025` AI must differentiate observed data from recommendation or inference.
- [ ] `AI-026` AI insights must respect selected date range.
- [ ] `AI-027` AI insights must respect user branch permissions.

## 27.5 AI Safety and Governance

- [ ] `AI-028` AI prompts must not expose another tenant's data.
- [ ] `AI-029` Sensitive configuration secrets must not be sent to AI models.
- [ ] `AI-030` AI actions must follow RBAC permissions.
- [ ] `AI-031` High-impact automated actions must have defined authorization rules.
- [ ] `AI-032` AI failures must not prevent core CRM functionality from operating.
- [ ] `AI-033` Core data CRUD functions must remain available if AI services are unavailable.

---

# 28. Notifications

- [ ] `NOTIF-001` Platform must provide in-app notifications.
- [ ] `NOTIF-002` Users must receive notifications for newly assigned leads.
- [ ] `NOTIF-003` Users must receive notifications for due tasks.
- [ ] `NOTIF-004` Users must receive notifications for overdue tasks.
- [ ] `NOTIF-005` Service staff must receive relevant booking notifications.
- [ ] `NOTIF-006` Workshop users must receive job assignment notifications.
- [ ] `NOTIF-007` Relevant users must receive low-stock notifications.
- [ ] `NOTIF-008` Notification must link to relevant CRM record.
- [ ] `NOTIF-009` Notification must support read/unread status.
- [ ] `NOTIF-010` Users must be able to configure non-critical notification preferences.

---

# 29. Customer Timeline

Every customer must have a chronological timeline containing applicable events.

- [ ] `TIME-001` Lead created.
- [ ] `TIME-002` Lead assigned.
- [ ] `TIME-003` Lead stage changed.
- [ ] `TIME-004` Note added.
- [ ] `TIME-005` Follow-up created.
- [ ] `TIME-006` Follow-up completed.
- [ ] `TIME-007` Test ride scheduled.
- [ ] `TIME-008` Test ride completed.
- [ ] `TIME-009` Service booking created.
- [ ] `TIME-010` Booking rescheduled.
- [ ] `TIME-011` Booking cancelled.
- [ ] `TIME-012` Vehicle checked in.
- [ ] `TIME-013` Service started.
- [ ] `TIME-014` Service completed.
- [ ] `TIME-015` Motorcycle delivered.
- [ ] `TIME-016` Reminder scheduled.
- [ ] `TIME-017` Reminder sent.
- [ ] `TIME-018` Message sent.
- [ ] `TIME-019` Customer response where integrated.
- [ ] `TIME-020` Loyalty points earned.
- [ ] `TIME-021` Loyalty points redeemed.
- [ ] `TIME-022` Referral activity.
- [ ] `TIME-023` Relevant transaction activity.
- [ ] `TIME-024` Timeline events must include timestamp.
- [ ] `TIME-025` Timeline events must identify responsible user/system where applicable.
- [ ] `TIME-026` Timeline must be sortable chronologically.

---

# 30. Required Core Data Entities

The database/data model must support, at minimum:

- [ ] `DATA-001` Tenant/Organization.
- [ ] `DATA-002` Branch.
- [ ] `DATA-003` User.
- [ ] `DATA-004` Role.
- [ ] `DATA-005` Permission.
- [ ] `DATA-006` Customer.
- [ ] `DATA-007` Customer Address.
- [ ] `DATA-008` Customer Consent.
- [ ] `DATA-009` Vehicle/Motorcycle.
- [ ] `DATA-010` Lead.
- [ ] `DATA-011` Lead Source.
- [ ] `DATA-012` Lead Stage.
- [ ] `DATA-013` Lead Activity.
- [ ] `DATA-014` Task.
- [ ] `DATA-015` Test Ride.
- [ ] `DATA-016` Booking/Appointment.
- [ ] `DATA-017` Appointment Slot.
- [ ] `DATA-018` Service Type.
- [ ] `DATA-019` Job Card.
- [ ] `DATA-020` Job Status History.
- [ ] `DATA-021` Technician.
- [ ] `DATA-022` Service Item.
- [ ] `DATA-023` Service History.
- [ ] `DATA-024` Part.
- [ ] `DATA-025` Inventory Location.
- [ ] `DATA-026` Inventory Balance.
- [ ] `DATA-027` Inventory Movement.
- [ ] `DATA-028` Reminder.
- [ ] `DATA-029` Automation Rule.
- [ ] `DATA-030` Automation Execution.
- [ ] `DATA-031` Message.
- [ ] `DATA-032` Message Template.
- [ ] `DATA-033` Campaign.
- [ ] `DATA-034` Loyalty Account.
- [ ] `DATA-035` Loyalty Tier.
- [ ] `DATA-036` Loyalty Transaction.
- [ ] `DATA-037` Reward.
- [ ] `DATA-038` Reward Redemption.
- [ ] `DATA-039` Referral.
- [ ] `DATA-040` Revenue/Transaction Record.
- [ ] `DATA-041` Attachment.
- [ ] `DATA-042` Notification.
- [ ] `DATA-043` Audit Log.
- [ ] `DATA-044` Integration Configuration.

---

# 31. Data Import and Migration

- [ ] `IMPORT-001` System must support customer CSV import.
- [ ] `IMPORT-002` System must support vehicle CSV import.
- [ ] `IMPORT-003` System must support lead CSV import.
- [ ] `IMPORT-004` System must support parts CSV import.
- [ ] `IMPORT-005` System must support inventory quantity import.
- [ ] `IMPORT-006` Import must provide column mapping.
- [ ] `IMPORT-007` Import must validate required fields.
- [ ] `IMPORT-008` Import must identify invalid rows.
- [ ] `IMPORT-009` Import must report successful rows.
- [ ] `IMPORT-010` Import must report failed rows.
- [ ] `IMPORT-011` Import must provide duplicate detection where practical.
- [ ] `IMPORT-012` Import must not silently overwrite existing records.
- [ ] `IMPORT-013` Imported records must retain tenant ownership.

---

# 32. Export

- [ ] `EXPORT-001` Authorized users must export customer data.
- [ ] `EXPORT-002` Authorized users must export lead data.
- [ ] `EXPORT-003` Authorized users must export booking data.
- [ ] `EXPORT-004` Authorized users must export service history.
- [ ] `EXPORT-005` Authorized users must export inventory data.
- [ ] `EXPORT-006` Authorized users must export reports.
- [ ] `EXPORT-007` Export access must be permission-controlled.
- [ ] `EXPORT-008` Export events containing sensitive data must be auditable.

---

# 33. APIs and Integrations

- [ ] `API-001` Platform must expose secure API capabilities for approved integrations.
- [ ] `API-002` API authentication must be secure.
- [ ] `API-003` API must enforce tenant isolation.
- [ ] `API-004` API must enforce permissions.
- [ ] `API-005` API requests must be rate-limited where appropriate.
- [ ] `API-006` Integration failures must be logged.
- [ ] `API-007` Platform must support webhook-style event delivery where product architecture requires it.
- [ ] `API-008` Webhooks must support secure signature validation.
- [ ] `API-009` Duplicate webhook processing must be prevented through idempotency controls.

Required integration categories:

- [ ] `INT-001` WhatsApp Business messaging provider.
- [ ] `INT-002` SMS provider.
- [ ] `INT-003` Email provider.
- [ ] `INT-004` Website forms.
- [ ] `INT-005` Social lead sources/import capabilities.
- [ ] `INT-006` External POS/accounting/revenue integration pathway.
- [ ] `INT-007` External API for future D&Z ecosystem integrations.

---

# 34. Audit Logging

- [ ] `AUDIT-001` System must maintain audit logs for sensitive operations.
- [ ] `AUDIT-002` Audit log must identify user.
- [ ] `AUDIT-003` Audit log must identify tenant.
- [ ] `AUDIT-004` Audit log must identify branch where applicable.
- [ ] `AUDIT-005` Audit log must identify action.
- [ ] `AUDIT-006` Audit log must identify record/entity.
- [ ] `AUDIT-007` Audit log must contain timestamp.
- [ ] `AUDIT-008` Audit log must capture relevant before/after values for critical changes.
- [ ] `AUDIT-009` Login events must be auditable.
- [ ] `AUDIT-010` Permission changes must be auditable.
- [ ] `AUDIT-011` User disabling must be auditable.
- [ ] `AUDIT-012` Inventory adjustments must be auditable.
- [ ] `AUDIT-013` Loyalty adjustments must be auditable.
- [ ] `AUDIT-014` Data exports must be auditable.
- [ ] `AUDIT-015` Ordinary users must not be able to alter audit history.

---

# 35. Security

- [ ] `SEC-001` All production traffic must use HTTPS.
- [ ] `SEC-002` Sensitive credentials must be encrypted at rest.
- [ ] `SEC-003` Passwords must use a strong password hashing algorithm.
- [ ] `SEC-004` System must protect against SQL injection.
- [ ] `SEC-005` System must protect against cross-site scripting.
- [ ] `SEC-006` System must protect against CSRF where applicable.
- [ ] `SEC-007` System must validate uploaded files.
- [ ] `SEC-008` System must limit file upload size.
- [ ] `SEC-009` API secrets must not be exposed to frontend clients.
- [ ] `SEC-010` Tenant IDs supplied by clients must not bypass authorization checks.
- [ ] `SEC-011` Server-side permission validation must occur for protected operations.
- [ ] `SEC-012` Sensitive fields must not be unnecessarily written into application logs.
- [ ] `SEC-013` Production secrets must be stored using secure secret management.
- [ ] `SEC-014` Production database backups must be encrypted.
- [ ] `SEC-015` System dependencies must be maintained and security vulnerabilities reviewed.
- [ ] `SEC-016` Access to production systems must be limited to authorized personnel.
- [ ] `SEC-017` Sensitive administrator actions must require authenticated sessions.

---

# 36. Privacy and Customer Consent

- [ ] `PRIV-001` Platform must store customer consent state where required.
- [ ] `PRIV-002` Platform must distinguish operational communication from marketing communication.
- [ ] `PRIV-003` Marketing opt-out must be respected by campaign execution.
- [ ] `PRIV-004` Customer contact details must only be available to authorized users.
- [ ] `PRIV-005` Customer data exports must require proper permission.
- [ ] `PRIV-006` Administrators must be able to respond to lawful customer data requests.
- [ ] `PRIV-007` Data retention policies must be configurable or operationally definable.
- [ ] `PRIV-008` Deletion/anonymization workflows must avoid corrupting required business/audit history.
- [ ] `PRIV-009` System must comply with applicable Malaysian personal-data requirements before production deployment.

---

# 37. File and Attachment Management

- [ ] `FILE-001` CRM must support attachments.
- [ ] `FILE-002` Attachments must support customer records.
- [ ] `FILE-003` Attachments must support leads.
- [ ] `FILE-004` Attachments must support vehicle records.
- [ ] `FILE-005` Attachments must support job cards.
- [ ] `FILE-006` Supported uploads must include common image formats.
- [ ] `FILE-007` Supported uploads must include PDF.
- [ ] `FILE-008` File access must respect tenant permissions.
- [ ] `FILE-009` File access must respect role permissions.
- [ ] `FILE-010` Deleted parent records must not unintentionally expose orphaned attachments.

---

# 38. Mobile and Responsive UX

- [ ] `UX-001` Internal CRM must be responsive.
- [ ] `UX-002` Core CRM functionality must be usable on smartphones.
- [ ] `UX-003` Core CRM functionality must be usable on tablets.
- [ ] `UX-004` Core CRM functionality must be usable on desktop.
- [ ] `UX-005` Salespeople must be able to view and update leads on mobile.
- [ ] `UX-006` Salespeople must be able to complete follow-up tasks on mobile.
- [ ] `UX-007` Service advisors must be able to access bookings on mobile.
- [ ] `UX-008` Workshop users must be able to update job status on tablet/mobile.
- [ ] `UX-009` Parts staff must be able to search inventory on mobile/tablet.
- [ ] `UX-010` Dashboard cards must adapt to smaller screens.
- [ ] `UX-011` Tables must remain usable on mobile through responsive patterns.
- [ ] `UX-012` Primary actions must remain obvious and accessible.
- [ ] `UX-013` Error messages must clearly explain validation problems.
- [ ] `UX-014` Destructive operations must require appropriate confirmation.

---

# 39. Performance Requirements

- [ ] `PERF-001` Normal CRM pages must load within an acceptable production response time under expected load.
- [ ] `PERF-002` Dashboard requests must be optimized and must not perform unbounded database queries.
- [ ] `PERF-003` Search must remain responsive with large customer datasets.
- [ ] `PERF-004` Pagination must be used for large lists.
- [ ] `PERF-005` Large exports must not block normal interactive requests.
- [ ] `PERF-006` Background jobs must be used for appropriate heavy processing.
- [ ] `PERF-007` Message sending should execute asynchronously where appropriate.
- [ ] `PERF-008` Automation processing should execute asynchronously where appropriate.
- [ ] `PERF-009` Dashboard aggregate calculations should use scalable query or caching strategies.
- [ ] `PERF-010` Database indexes must exist for frequently searched identifiers such as phone, customer ID, lead ID, registration number, job card number, and SKU.

---

# 40. Reliability and Recovery

- [ ] `REL-001` Production database must have automated backups.
- [ ] `REL-002` Backup restoration procedure must be tested.
- [ ] `REL-003` Application errors must be centrally logged.
- [ ] `REL-004` Critical background-job failures must be detectable.
- [ ] `REL-005` Messaging failures must be retryable where safe.
- [ ] `REL-006` Duplicate message sends must be prevented where possible.
- [ ] `REL-007` Duplicate payment/revenue/integration events must be prevented through idempotency where applicable.
- [ ] `REL-008` AI service outage must not make CRM unusable.
- [ ] `REL-009` WhatsApp/SMS provider outage must not corrupt customer data.
- [ ] `REL-010` Failed external integrations must provide administrators enough information to diagnose the issue.

---

# 41. Administrator Configuration

Administrators must be able to configure:

- [ ] `ADMIN-001` Company profile.
- [ ] `ADMIN-002` Branches.
- [ ] `ADMIN-003` Users.
- [ ] `ADMIN-004` Roles.
- [ ] `ADMIN-005` Permissions.
- [ ] `ADMIN-006` Lead stages.
- [ ] `ADMIN-007` Lead sources.
- [ ] `ADMIN-008` Lost reasons.
- [ ] `ADMIN-009` Service types.
- [ ] `ADMIN-010` Booking slots.
- [ ] `ADMIN-011` Operating hours.
- [ ] `ADMIN-012` Holiday/closure dates.
- [ ] `ADMIN-013` Appointment capacities.
- [ ] `ADMIN-014` Reminder templates.
- [ ] `ADMIN-015` Messaging templates.
- [ ] `ADMIN-016` Automation rules.
- [ ] `ADMIN-017` Loyalty tiers.
- [ ] `ADMIN-018` Loyalty earning rules.
- [ ] `ADMIN-019` Rewards.
- [ ] `ADMIN-020` Referral rules.
- [ ] `ADMIN-021` Inventory minimum stock levels.
- [ ] `ADMIN-022` Integrations.
- [ ] `ADMIN-023` Website branding.
- [ ] `ADMIN-024` Currency.
- [ ] `ADMIN-025` Timezone.
- [ ] `ADMIN-026` Notification preferences.

---

# 42. Mandatory End-to-End Sales Workflow

The following complete workflow must work without manual duplication of data:

- [ ] `E2E-SALES-001` Prospect submits website enquiry.
- [ ] `E2E-SALES-002` Lead automatically appears in CRM.
- [ ] `E2E-SALES-003` Lead source is recorded.
- [ ] `E2E-SALES-004` Lead is assigned to salesperson.
- [ ] `E2E-SALES-005` Salesperson receives notification.
- [ ] `E2E-SALES-006` Salesperson contacts prospect.
- [ ] `E2E-SALES-007` Interaction is recorded.
- [ ] `E2E-SALES-008` Salesperson schedules next follow-up.
- [ ] `E2E-SALES-009` Prospect moves through pipeline.
- [ ] `E2E-SALES-010` Test ride may be scheduled.
- [ ] `E2E-SALES-011` Test ride activity appears in customer/lead timeline.
- [ ] `E2E-SALES-012` Lead reaches Closed Won or Closed Lost.
- [ ] `E2E-SALES-013` Closed Won creates/links customer record.
- [ ] `E2E-SALES-014` Customer history retains original lead source.
- [ ] `E2E-SALES-015` Conversion is reflected in analytics.

---

# 43. Mandatory End-to-End Service Workflow

- [ ] `E2E-SVC-001` Customer books service online or staff creates booking.
- [ ] `E2E-SVC-002` Booking appears in service calendar.
- [ ] `E2E-SVC-003` Customer receives confirmation.
- [ ] `E2E-SVC-004` Customer receives pre-appointment reminder.
- [ ] `E2E-SVC-005` Motorcycle arrives.
- [ ] `E2E-SVC-006` Service advisor checks customer/vehicle in.
- [ ] `E2E-SVC-007` Job card is created.
- [ ] `E2E-SVC-008` Technician is assigned.
- [ ] `E2E-SVC-009` Technician performs diagnosis.
- [ ] `E2E-SVC-010` Job moves to In Progress.
- [ ] `E2E-SVC-011` Parts usage is recorded.
- [ ] `E2E-SVC-012` Inventory is deducted.
- [ ] `E2E-SVC-013` Job moves through QC.
- [ ] `E2E-SVC-014` Job becomes Ready.
- [ ] `E2E-SVC-015` Customer is notified.
- [ ] `E2E-SVC-016` Vehicle is delivered.
- [ ] `E2E-SVC-017` Job becomes Completed/Delivered.
- [ ] `E2E-SVC-018` Service history is created.
- [ ] `E2E-SVC-019` Customer timeline is updated.
- [ ] `E2E-SVC-020` Next service due date/mileage is recorded.
- [ ] `E2E-SVC-021` Future reminder is scheduled.
- [ ] `E2E-SVC-022` Relevant loyalty points are awarded according to rules.
- [ ] `E2E-SVC-023` Dashboard and analytics update accordingly.

---

# 44. Mandatory End-to-End Retention Workflow

- [ ] `E2E-RET-001` Completed service produces next service recommendation.
- [ ] `E2E-RET-002` CRM schedules appropriate future reminder.
- [ ] `E2E-RET-003` Reminder is sent through configured channel.
- [ ] `E2E-RET-004` Customer receives booking link.
- [ ] `E2E-RET-005` Customer books appointment.
- [ ] `E2E-RET-006` Booking links back to reminder campaign/activity.
- [ ] `E2E-RET-007` System identifies returning customer.
- [ ] `E2E-RET-008` Repeat visit contributes to retention analytics.
- [ ] `E2E-RET-009` Loyalty rules are applied.
- [ ] `E2E-RET-010` Staff can see complete cycle in customer timeline.

---

# 45. Mandatory End-to-End Multi-Branch Workflow

- [ ] `E2E-BR-001` Customer may visit Branch A.
- [ ] `E2E-BR-002` Customer profile is created or identified.
- [ ] `E2E-BR-003` Motorcycle is registered.
- [ ] `E2E-BR-004` Service history is recorded at Branch A.
- [ ] `E2E-BR-005` Customer may later visit Branch B.
- [ ] `E2E-BR-006` Authorized Branch B staff can identify existing customer.
- [ ] `E2E-BR-007` Authorized Branch B staff can see relevant prior vehicle/service history.
- [ ] `E2E-BR-008` New Branch B activity appends to same customer timeline.
- [ ] `E2E-BR-009` Branch-level financial records remain attributed correctly.
- [ ] `E2E-BR-010` Head office can see combined customer relationship.
- [ ] `E2E-BR-011` Head office analytics can compare Branch A and Branch B.

---

# 46. Definition of Done for V1

D&Z AI CRM V1 must **not** be considered production-ready until all of the following conditions are satisfied:

- [ ] `DONE-001` Tenant data isolation has been tested.
- [ ] `DONE-002` Role permissions have been tested.
- [ ] `DONE-003` Website enquiry → CRM lead flow works end-to-end.
- [ ] `DONE-004` Lead → customer conversion works.
- [ ] `DONE-005` Sales pipeline works.
- [ ] `DONE-006` Follow-up tasks work.
- [ ] `DONE-007` Test ride booking works.
- [ ] `DONE-008` Customer profiles work.
- [ ] `DONE-009` Motorcycle profiles work.
- [ ] `DONE-010` Online service booking works.
- [ ] `DONE-011` Service calendar works.
- [ ] `DONE-012` Workshop job cards work.
- [ ] `DONE-013` Technician assignment works.
- [ ] `DONE-014` Workshop status workflow works.
- [ ] `DONE-015` Service history is automatically generated.
- [ ] `DONE-016` Parts inventory deducts workshop usage correctly.
- [ ] `DONE-017` Inventory movement ledger works.
- [ ] `DONE-018` Automated service reminders work.
- [ ] `DONE-019` WhatsApp integration works in production configuration.
- [ ] `DONE-020` SMS integration works where enabled.
- [ ] `DONE-021` Email integration works where enabled.
- [ ] `DONE-022` Customer timeline works.
- [ ] `DONE-023` Loyalty points ledger works.
- [ ] `DONE-024` Loyalty redemption works.
- [ ] `DONE-025` Referral tracking works.
- [ ] `DONE-026` Core dashboards reconcile with underlying data.
- [ ] `DONE-027` Branch-level reporting works.
- [ ] `DONE-028` Multi-branch head-office reporting works.
- [ ] `DONE-029` Search works across core entities.
- [ ] `DONE-030` CSV import works.
- [ ] `DONE-031` CSV export works.
- [ ] `DONE-032` Audit logs work.
- [ ] `DONE-033` Backup process works.
- [ ] `DONE-034` Backup restoration has been tested.
- [ ] `DONE-035` Security testing has been completed.
- [ ] `DONE-036` Critical APIs enforce tenant isolation.
- [ ] `DONE-037` Mobile-responsive interfaces have been tested.
- [ ] `DONE-038` AI failure does not break core CRM.
- [ ] `DONE-039` AI output is separated from factual CRM records.
- [ ] `DONE-040` Production monitoring and error logging are operational.

---

# 47. D&Z CRM Core Module Navigation

The minimum primary navigation should expose the following modules according to user permissions:

- [ ] Dashboard
- [ ] Leads
- [ ] Customers
- [ ] Motorcycles / Vehicles
- [ ] Sales Pipeline
- [ ] Test Rides
- [ ] Service Bookings
- [ ] Workshop
- [ ] Job Cards
- [ ] Technicians
- [ ] Parts / Inventory
- [ ] Tasks
- [ ] Reminders
- [ ] Automations
- [ ] Campaigns
- [ ] Loyalty
- [ ] Referrals
- [ ] Analytics
- [ ] Reports
- [ ] Branches
- [ ] Users
- [ ] Integrations
- [ ] Settings

---

# 48. Primary Product Principle

The fundamental product requirement for D&Z AI CRM is:

> **One customer, one motorcycle history, one CRM record, one operational timeline — across sales, service, parts, communication, loyalty, and every authorized D&Z dealer branch.**

Any feature that creates separate disconnected customer databases, requires repeated manual entry of the same customer information, or prevents authorized teams from seeing the complete customer relationship violates this requirement.

---

# 49. V1 Success Criteria

D&Z AI CRM V1 must enable a motorcycle dealer to run the following business loop entirely through the system:

**Acquire → Respond → Follow Up → Sell → Book → Service → Record → Remind → Retain → Refer → Measure → Repeat**

The system succeeds when a dealer can clearly answer, from one platform:

- [ ] Who are my customers?
- [ ] What motorcycles do they own?
- [ ] Where did each lead come from?
- [ ] Who is following up each lead?
- [ ] Which leads are being ignored?
- [ ] Which leads converted?
- [ ] Who has a test ride scheduled?
- [ ] Who has a service appointment?
- [ ] What jobs are in the workshop?
- [ ] Which technician is handling each job?
- [ ] Which motorcycles are waiting for parts?
- [ ] Which motorcycles are ready for collection?
- [ ] What work has previously been completed on each motorcycle?
- [ ] Which customers are due for service?
- [ ] Which reminders have been sent?
- [ ] Which reminders generated bookings?
- [ ] Which customers are returning?
- [ ] Which customers have stopped visiting?
- [ ] Which parts are running low?
- [ ] Which branches are performing best?
- [ ] Which salespeople are converting best?
- [ ] Which services generate the most revenue?
- [ ] Which campaigns generate business?
- [ ] Which customers are most loyal?
- [ ] What should the team follow up today?
- [ ] Where can AI remove repetitive manual work?
