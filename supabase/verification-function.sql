-- Run AFTER the existing ICES setup SQL.
-- This function returns the saved certificate data so the public page can show
-- the exact fields that were saved when the QR link was created.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'certificate_no', c.certificate_no,
    'data', c.data,
    'revoked', c.revoked,
    'revoked_reason', c.revoked_reason,
    'issued_at', c.created_at
  )
  FROM public.certificates AS c
  WHERE c.token = p_token
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
-- The previous get_certificate() function also exposes the full data JSON.
-- Disable its anonymous execution so there is only one public QR lookup path.
REVOKE EXECUTE ON FUNCTION public.get_certificate(text) FROM anon;
