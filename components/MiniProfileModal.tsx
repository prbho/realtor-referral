"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react";

interface MiniProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  ninVerified: boolean;
  referralCount: number;
  commission?: number;
  createdAt: string;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  streetAddress?: string | null;
  apartment?: string | null;
  zipCode?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  referrals?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    ninVerified: boolean;
    createdAt: string;
  }[];
  referredBy?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  isSuperAdmin: boolean;
}

const roleBadgeColor = (role: string) =>
  role === "ADMIN"
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    : role === "REALTOR"
    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    : "bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300";

export default function MiniProfileModal({
  userId,
  isOpen,
  onClose,
}: MiniProfileModalProps) {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const isAdmin =
    sessionUser?.role === "ADMIN" || sessionUser?.isSuperAdmin === true;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      // Defer state updates to avoid React's setState-in-effect warning
      setTimeout(() => {
        setUser(null);
        setError(null);
      }, 0);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/user/${userId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load user");
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isOpen, userId]);

  // Early return if no user data
  if (!user && !loading && !error) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        ) : user ? (
          <div className="space-y-4">
            <DialogHeader className="flex flex-row gap-4">
              <UserAvatar src={user.image} name={user.name} size={56} />
              <div>
                <DialogTitle className="text-lg font-semibold capitalize flex items-center gap-2">
                  {user.name || "Unnamed"}
                  {user.ninVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Role
                </span>
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Referrals
                </span>
                <span className="font-medium">{user.referralCount}</span>
              </div>
              {isAdmin && user.commission !== undefined && (
                <div className="col-span-2">
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Commission
                  </span>
                  <span className="font-medium">
                    ₦{user.commission.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {isAdmin && user.referrals && user.referrals.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Referrals ({user.referrals.length})
                  </p>
                </div>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {user.referrals.map((ref) => (
                    <li
                      key={ref.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <UserAvatar src={ref.image} name={ref.name} size={24} />
                      <span className="font-medium truncate">
                        {ref.name || "Unnamed"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                        {ref.role}
                      </span>
                      {ref.ninVerified && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isAdmin && user.referredBy && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-sm">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Referred By
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar
                    src={user.referredBy.image || null}
                    name={user.referredBy.name}
                    size={24}
                  />
                  <span className="font-medium">
                    {user.referredBy.name || "Unknown"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            User not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
