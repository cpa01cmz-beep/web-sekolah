import { AVATAR_BASE_URL, getAvatarUrl } from '@shared/constants';

export { AVATAR_BASE_URL, getAvatarUrl };

export const DEFAULT_AVATARS: Record<string, string> = {
  student01: `${AVATAR_BASE_URL}?u=student01`,
  teacher01: `${AVATAR_BASE_URL}?u=teacher01`,
  parent01: `${AVATAR_BASE_URL}?u=parent01`,
  admin01: `${AVATAR_BASE_URL}?u=admin01`,
} as const;
