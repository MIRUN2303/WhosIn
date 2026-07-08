-- Allow authenticated role full access (fixes RLS blocking after login)
-- AND auto-create a public.users row when a new auth user signs up

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users','groups','group_members','events','attendance','leagues','teams','matches','announcements','friendships','stories','notifications'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON %I', tbl);
    EXECUTE format('CREATE POLICY authenticated_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

-- Trigger: auto-create public.users row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, name, username, email, password, profile_code,
    avatar, cover_image,
    bio, favourite_sports, badges,
    total_matches, wins, losses, attendance_rate,
    current_streak, longest_streak, win_rate,
    weekly_activity, points_total, mvp_count,
    created_groups, joined_groups, joined_at, level, xp
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', SPLIT_PART(new.email, '@', 1)),
    LOWER(COALESCE(new.raw_user_meta_data ->> 'name', SPLIT_PART(new.email, '@', 1))),
    new.email,
    '',
    UPPER(SPLIT_PART(COALESCE(new.raw_user_meta_data ->> 'name', new.email), ' ', 1)) || '001',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=' || REPLACE(COALESCE(new.raw_user_meta_data ->> 'name', new.email), ' ', '%20') || '&backgroundColor=b6e3f4',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    '', '{}', '{}',
    0, 0, 0, 0, 0, 0, 0,
    '{0,0,0,0,0,0,0}', 0, 0,
    '{}', '{}',
    NOW()::date, 1, 0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
