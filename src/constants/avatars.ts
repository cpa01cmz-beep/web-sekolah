export const AVATAR_BASE_URL = 'https://i.pravatar.cc/150';

export const DEFAULT_AVATARS: Record<string, string> = {
  student01: `${AVATAR_BASE_URL}?u=student01`,
  teacher01: `${AVATAR_BASE_URL}?u=teacher01`,
  parent01: `${AVATAR_BASE_URL}?u=parent01`,
  admin01: `${AVATAR_BASE_URL}?u=admin01`,
} as const;

export const getAvatarUrl = (userId: string): string => {
  return `${AVATAR_BASE_URL}?u=${encodeURIComponent(userId)}`;
};
