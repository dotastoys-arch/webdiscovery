-- Google-rating (sterrenscore) per lead, opgehaald via Places.
alter table leads add column if not exists rating numeric;
