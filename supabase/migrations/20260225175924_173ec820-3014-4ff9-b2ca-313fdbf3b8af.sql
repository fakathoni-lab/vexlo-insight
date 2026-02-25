-- Add missing columns from the original plan
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS ip_hash text;

-- Add check constraints for data integrity
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_email_format
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_source_valid
    CHECK (source IN (
      'landing_page','hero_cta','footer_cta','pricing_cta','referral'
    ));