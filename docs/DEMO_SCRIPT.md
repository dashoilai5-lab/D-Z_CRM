# Master Demo Script — Ahmad's Service Journey (§50)

Precondition: pristine demo data (top bar → **RESET DEMO DATA**).

| # | Persona | Action | Expected |
| --- | --- | --- | --- |
| 1 | Owner | Open /workshop/dashboard | Sales RM4,850 · Jobs 28 · Due 18 · Critical 4 · Top performer Aizat |
| 2 | Owner | Ctrl+K, search "WXY 8812" | Ahmad Danial · Y15ZR · WXY 8812 · 31,800 km |
| 3 | Owner | Open Ahmad's Rider Passport | 11 visits · lifetime RM2,285 · next service due |
| 4 | — | Switch persona → **Customer** | Rider app bottom nav appears |
| 5 | Customer | /rider/book → date, Standard Service → REQUEST BOOKING | Booking created |
| 6 | — | Switch persona → **Workshop Owner** | /workshop/bookings shows the REQUESTED booking |
| 7 | Owner | Confirm booking | Status CONFIRMED |
| 8 | Owner | **Check In**, mileage 31,800, package Standard RM120 | Job created · booking CHECKED_IN |
| 9 | Owner | Job detail → AI Sales Recommendations → **ADD Oil Filter RM25** | Line added (reason: 5,200 km since last replacement) |
| 10 | — | Switch persona → **Mechanic** | /workshop/mechanic shows the job |
| 11 | Mechanic | Start checklist → Engine Oil/Oil Filter/Brake PASS → **Chain WARNING** | Note "Chain is too loose." |
| 12 | Mechanic | Request Customer Approval → Chain Adjustment **RM20** → Send | Job → AWAITING_APPROVAL |
| 13 | — | Switch persona → **Customer** | /rider/approvals shows "ADDITIONAL WORK REQUIRED — CHAIN ADJUSTMENT — RM20" |
| 14 | Customer | **APPROVE RM20** | Approval APPROVED · job → IN_PROGRESS |
| 15 | — | Switch persona → **Mechanic** | Job shows "CUSTOMER APPROVED" |
| 16 | Mechanic | **Complete Service** | Transactional workflow (§27) runs |
| 17 | Customer | /rider/invoices | **DZ-2026-00145 · Standard RM120 + Oil Filter RM25 + Chain Adjustment RM20 = RM165 · PAID** |
| 18 | Customer | /rider/service-history | New verified service at 31,800 km |
| 19 | Customer | /rider/home | Current 31,800 km · **Next Service 34,800 km · Nov 2026** |
| 20 | Owner | /workshop/dashboard | Sales now RM5,015 · jobs 29 · passport 12 visits / RM2,450 |

Reset any time. The same journey is the target of the mandatory Playwright test
`ahmad-complete-service-journey.spec.ts` (§74).
