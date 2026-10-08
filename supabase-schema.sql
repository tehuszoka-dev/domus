-- ============================================================================
-- DOMUS â€” SMART HOME SYSTEM | CONFIGURAÃ‡ÃƒO DO SUPABASE AUTH & PROFILES
-- ============================================================================
-- Como executar:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique no Ã­cone "SQL Editor"
-- 3. Clique em "New Query", cole todo o conteÃºdo deste arquivo e clique em "Run"
-- ============================================================================

-- 1. CriaÃ§Ã£o da tabela de perfis de usuÃ¡rios vinculada ao Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HabilitaÃ§Ã£o obrigatÃ³ria do Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. PolÃ­ticas de SeguranÃ§a (RLS): Cada usuÃ¡rio sÃ³ acessa o seu prÃ³prio perfil
drop policy if exists "Usuarios podem ver o proprio perfil" on public.profiles;
create policy "Usuarios podem ver o proprio perfil"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Usuarios podem inserir o proprio perfil" on public.profiles;
create policy "Usuarios podem inserir o proprio perfil"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Usuarios podem atualizar o proprio perfil" on public.profiles;
create policy "Usuarios podem atualizar o proprio perfil"
  on public.profiles
  for update
  using (auth.uid() = id);


-- 4. FunÃ§Ã£o e Trigger para criar automaticamente a linha do perfil quando um novo usuÃ¡rio se cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado automaticamente apÃ³s novo cadastro em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();