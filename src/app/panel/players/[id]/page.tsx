import Link from "next/link";
import { ArrowLeft, Ban, Car, CircleDollarSign, Shield, UserRound } from "lucide-react";
import { EmptyState, PageHeader, Surface } from "@/components/PanelPrimitives";
import { StatusBadge } from "@/components/StatusBadge";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Link href="/panel/players" className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
        <ArrowLeft className="h-4 w-4" />
        Back to players
      </Link>
      <PageHeader
        title="Player Profile"
        description={`Safe placeholder profile for ${id}. This page is prepared for future vehicles, money, faction, and punishment history.`}
        stats={[{ label: "Profile ID", value: id }, { label: "Live sync", value: "Pending" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Surface className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.055]">
              <UserRound className="h-8 w-8 text-sky-100" />
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-50">Player Placeholder</div>
              <div className="mt-1 text-sm text-zinc-400">Offline • Not synced yet</div>
              <div className="mt-3"><StatusBadge label="Read-only profile" tone="pending" /></div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProfileMetric icon={<CircleDollarSign className="h-4 w-4" />} label="Cash / Bank" value="$0 / $0" />
            <ProfileMetric icon={<Shield className="h-4 w-4" />} label="Faction" value="Not connected" />
            <ProfileMetric icon={<Car className="h-4 w-4" />} label="Vehicles" value="0 synced" />
            <ProfileMetric icon={<Ban className="h-4 w-4" />} label="Punishments" value="0 synced" />
          </div>
        </Surface>

        <div className="grid gap-4">
          <Surface className="p-5">
            <div className="text-sm font-semibold text-zinc-100">Vehicles</div>
            <div className="mt-4"><EmptyState title="No vehicles synced yet" description="Future player-owned vehicles will appear here." /></div>
          </Surface>
          <Surface className="p-5">
            <div className="text-sm font-semibold text-zinc-100">Punishment History</div>
            <div className="mt-4"><EmptyState title="No punishment history synced yet" description="Warnings, bans, jail, and appeal notes will appear here later." /></div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function ProfileMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">{icon}{label}</div>
      <div className="mt-2 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}
