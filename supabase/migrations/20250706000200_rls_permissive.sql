-- Allow all operations for anon role (no-auth app)

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users','groups','group_members','events','attendance','leagues','teams','matches','announcements','friendships','stories','notifications'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS anon_all ON %I', tbl);
    EXECUTE format('CREATE POLICY anon_all ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
