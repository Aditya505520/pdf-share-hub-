# PDF Hub — Website

A responsive PDF management website with:
- Public browsing, search, view and download
- Admin-only authentication
- Admin-only PDF upload/edit/delete foundation
- Supabase-ready database and storage

## Setup

1. Create a Supabase project.
2. Create a Storage bucket named `pdfs` and make it public if you want direct public PDF URLs.
3. Create the `pdfs` table using `supabase.sql`.
4. Put your Supabase project URL and anon/publishable key into `assets/config.js`.
5. Create the admin account in Supabase Authentication.
6. Host this folder on any static host.

IMPORTANT: Never put a Supabase `service_role`/secret key in the website.

The starter uses status `approved` for admin uploads. Public users can only read approved rows through the intended RLS policy.
