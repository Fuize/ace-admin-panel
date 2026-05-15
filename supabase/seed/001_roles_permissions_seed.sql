-- ACE Admin Panel real roles and permissions seed draft.
-- Draft only: run manually after foundation migrations are reviewed and applied.

update public.admin_roles
set is_active = false,
    updated_at = now()
where name in (
  'owner',
  'founder',
  'head_management',
  'management',
  'senior_admin',
  'admin',
  'helper'
);

insert into public.admin_roles (name, label, rank_level, color, is_system, is_active)
values
  ('project_supervisor', 'Project Supervisor', 10, '#ff0000', true, true),
  ('development_team', 'Development Team', 9, '#310010', true, true),
  ('chief_of_graphics', 'Chief of Graphics', 8, '#e91e63', true, true),
  ('chief_administrator', 'Chief Administrator', 7, '#00ccff', true, true),
  ('deputy_chief_administrator_curator', 'Deputy Chief Administrator + Curator of Administrator', 6, '#0045a1', true, true),
  ('senior_administrator', 'Senior Administrator', 5, '#ff9800', true, true),
  ('server_administrator_curator', 'Server Administrator Curator', 4, '#27F52A', true, true),
  ('server_administrator', 'Server Administrator', 3, '#ad1457', true, true)
on conflict (name) do update set
  label = excluded.label,
  rank_level = excluded.rank_level,
  color = excluded.color,
  is_system = excluded.is_system,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.admin_permissions (key, label, description, category, is_dangerous, is_active)
values
  ('dashboard.view', 'View dashboard', 'Open and view the main dashboard.', 'dashboard', false, true),
  ('players.view', 'View players', 'View player and character records.', 'players', false, true),
  ('vehicles.view', 'View vehicles', 'View vehicle records.', 'vehicles', false, true),
  ('businesses.view', 'View businesses', 'View business records.', 'businesses', false, true),
  ('factions.view', 'View factions', 'View faction records.', 'factions', false, true),
  ('logs.view', 'View logs', 'View panel and server logs.', 'logs', false, true),
  ('staff_chat.view', 'View staff chat', 'Read staff chat messages.', 'staff_chat', false, true),
  ('staff_chat.send', 'Send staff chat messages', 'Send messages in staff chat.', 'staff_chat', false, true),
  ('admins.view', 'View admins', 'View admin profile and role data.', 'admins', false, true),
  ('admins.manage', 'Manage admins', 'Create, edit, enable, or disable admins.', 'admins', true, true),
  ('roles.view', 'View roles', 'View roles and permissions.', 'roles', false, true),
  ('roles.manage', 'Manage roles', 'Create, edit, or assign roles and permissions.', 'roles', true, true),
  ('audit_logs.view', 'View audit logs', 'View security and admin activity audit logs.', 'audit_logs', false, true),
  ('future.kick', 'Future kick action', 'Reserved for future player kick actions.', 'future_actions', true, true),
  ('future.ban', 'Future ban action', 'Reserved for future player ban actions.', 'future_actions', true, true),
  ('future.warn', 'Future warn action', 'Reserved for future player warn actions.', 'future_actions', true, true),
  ('future.ragemp.actions', 'Future RAGE:MP actions', 'Reserved for future RAGE:MP server actions.', 'future_actions', true, true)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category,
  is_dangerous = excluded.is_dangerous,
  is_active = excluded.is_active,
  updated_at = now();

