# IJ Maintenance Unified System v11

Enterprise KPI and maintenance control UI for IJ Department.

## v11 highlights
- Enterprise KPI dashboard with actual MPR Maintenance data
- Breakdown Loss Time as a first-class KPI
- Adaptive trend granularity: daily / weekly / monthly based on selected period
- Availability, MTBF, MTTR, Loss Rate, TPM Completion and PM Compliance
- Loss Time & Breakdown Frequency combo chart
- Pareto by machine and symptom
- Machine Loss & Reliability Ranking
- Month-range and custom-date filtering
- Responsive desktop/tablet/mobile UI
- English with Thai subtitles

Use the existing MPR Maintenance Supabase project and environment variables.

## Run
```bash
npm install
npm run dev
```


## v11.2 update
- Machine Condition Inspection now supports photo evidence when a check point is marked **Abnormal / ผิดปกติ**.
- Recommended migration: run `supabase/schema_v6_additions.sql`.
- Create a Supabase Storage bucket named `ij-inspection-photos` (public) for mobile/web photo upload.


## v12 — Defect Register & Follow-up Action Tracker
- **Defects** now records only the abnormal condition: machine, finding, risk, A/B/C priority and photo evidence.
- Defect photos support mobile camera or file upload (up to 4 photos, 10 MB each) and are stored in the private `ij-defect-photos` bucket.
- **Follow-up** no longer creates duplicate defect records. It manages the action plan on an existing defect: owner, temporary action, permanent action, target date, spare requirement, machine stop, verification and closure.
- New workflow: Defect → Follow-up Action → Verification → Closed.
- Live MPR Supabase migration `ij_defect_followup_split_v12` has already been applied. Reference SQL: `supabase/schema_v7_defect_followup.sql`.


## v12.2 KPI calculation correction
- Multi-machine KPI now separates **Maintenance Efficiency** from conventional **Fleet Availability**.
- Maintenance Efficiency = `(period hours - accumulated breakdown loss hours) / period hours × 100`.
- Fleet Availability is retained as an engineering reference and is explicitly labeled.
- Multi-machine Loss Rate uses accumulated Breakdown Loss Time divided by the selected calendar-period hours instead of total fleet machine-hours.
- Single-machine Availability keeps the conventional machine formula.


## v12.3 TPM / PM Calendar
- TPM / PM now opens as a maintenance calendar with Month / Week / List views.
- PM due dates and TPM jobs appear together in the same calendar.
- Clicking a date shows the day agenda and can prefill the Create Plan date.
- Sundays are visually marked as the preferred TPM planning day.
- Mobile view supports swipeable month calendar and compact event dots.
