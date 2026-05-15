import { queryLogs, queryMain } from "./db";
import { safeJson } from "./geo";

type Vec3 = { x: number; y: number; z: number };

function toIso(d: unknown) {
  try {
    return new Date(d as string).toISOString();
  } catch {
    return null;
  }
}

export async function getLegacyPlayers() {
  const rows = await queryMain<any[]>("SELECT uuid, firstname, lastname, fraction, money, bank, adminlvl FROM characters WHERE deleted = 0 ORDER BY uuid DESC LIMIT 300");
  return rows.map((p) => ({
    id: Number(p.uuid),
    name: `${p.firstname} ${p.lastname}`.trim(),
    fraction: p.fraction,
    cash: p.money,
    bank: p.bank ?? 0,
    adminLevel: p.adminlvl,
  }));
}

export async function getLegacyVehicles() {
  const rows = await queryMain<any[]>("SELECT idkey as id, model, number FROM vehicles WHERE isdeleted = 0 ORDER BY idkey DESC LIMIT 300");
  return rows.map((v) => ({
    id: v.id,
    name: v.model,
    plate: v.number,
    picture: `https://picsum.photos/seed/${encodeURIComponent(v.model)}/480/280`,
  }));
}

export async function getLegacyBusinesses() {
  const rows = await queryMain<any[]>("SELECT id, name, enterpoint, blipPosition FROM businesses ORDER BY id ASC");
  return rows.map((b) => ({
    id: b.id,
    name: b.name || `Business #${b.id}`,
    location: safeJson<Vec3>(b.blipPosition) || safeJson<Vec3>(b.enterpoint),
  }));
}

export async function getLegacyFractions() {
  const fractions = await queryMain<any[]>("SELECT id, money, fuellimit, fuelleft FROM fractions ORDER BY id ASC");
  const stocks = await queryMain<any[]>("SELECT fractionid, position FROM fractionstock ORDER BY id ASC");
  const loc = new Map<number, Vec3>();
  for (const s of stocks) {
    if (loc.has(s.fractionid)) continue;
    const p = safeJson<Vec3>(s.position);
    if (p) loc.set(s.fractionid, p);
  }
  return fractions.map((f) => ({
    id: f.id,
    money: f.money,
    fuelLeft: f.fuelleft,
    fuelLimit: f.fuellimit,
    location: loc.get(f.id) || null,
  }));
}

export async function getLegacyLogs(limit: number) {
  const money = await queryLogs<any[]>("SELECT id, time, fromtype, `from`, totype, `to`, amount, tax, comment FROM newmoneylog ORDER BY id DESC LIMIT ?", [Math.ceil(limit / 2)]);
  const kills = await queryLogs<any[]>("SELECT idkey as id, time, killer, victim, weapon FROM killog ORDER BY idkey DESC LIMIT ?", [Math.ceil(limit / 4)]);
  const admin = await queryLogs<any[]>("SELECT idkey as id, time, admin, text FROM adminlog ORDER BY idkey DESC LIMIT ?", [Math.ceil(limit / 4)]);
  const merged: any[] = [];
  for (const m of money) merged.push({ ts: toIso(m.time), type: "Money", text: `#${m.id} From(${m.fromtype}:${m.from}) -> To(${m.totype}:${m.to}) Amount $${m.amount} Tax $${m.tax} (${m.comment})` });
  for (const k of kills) merged.push({ ts: toIso(k.time), type: "Kill", text: `${k.killer} killed ${k.victim} (weapon: ${k.weapon})` });
  for (const a of admin) merged.push({ ts: toIso(a.time), type: "Admin", text: `${a.admin}: ${a.text}` });
  merged.sort((a, b) => (a.ts || "").localeCompare(b.ts || "")).reverse();
  return merged.slice(0, limit);
}

export async function getLegacyMapBlips() {
  const biz = await queryMain<any[]>("SELECT id, name, blipPosition, enterpoint FROM businesses ORDER BY id ASC");
  const out: any[] = [];
  for (const b of biz) {
    const pos = safeJson<Vec3>(b.blipPosition) || safeJson<Vec3>(b.enterpoint);
    if (!pos) continue;
    out.push({ type: "business", id: b.id, name: b.name || `Business #${b.id}`, position: pos });
  }
  const stocks = await queryMain<any[]>("SELECT id, fractionid, position FROM fractionstock ORDER BY id ASC");
  for (const s of stocks) {
    const pos = safeJson<Vec3>(s.position);
    if (!pos) continue;
    out.push({ type: "fraction_stock", id: s.id, name: `Fraction ${s.fractionid} Stock`, position: pos });
  }
  return out;
}
