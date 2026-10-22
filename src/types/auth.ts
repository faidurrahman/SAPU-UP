import { KelurahanId } from './waste';

export type UserRole = 'admin' | 'kelurahan';

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  kelurahanId?: KelurahanId;
  kelurahanName?: string;
}

export interface UserAccountCredential {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  kelurahanId?: KelurahanId;
  kelurahanName?: string;
  normalizedUsername: string;
}

export const USER_ACCOUNTS: UserAccountCredential[] = [
  {
    username: 'admin',
    password: 'samiun15',
    role: 'admin',
    displayName: 'Administrator Kecamatan',
    normalizedUsername: 'admin',
  },
  {
    username: 'Baru',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Baru',
    kelurahanId: 'BARU',
    kelurahanName: 'Kelurahan Baru',
    normalizedUsername: 'baru',
  },
  {
    username: 'Bulogading',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Bulogading',
    kelurahanId: 'BULOGADING',
    kelurahanName: 'Kelurahan Bulogading',
    normalizedUsername: 'bulogading',
  },
  {
    username: 'Lae-Lae',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Lae-Lae',
    kelurahanId: 'LAE-LAE',
    kelurahanName: 'Kelurahan Lae-Lae',
    normalizedUsername: 'lae-lae',
  },
  {
    username: 'Lajangiru',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Lajangiru',
    kelurahanId: 'LAJANGIRU',
    kelurahanName: 'Kelurahan Lajangiru',
    normalizedUsername: 'lajangiru',
  },
  {
    username: 'Losari',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Losari',
    kelurahanId: 'LOSARI',
    kelurahanName: 'Kelurahan Losari',
    normalizedUsername: 'losari',
  },
  {
    username: 'Maloku',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Maloku',
    kelurahanId: 'MALOKU',
    kelurahanName: 'Kelurahan Maloku',
    normalizedUsername: 'maloku',
  },
  {
    username: 'Mangkura',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Mangkura',
    kelurahanId: 'MANGKURA',
    kelurahanName: 'Kelurahan Mangkura',
    normalizedUsername: 'mangkura',
  },
  {
    username: 'Pisang Selatan',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Pisang Selatan',
    kelurahanId: 'PISANG SELATAN',
    kelurahanName: 'Kelurahan Pisang Selatan',
    normalizedUsername: 'pisang selatan',
  },
  {
    username: 'Pisang Utara',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Pisang Utara',
    kelurahanId: 'PISANG UTARA',
    kelurahanName: 'Kelurahan Pisang Utara',
    normalizedUsername: 'pisang utara',
  },
  {
    username: 'Sawerigading',
    password: 'admin12345',
    role: 'kelurahan',
    displayName: 'Kelurahan Sawerigading',
    kelurahanId: 'SAWERIGADING',
    kelurahanName: 'Kelurahan Sawerigading',
    normalizedUsername: 'sawerigading',
  },
];

/**
 * Normalizes username input to handle spaces, hyphens, and case differences
 * e.g., "laelae" or "lae-lae" or "Lae-Lae" -> "lae-lae"
 * e.g., "pisangselatan" or "Pisang Selatan" -> "pisang selatan"
 */
export function normalizeUsername(input: string): string {
  const clean = input.trim().toLowerCase();
  if (clean === 'laelae' || clean === 'lae lae') return 'lae-lae';
  if (clean === 'pisangselatan') return 'pisang selatan';
  if (clean === 'pisangutara') return 'pisang utara';
  return clean;
}

export function authenticateUser(usernameInput: string, passwordInput: string): {
  success: boolean;
  user?: AuthUser;
  error?: string;
} {
  const normalized = normalizeUsername(usernameInput);
  const trimmedPassword = passwordInput.trim();

  const found = USER_ACCOUNTS.find(
    (acc) => acc.normalizedUsername === normalized
  );

  if (!found) {
    return {
      success: false,
      error: 'Username tidak ditemukan. Pastikan username sesuai akun yang terdaftar.',
    };
  }

  if (found.password !== trimmedPassword) {
    return {
      success: false,
      error: 'Password salah. Silakan periksa kembali password Anda.',
    };
  }

  return {
    success: true,
    user: {
      username: found.username,
      role: found.role,
      displayName: found.displayName,
      kelurahanId: found.kelurahanId,
      kelurahanName: found.kelurahanName,
    },
  };
}
