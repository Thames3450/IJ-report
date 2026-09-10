-- IJ Maintenance React V5
-- Supabase Project: IJ Maintenance
-- Project ref: qayjiotahrtlnlpfbktg
-- Master Asset: 68 items (53 Injection + 6 Crane + 9 Vacuum Pump)

create table if not exists public.machines (
  machine_code text primary key,
  display_name text,
  zone text not null check (zone in ('A1','A2','A3','A4','UTILITY')),
  asset_type text not null default 'INJECTION' check (asset_type in ('INJECTION','CRANE','VACUUM_PUMP')),
  has_robot boolean not null default true,
  location_detail text,
  plant_group text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id text primary key,
  machine_code text not null references public.machines(machine_code) on update cascade,
  inspector text not null,
  inspected_at timestamptz not null default now(),
  items jsonb not null default '[]'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.defects (
  id text primary key,
  machine_code text not null references public.machines(machine_code) on update cascade,
  component text,
  problem text not null,
  location text,
  priority text not null default 'B' check (priority in ('A','B','C')),
  required_stop_minutes integer not null default 0 check (required_stop_minutes >= 0),
  estimated_repair_minutes integer not null default 0 check (estimated_repair_minutes >= 0),
  parts_status text not null default 'NONE' check (parts_status in ('READY','NOT_READY','NONE')),
  recommended_action text,
  status text not null default 'OPEN' check (status in ('OPEN','DONE')),
  photo_url text, -- legacy before photo field
  before_photo_url text,
  after_photo_url text,
  resolution_action text,
  resolution_result text,
  completed_by_name text,
  completed_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);



-- V6 evidence workflow upgrade for existing databases
alter table public.defects add column if not exists before_photo_url text;
alter table public.defects add column if not exists after_photo_url text;
alter table public.defects add column if not exists resolution_action text;
alter table public.defects add column if not exists resolution_result text;
alter table public.defects add column if not exists completed_by_name text;
update public.defects set before_photo_url = photo_url where before_photo_url is null and photo_url is not null;

alter table public.machines enable row level security;
alter table public.inspections enable row level security;
alter table public.defects enable row level security;

drop policy if exists machines_authenticated_read on public.machines;
create policy machines_authenticated_read on public.machines for select to authenticated using (true);
drop policy if exists inspections_authenticated_all on public.inspections;
create policy inspections_authenticated_all on public.inspections for all to authenticated using (true) with check (true);
drop policy if exists defects_authenticated_all on public.defects;
create policy defects_authenticated_all on public.defects for all to authenticated using (true) with check (true);

-- Apply/refresh the complete IJ asset master.
alter table public.machines drop constraint if exists machines_zone_check;
alter table public.machines drop constraint if exists machines_asset_type_check;

alter table public.machines
  add column if not exists display_name text,
  add column if not exists asset_type text not null default 'INJECTION',
  add column if not exists location_detail text,
  add column if not exists plant_group text,
  add column if not exists sort_order integer not null default 0;

update public.machines set display_name = machine_code where display_name is null;

alter table public.machines
  add constraint machines_zone_check check (zone in ('A1','A2','A3','A4','UTILITY')),
  add constraint machines_asset_type_check check (asset_type in ('INJECTION','CRANE','VACUUM_PUMP'));

insert into public.machines
(machine_code, display_name, zone, asset_type, has_robot, location_detail, plant_group, sort_order, active)
values
('850T-16','850T-16','A1','INJECTION',true,'Zone A1',null,1,true),
('850T-17','850T-17','A1','INJECTION',true,'Zone A1',null,2,true),
('850T-18','850T-18','A1','INJECTION',true,'Zone A1',null,3,true),
('650T-1','650T-1','A1','INJECTION',true,'Zone A1',null,4,true),
('650T-2','650T-2','A1','INJECTION',true,'Zone A1',null,5,true),
('650T-3','650T-3','A1','INJECTION',true,'Zone A1',null,6,true),
('650T-4','650T-4','A1','INJECTION',true,'Zone A1',null,7,true),
('650T-5','650T-5','A1','INJECTION',true,'Zone A1',null,8,true),
('650T-6','650T-6','A1','INJECTION',true,'Zone A1',null,9,true),
('650T-7','650T-7','A2','INJECTION',true,'Zone A2',null,10,true),
('650T-8','650T-8','A2','INJECTION',true,'Zone A2',null,11,true),
('650T-9','650T-9','A2','INJECTION',true,'Zone A2',null,12,true),
('650T-10','650T-10','A2','INJECTION',true,'Zone A2',null,13,true),
('650T-11','650T-11','A2','INJECTION',true,'Zone A2',null,14,true),
('650T-12','650T-12','A2','INJECTION',true,'Zone A2',null,15,true),
('650T-13','650T-13','A2','INJECTION',true,'Zone A2',null,16,true),
('650T-14','650T-14','A2','INJECTION',true,'Zone A2',null,17,true),
('650T-15','650T-15','A2','INJECTION',true,'Zone A2',null,18,true),
('350T-1','350T-1','A3','INJECTION',true,'Zone A3',null,19,true),
('350T-2','350T-2','A3','INJECTION',true,'Zone A3',null,20,true),
('350T-3','350T-3','A3','INJECTION',true,'Zone A3',null,21,true),
('350T-4','350T-4','A3','INJECTION',true,'Zone A3',null,22,true),
('350T-5','350T-5','A3','INJECTION',true,'Zone A3',null,23,true),
('350T-6','350T-6','A3','INJECTION',true,'Zone A3',null,24,true),
('350T-7','350T-7','A3','INJECTION',true,'Zone A3',null,25,true),
('350T-8','350T-8','A3','INJECTION',true,'Zone A3',null,26,true),
('350T-9','350T-9','A3','INJECTION',true,'Zone A3',null,27,true),
('350T-10','350T-10','A3','INJECTION',true,'Zone A3',null,28,true),
('230T-3','230T-3','A3','INJECTION',false,'Zone A3',null,29,true),
('230T-4','230T-4','A3','INJECTION',false,'Zone A3',null,30,true),
('230T-5','230T-5','A3','INJECTION',false,'Zone A3',null,31,true),
('75T-4','75T-4','A3','INJECTION',false,'Zone A3',null,32,true),
('75T-5','75T-5','A3','INJECTION',false,'Zone A3',null,33,true),
('450T-7','450T-7','A4','INJECTION',true,'Zone A4',null,34,true),
('650T-16','650T-16','A4','INJECTION',true,'Zone A4',null,35,true),
('650T-17','650T-17','A4','INJECTION',true,'Zone A4',null,36,true),
('650T-18','650T-18','A4','INJECTION',true,'Zone A4',null,37,true),
('650T-19','650T-19','A4','INJECTION',true,'Zone A4',null,38,true),
('650T-20','650T-20','A4','INJECTION',true,'Zone A4',null,39,true),
('650T-21','650T-21','A4','INJECTION',true,'Zone A4',null,40,true),
('650T-22','650T-22','A4','INJECTION',true,'Zone A4',null,41,true),
('650T-23','650T-23','A4','INJECTION',true,'Zone A4',null,42,true),
('500T-1','500T-1','A4','INJECTION',true,'Zone A4',null,43,true),
('500T-2','500T-2','A4','INJECTION',true,'Zone A4',null,44,true),
('500T-3','500T-3','A4','INJECTION',true,'Zone A4',null,45,true),
('320T-1','320T-1','A4','INJECTION',true,'Zone A4',null,46,true),
('320T-2','320T-2','A4','INJECTION',true,'Zone A4',null,47,true),
('320T-3','320T-3','A4','INJECTION',true,'Zone A4',null,48,true),
('320T-4','320T-4','A4','INJECTION',true,'Zone A4',null,49,true),
('320T-5','320T-5','A4','INJECTION',true,'Zone A4',null,50,true),
('320T-6','320T-6','A4','INJECTION',true,'Zone A4',null,51,true),
('320T-7','320T-7','A4','INJECTION',true,'Zone A4',null,52,true),
('320T-8','320T-8','A4','INJECTION',true,'Zone A4',null,53,true),
('CRANE-01','Crane No.1','A1','CRANE',false,'Zone A1',null,54,true),
('CRANE-02','Crane No.2','A2','CRANE',false,'Zone A2',null,55,true),
('CRANE-03','Crane No.3','A3','CRANE',false,'Zone A3',null,56,true),
('CRANE-04','Crane No.4','A4','CRANE',false,'Zone A4 · 650T-16 to 650T-23',null,57,true),
('CRANE-05','Crane No.5','A4','CRANE',false,'Zone A4 · Behind material suction room',null,58,true),
('CRANE-06','Crane No.6','A4','CRANE',false,'Zone A4 · 500T-1 to 320T-8',null,59,true),
('VP-OLD-01','Vacuum Pump No.1 (Old Plant)','UTILITY','VACUUM_PUMP',false,'Old Plant / โรงเก่า','OLD_PLANT',60,true),
('VP-OLD-02','Vacuum Pump No.2 (Old Plant)','UTILITY','VACUUM_PUMP',false,'Old Plant / โรงเก่า','OLD_PLANT',61,true),
('VP-OLD-03','Vacuum Pump No.3 (Old Plant)','UTILITY','VACUUM_PUMP',false,'Old Plant / โรงเก่า','OLD_PLANT',62,true),
('VP-NEW-01','Vacuum Pump No.1 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',63,true),
('VP-NEW-02','Vacuum Pump No.2 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',64,true),
('VP-NEW-03','Vacuum Pump No.3 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',65,true),
('VP-NEW-04','Vacuum Pump No.4 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',66,true),
('VP-NEW-05','Vacuum Pump No.5 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',67,true),
('VP-NEW-06','Vacuum Pump No.6 (New Plant)','UTILITY','VACUUM_PUMP',false,'New Plant / โรงใหม่','NEW_PLANT',68,true)
on conflict (machine_code) do update set
  display_name = excluded.display_name,
  zone = excluded.zone,
  asset_type = excluded.asset_type,
  has_robot = excluded.has_robot,
  location_detail = excluded.location_detail,
  plant_group = excluded.plant_group,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();


-- Storage bucket 'defect-photos' is configured in the live project.
-- Public read + authenticated insert/update/delete.
