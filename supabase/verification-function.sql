-- Run this AFTER your existing ICES setup SQL.
-- QR verification returns only a certificate number and status. It does not
-- expose candidate DOB or the full data JSON to public visitors.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'certificate_no', c.certificate_no,
    'revoked', c.revoked
  )
  FROM public.certificates AS c
  WHERE c.token = p_token
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
-- The old get_certificate() returns the full candidate data JSON. The QR page
-- no longer needs it, so remove anonymous execution to prevent public data leaks.
REVOKE EXECUTE ON FUNCTION public.get_certificate(text) FROM anon;
