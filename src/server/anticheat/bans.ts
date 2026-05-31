export interface BanRecord {
  username: string;
  reason: string;
  expiresAt: number;
}

const bans: Record<string, BanRecord> = {};

export function isBanned(username: string): BanRecord | null {
  const ban = bans[username];
  if (ban && Date.now() < ban.expiresAt) {
    return ban;
  }
  if (ban && Date.now() >= ban.expiresAt) {
    delete bans[username];
  }
  return null;
}

export function banPlayer(
  username: string,
  reason: string,
  durationMs: number = 300000,
) {
  bans[username] = {
    username,
    reason,
    expiresAt: Date.now() + durationMs,
  };
  console.log(
    `[VANGUARD BAN] ${username} banido por: ${reason} (Duração: ${durationMs / 1000}s)`,
  );
}
