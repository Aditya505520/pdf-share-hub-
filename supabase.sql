create table if not exists public.pdfs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text not null,
  file_url text not null,
  storage_path text,
  status text not null default 'approved' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.pdfs enable row level security;

-- Public users can only read approved PDFs.
create policy "Public can view approved PDFs"
on public.pdfs for select
using (status = 'approved');

-- Authenticated admins can manage rows.
-- For production, replace this with a stricter admin-role check
-- (for example, a profiles table + JWT role claim).
create policy "Authenticated users can insert PDFs"
on public.pdfs for insert to authenticated
with check (true);

create policy "Authenticated users can update PDFs"
on public.pdfs for update to authenticated
using (true) with check (true);

create policy "Authenticated users can delete PDFs"
on public.pdfs for delete to authenticated
using (true);

-- Storage bucket:
-- Create a bucket named "pdfs" in Supabase Storage.
-- Then configure Storage policies so only authenticated admins can upload/delete,
-- while public read access is allowed for approved files.
