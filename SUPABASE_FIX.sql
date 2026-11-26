-- Run in Supabase SQL Editor if the public QR lookup returns 401/403.
-- This grants execution of the existing public verification function only.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_certificate(text) TO anon, authenticated;

-- Confirm the function is present and uses SECURITY DEFINER:
SELECT p.proname, p.prosecdef AS security_definer,
       pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_certificate';
