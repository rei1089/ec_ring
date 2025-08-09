-- ユーザープロフィールテーブル
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  locale text default 'en',
  home_country text
);

-- 店舗テーブル
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  country text default 'JP',
  created_at timestamptz default now()
);

-- 商品テーブル
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text,
  category text,
  cover_image_url text,
  description text,
  weight_g int, -- 送料概算用（null可）
  created_at timestamptz default now()
);

-- バーコードテーブル
create table public.barcodes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code_type text default 'JAN13',
  code_value text unique not null
);

-- オファーテーブル（商品の価格情報）
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id),
  product_id uuid not null references public.products(id) on delete cascade,
  price_jpy int,
  captured_at timestamptz default now(),
  captured_by_user_id uuid references auth.users(id)
);

-- カートテーブル
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text default 'active',
  created_at timestamptz default now()
);

-- カートアイテムテーブル
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null default 1,
  selected_offer_id uuid references public.offers(id),
  note text
);

-- 未解決スキャンテーブル
create table public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  raw_barcode text,
  photo_url text,
  shop_name_text text,
  price_jpy_text text,
  description text,
  memo text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- カート共有テーブル
create table public.cart_shares (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- RLS（Row Level Security）の設定
alter table public.user_profiles enable row level security;
create policy "own profile" on public.user_profiles
for all using (auth.uid() = id);

alter table public.carts enable row level security;
create policy "own carts" on public.carts
for all using (auth.uid() = user_id);

alter table public.cart_items enable row level security;
create policy "own cart items" on public.cart_items
for all using (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
);

alter table public.captures enable row level security;
create policy "own captures" on public.captures
for all using (auth.uid() = user_id);

alter table public.cart_shares enable row level security;
create policy "own cart shares" on public.cart_shares
for all using (auth.uid() = created_by);

-- 商品、店舗、オファー、バーコードは読み取り全員可、書き込みはadminロールのみ
alter table public.products enable row level security;
create policy "products readable by all" on public.products
for select using (true);

alter table public.shops enable row level security;
create policy "shops readable by all" on public.shops
for select using (true);

alter table public.offers enable row level security;
create policy "offers readable by all" on public.offers
for select using (true);

alter table public.barcodes enable row level security;
create policy "barcodes readable by all" on public.barcodes
for select using (true);
