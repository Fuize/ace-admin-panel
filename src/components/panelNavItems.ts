import type { LucideIcon } from "lucide-react";
import { Activity, Bell, BookOpenText, Building2, Car, ClipboardList, Gauge, HeartPulse, History, KeyRound, Map as MapIcon, Megaphone, ScrollText, Settings, Shield, Siren, User, Users2, Wrench } from "lucide-react";

export type PanelNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: string | null;
  keywords: string[];
};

export const panelNavItems: PanelNavItem[] = [
  { href: "/panel", label: "Dashboard", description: "Workspace overview", icon: Activity, permission: "dashboard.view", keywords: ["home", "overview", "status"] },
  { href: "/panel/players", label: "Players", description: "Future player sync", icon: User, permission: "players.view", keywords: ["users", "characters"] },
  { href: "/panel/reports", label: "Reports", description: "Player tickets", icon: ClipboardList, permission: null, keywords: ["tickets", "support", "assigned"] },
  { href: "/panel/punishments", label: "Punishments", description: "Warns, bans, jail history", icon: Siren, permission: null, keywords: ["warn", "ban", "kick", "jail"] },
  { href: "/panel/vehicles", label: "Vehicles", description: "Future vehicle sync", icon: Car, permission: "vehicles.view", keywords: ["cars", "garage"] },
  { href: "/panel/vehicle-catalog", label: "Vehicle Catalog", description: "Car image/name slots", icon: Wrench, permission: "vehicles.view", keywords: ["catalog", "images", "models"] },
  { href: "/panel/businesses", label: "Businesses", description: "Future business sync", icon: Building2, permission: "businesses.view", keywords: ["shops", "companies"] },
  { href: "/panel/fractions", label: "Fractions", description: "Future faction sync", icon: Users2, permission: "factions.view", keywords: ["factions", "groups"] },
  { href: "/panel/map", label: "Map", description: "Server map tools", icon: MapIcon, permission: "dashboard.view", keywords: ["blips", "locations"] },
  { href: "/panel/admins", label: "Admins", description: "Staff directory", icon: Shield, permission: "admins.view", keywords: ["staff", "team"] },
  { href: "/panel/staff-activity", label: "Staff Activity", description: "Online time and worklog", icon: HeartPulse, permission: null, keywords: ["staff", "activity", "online", "reports"] },
  { href: "/panel/roles", label: "Roles", description: "Ranks and permissions", icon: KeyRound, permission: "roles.view", keywords: ["rank", "permissions"] },
  { href: "/panel/audit", label: "Audit", description: "Admin activity", icon: History, permission: "audit_logs.view", keywords: ["activity", "history"] },
  { href: "/panel/server-health", label: "Server Health", description: "Sync and service status", icon: Gauge, permission: null, keywords: ["uptime", "status", "health"] },
  { href: "/panel/announcements", label: "Announcements", description: "Staff notes and drafts", icon: Megaphone, permission: null, keywords: ["broadcast", "news", "notes"] },
  { href: "/panel/changelog", label: "Changelog", description: "Panel updates", icon: BookOpenText, permission: null, keywords: ["updates", "release", "changes"] },
  { href: "/panel/logs", label: "Logs", description: "Future server logs", icon: ScrollText, permission: "logs.view", keywords: ["server", "events"] },
  { href: "/panel/settings", label: "Settings", description: "Workspace preferences", icon: Settings, permission: null, keywords: ["preferences", "profile"] },
];
