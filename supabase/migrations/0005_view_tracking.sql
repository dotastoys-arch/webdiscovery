-- View-tracking op preview-sites (weet wanneer een lead de preview bekijkt).
alter table generated_sites add column if not exists viewed_at timestamptz;
alter table generated_sites add column if not exists view_count int not null default 0;