with role_permission_matrix(role_name, permission_key) as (
  values
    -- Rank 10: Project Supervisor gets all permissions.
    ('project_supervisor', 'dashboard.view'),
    ('project_supervisor', 'players.view'),
    ('project_supervisor', 'vehicles.view'),
    ('project_supervisor', 'businesses.view'),
    ('project_supervisor', 'factions.view'),
    ('project_supervisor', 'logs.view'),
    ('project_supervisor', 'staff_chat.view'),
    ('project_supervisor', 'staff_chat.send'),
    ('project_supervisor', 'admins.view'),
    ('project_supervisor', 'admins.manage'),
    ('project_supervisor', 'roles.view'),
    ('project_supervisor', 'roles.manage'),
    ('project_supervisor', 'audit_logs.view'),
    ('project_supervisor', 'future.kick'),
    ('project_supervisor', 'future.ban'),
    ('project_supervisor', 'future.warn'),
    ('project_supervisor', 'future.ragemp.actions'),

    -- Rank 9: Development Team gets development/view/manage permissions.
    ('development_team', 'dashboard.view'),
    ('development_team', 'players.view'),
    ('development_team', 'vehicles.view'),
    ('development_team', 'businesses.view'),
    ('development_team', 'factions.view'),
    ('development_team', 'logs.view'),
    ('development_team', 'staff_chat.view'),
    ('development_team', 'staff_chat.send'),
    ('development_team', 'admins.view'),
    ('development_team', 'admins.manage'),
    ('development_team', 'roles.view'),
    ('development_team', 'roles.manage'),
    ('development_team', 'audit_logs.view'),
    ('development_team', 'future.kick'),
    ('development_team', 'future.ban'),
    ('development_team', 'future.warn'),
    ('development_team', 'future.ragemp.actions'),

    -- Rank 8: Chief of Graphics gets graphics/admin view permissions and staff chat.
    ('chief_of_graphics', 'dashboard.view'),
    ('chief_of_graphics', 'players.view'),
    ('chief_of_graphics', 'vehicles.view'),
    ('chief_of_graphics', 'businesses.view'),
    ('chief_of_graphics', 'factions.view'),
    ('chief_of_graphics', 'logs.view'),
    ('chief_of_graphics', 'staff_chat.view'),
    ('chief_of_graphics', 'staff_chat.send'),
    ('chief_of_graphics', 'admins.view'),
    ('chief_of_graphics', 'roles.view'),

    -- Rank 7: Chief Administrator gets high admin management permissions.
    ('chief_administrator', 'dashboard.view'),
    ('chief_administrator', 'players.view'),
    ('chief_administrator', 'vehicles.view'),
    ('chief_administrator', 'businesses.view'),
    ('chief_administrator', 'factions.view'),
    ('chief_administrator', 'logs.view'),
    ('chief_administrator', 'staff_chat.view'),
    ('chief_administrator', 'staff_chat.send'),
    ('chief_administrator', 'admins.view'),
    ('chief_administrator', 'admins.manage'),
    ('chief_administrator', 'roles.view'),
    ('chief_administrator', 'audit_logs.view'),
    ('chief_administrator', 'future.kick'),
    ('chief_administrator', 'future.ban'),
    ('chief_administrator', 'future.warn'),

    -- Rank 6: Deputy Chief Administrator + Curator gets management and staff permissions.
    ('deputy_chief_administrator_curator', 'dashboard.view'),
    ('deputy_chief_administrator_curator', 'players.view'),
    ('deputy_chief_administrator_curator', 'vehicles.view'),
    ('deputy_chief_administrator_curator', 'businesses.view'),
    ('deputy_chief_administrator_curator', 'factions.view'),
    ('deputy_chief_administrator_curator', 'logs.view'),
    ('deputy_chief_administrator_curator', 'staff_chat.view'),
    ('deputy_chief_administrator_curator', 'staff_chat.send'),
    ('deputy_chief_administrator_curator', 'admins.view'),
    ('deputy_chief_administrator_curator', 'admins.manage'),
    ('deputy_chief_administrator_curator', 'roles.view'),
    ('deputy_chief_administrator_curator', 'audit_logs.view'),
    ('deputy_chief_administrator_curator', 'future.kick'),
    ('deputy_chief_administrator_curator', 'future.warn'),

    -- Rank 5: Senior Administrator permissions.
    ('senior_administrator', 'dashboard.view'),
    ('senior_administrator', 'players.view'),
    ('senior_administrator', 'vehicles.view'),
    ('senior_administrator', 'businesses.view'),
    ('senior_administrator', 'factions.view'),
    ('senior_administrator', 'logs.view'),
    ('senior_administrator', 'staff_chat.view'),
    ('senior_administrator', 'staff_chat.send'),
    ('senior_administrator', 'admins.view'),
    ('senior_administrator', 'audit_logs.view'),
    ('senior_administrator', 'future.kick'),
    ('senior_administrator', 'future.warn'),

    -- Rank 4: Server Administrator Curator permissions.
    ('server_administrator_curator', 'dashboard.view'),
    ('server_administrator_curator', 'players.view'),
    ('server_administrator_curator', 'vehicles.view'),
    ('server_administrator_curator', 'businesses.view'),
    ('server_administrator_curator', 'factions.view'),
    ('server_administrator_curator', 'logs.view'),
    ('server_administrator_curator', 'staff_chat.view'),
    ('server_administrator_curator', 'staff_chat.send'),
    ('server_administrator_curator', 'admins.view'),
    ('server_administrator_curator', 'future.kick'),
    ('server_administrator_curator', 'future.warn'),

    -- Rank 3: Server Administrator base permissions.
    ('server_administrator', 'dashboard.view'),
    ('server_administrator', 'players.view'),
    ('server_administrator', 'vehicles.view'),
    ('server_administrator', 'businesses.view'),
    ('server_administrator', 'factions.view'),
    ('server_administrator', 'logs.view'),
    ('server_administrator', 'staff_chat.view'),
    ('server_administrator', 'staff_chat.send'),
    ('server_administrator', 'admins.view'),
    ('server_administrator', 'future.warn')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_matrix rpm
join public.admin_roles r on r.name = rpm.role_name
join public.admin_permissions p on p.key = rpm.permission_key
on conflict (role_id, permission_id) do nothing;
