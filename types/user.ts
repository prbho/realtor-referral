export type Role = "USER" | "REALTOR" | "ADMIN";

export type Referral = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  image: string | null;
  nin: string | null;
};

export type UserRow = {
  isSuperAdmin: boolean;
  image: string | null;
  id: string;
  name: string | null;
  email: string;
  role: Role;
  referralCode: string | null;
  referralCount: number;
  commission: number;
  createdAt: string;
  phone: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  referrals: Referral[];
  nin: string | null;
  ninVerified: boolean;
  referredBy: { name: string; id: string } | null;
};

// ─── Define the shape of the form data ─────────────────────────
export type FormData = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nin: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export type Realtor = {
  id: string;
  name: string | null;
  image: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string;
  createdAt: string;
};
