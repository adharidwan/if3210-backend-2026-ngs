import * as repo from "./family.repository";
import {
  FamilyNotFoundServiceError,
  FamilyCodeMismatchServiceError,
  AlreadyFamilyMemberServiceError,
  NotFamilyMemberServiceError,
  InvalidFamilyIconServiceError,
  FamilyCodeGenerationFailedServiceError,
} from "./family.error";
import { normalizeFamilyIconUrl } from "../../shared/config/family-icons";

// --- Blur helpers ---

export function blurName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] + "*".repeat(w.length - 1))
    .join(" ");
}

export function blurEmail(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  return "*".repeat(atIdx) + email.slice(atIdx);
}

// --- Code generation ---

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * 26)];
  return code;
}

// --- Service methods ---

export async function createFamily(userId: number, name: string, iconUrl: string) {
  const normalizedIconUrl = normalizeFamilyIconUrl(iconUrl);
  if (!normalizedIconUrl) throw new InvalidFamilyIconServiceError();

  for (let i = 0; i < 10; i++) {
    const candidate = generateCode();
    try {
      const family = await repo.createFamilyTx(userId, name, normalizedIconUrl, candidate);
      const members = await repo.listFamilyMembers(family.id);
      return {
        id: family.id,
        name: family.name,
        iconUrl: family.iconUrl,
        familyCode: family.familyCode,
        isMember: true,
        createdAt: family.createdAt,
        updatedAt: family.updatedAt,
        members,
      };
    } catch (e: any) {
      if (e?.code === "23505" && e?.constraint?.includes("family_code")) continue;
      throw e;
    }
  }
  throw new FamilyCodeGenerationFailedServiceError();
}

export async function listFamilies() {
  return repo.listFamilySummaries();
}

export async function listMyFamilies(userId: number) {
  const rows = await repo.listJoinedFamiliesWithMembers(userId);
  const map = new Map<number, any>();
  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        iconUrl: r.iconUrl,
        familyCode: r.familyCode,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        members: [],
      });
    }
    map.get(r.id).members.push({
      id: r.memberId,
      fullName: r.memberFullName,
      email: r.memberEmail,
      joinedAt: r.memberJoinedAt,
    });
  }
  return [...map.values()];
}

export async function getFamilyById(familyId: number, userId: number) {
  const family = await repo.findFamilyDetail(familyId);
  if (!family) throw new FamilyNotFoundServiceError();

  const isMember = await repo.isFamilyMember(familyId, userId);
  const members = await repo.listFamilyMembers(familyId);

  if (isMember) {
    return {
      id: family.id,
      name: family.name,
      iconUrl: family.iconUrl,
      familyCode: family.familyCode,
      isMember: true,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
      members,
    };
  }
  return {
    id: family.id,
    name: family.name,
    iconUrl: family.iconUrl,
    isMember: false,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
    members: members.map((m) => ({
      fullName: blurName(m.fullName),
      email: blurEmail(m.email),
    })),
  };
}

export async function joinFamily(userId: number, familyId: number, familyCode: string) {
  const family = await repo.findFamilyDetail(familyId);
  if (!family) throw new FamilyNotFoundServiceError();
  if (family.familyCode.trim() !== familyCode) throw new FamilyCodeMismatchServiceError();
  if (await repo.isFamilyMember(familyId, userId)) throw new AlreadyFamilyMemberServiceError();
  await repo.joinFamily(familyId, userId);
}

export async function leaveFamily(userId: number, familyId: number) {
  const family = await repo.findFamilyDetail(familyId);
  if (!family) throw new FamilyNotFoundServiceError();
  if (!(await repo.isFamilyMember(familyId, userId))) throw new NotFamilyMemberServiceError();
  await repo.leaveFamily(familyId, userId);
}

export async function discoverFamilies(userId: number) {
  const maxId = await repo.findMaxFamilyId();
  if (maxId === 0) return [];

  const collected = new Map<number, any>();
  const tried = new Set<number>();

  for (let round = 0; round < 5 && collected.size < 5; round++) {
    const candidates: number[] = [];
    for (let i = 0; i < 15; i++) {
      const id = Math.floor(Math.random() * maxId) + 1;
      if (!tried.has(id) && !collected.has(id)) {
        candidates.push(id);
        tried.add(id);
      }
    }
    if (candidates.length === 0) break;

    const rows = await repo.listDiscoverFamiliesByIds(candidates, userId);
    // Group by family
    for (const r of rows) {
      if (collected.size >= 5 && !collected.has(r.id)) continue;
      if (!collected.has(r.id)) {
        collected.set(r.id, {
          id: r.id,
          name: r.name,
          iconUrl: r.iconUrl,
          createdAt: r.createdAt,
          members: [],
        });
      }
      if (r.memberFullName) {
        collected.get(r.id).members.push({
          fullName: blurName(r.memberFullName),
          email: blurEmail(r.memberEmail!),
        });
      }
    }
  }
  return [...collected.values()].slice(0, 5);
}
