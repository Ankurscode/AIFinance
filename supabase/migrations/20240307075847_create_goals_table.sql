-- Create the goals table
create table if not exists public.goals (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    category text not null,
    target numeric not null,
    current numeric not null default 0,
    deadline date not null,
    description text,
    status text not null default 'in_progress'::text,
    check (status in ('in_progress', 'completed'))
);

-- Enable Row Level Security
alter table public.goals enable row level security;

-- Create policy to allow users to read their own goals
create policy "Users can read their own goals"
    on public.goals
    for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own goals
create policy "Users can insert their own goals"
    on public.goals
    for insert
    with check (auth.uid() = user_id);

-- Create policy to allow users to update their own goals
create policy "Users can update their own goals"
    on public.goals
    for update
    using (auth.uid() = user_id);

-- Create policy to allow users to delete their own goals
create policy "Users can delete their own goals"
    on public.goals
    for delete
    using (auth.uid() = user_id); 