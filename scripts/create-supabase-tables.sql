
-- Create tables in Supabase public schema
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  village TEXT,
  ward TEXT,
  constituency TEXT,
  county TEXT,
  country TEXT DEFAULT 'Kenya' NOT NULL,
  role TEXT DEFAULT 'citizen' NOT NULL,
  level TEXT,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_token TEXT,
  verification_token_expiry TIMESTAMP,
  interests JSONB DEFAULT '[]' NOT NULL,
  profile_complete BOOLEAN DEFAULT FALSE NOT NULL,
  registration_step TEXT DEFAULT 'location' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.officials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  level TEXT NOT NULL,
  position TEXT NOT NULL,
  house_type TEXT,
  representation_type TEXT,
  party TEXT,
  photo TEXT,
  email TEXT,
  phone TEXT,
  village TEXT,
  ward TEXT,
  constituency TEXT,
  county TEXT,
  country TEXT DEFAULT 'Kenya' NOT NULL,
  term_start TIMESTAMP,
  term_end TIMESTAMP,
  responsibilities TEXT,
  social_media JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.communities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id INTEGER REFERENCES public.communities(id),
  description TEXT,
  population INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forums (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  village TEXT,
  ward TEXT,
  constituency TEXT,
  county TEXT,
  moderation_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  membership_type TEXT DEFAULT 'public' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  forum_id INTEGER NOT NULL REFERENCES public.forums(id),
  author_id INTEGER NOT NULL REFERENCES public.users(id),
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES public.posts(id),
  author_id INTEGER NOT NULL REFERENCES public.users(id),
  parent_id INTEGER REFERENCES public.comments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parliamentary_sessions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.development_projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  official_id INTEGER NOT NULL REFERENCES public.officials(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_moderators (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  forum_id INTEGER NOT NULL REFERENCES public.forums(id),
  level TEXT NOT NULL,
  permissions JSONB DEFAULT '["moderate_posts", "delete_comments"]' NOT NULL,
  appointed_by INTEGER REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  forum_id INTEGER NOT NULL REFERENCES public.forums(id),
  role TEXT DEFAULT 'member' NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone_numbers JSONB NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  operating_hours TEXT,
  village TEXT,
  ward TEXT,
  constituency TEXT,
  county TEXT NOT NULL,
  latitude TEXT,
  longitude TEXT,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verified_by INTEGER REFERENCES public.users(id),
  status TEXT DEFAULT 'active' NOT NULL,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  leader_id INTEGER NOT NULL REFERENCES public.officials(id),
  content TEXT NOT NULL,
  rating INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
