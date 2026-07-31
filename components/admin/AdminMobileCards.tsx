// components/admin/AdminMobileCards.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, Trash } from "lucide-react";
import { UserRow } from "@/types/user";
import UserAvatar from "./UserAvatar";

type Role = "USER" | "REALTOR" | "ADMIN";

interface AdminMobileCardsProps {
  users: UserRow[];
  currentUserId: string;
  selectedIds: Set<string>;
  savingRoleFor: string | null;
  roleError: { userId?: string; message: string } | null;
  onToggleSelect: (id: string) => void;
  onRequestRoleChange: (user: UserRow, newRole: Role) => void;
  onOpenProfile: (user: UserRow) => void;
  onOpenReferrals: (user: UserRow) => void;
  onRequestDelete: (user: UserRow) => void;
  formatShortDate: (d: string | Date) => string;
  formatDateTime: (d: string | Date) => string;
  hasMore: boolean;
  loadMore: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

const ROLE_OPTIONS: Role[] = ["USER", "REALTOR", "ADMIN"];

export default function AdminMobileCards({
  users,
  currentUserId,
  selectedIds,
  savingRoleFor,
  roleError,
  onToggleSelect,
  onRequestRoleChange,
  onOpenProfile,
  onOpenReferrals,
  onRequestDelete,
  formatShortDate,
  formatDateTime,
  hasMore,
  //   loadMore,
  sentinelRef,
}: AdminMobileCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {users.map((user) => {
        const isSelf = user.id === currentUserId;
        const isSaving = savingRoleFor === user.id;
        const isSelected = selectedIds.has(user.id);
        return (
          <div
            key={user.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-3 transition-colors duration-200 group"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(user.id)}
                disabled={isSelf || user.isSuperAdmin}
                aria-label={`Select ${user.name || user.email}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <UserAvatar src={user.image} name={user.name} size={36} />
                  <div>
                    <button
                      onClick={() => onOpenProfile(user)}
                      className="font-medium text-neutral-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left"
                    >
                      {user.name || "—"}
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </p>
                    {user.nin ? (
                      <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> NIN on file
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        <XCircle className="h-3 w-3" /> No NIN
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {!user.isSuperAdmin && user.id !== currentUserId && (
                <button
                  onClick={() => onRequestDelete(user)}
                  className="opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-opacity"
                  aria-label="Delete user"
                >
                  <Trash className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-row items-center gap-1 mt-2">
              <Select
                value={user.role}
                disabled={isSelf || isSaving || user.isSuperAdmin}
                onValueChange={(value) =>
                  onRequestRoleChange(user, value as Role)
                }
              >
                <SelectTrigger className="text-xs font-medium rounded-full px-3 py-1 border-0 bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Change Role</SelectLabel>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300">
                          {r}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {isSaving && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
              )}
              {user.isSuperAdmin && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Super Admin
                </span>
              )}
            </div>

            {roleError?.userId === user.id && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {roleError.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-neutral-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Referrals
                </p>
                {user.referralCount > 0 ? (
                  <button
                    onClick={() => onOpenReferrals(user)}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {user.referralCount}
                  </button>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">0</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Commission
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  ₦{user.commission.toFixed(2)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Joined
                </p>
                <div className="flex flex-col leading-tight">
                  <span className="text-gray-600 dark:text-gray-300">
                    {formatShortDate(user.createdAt)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDateTime(user.createdAt)
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {users.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
          No users match your search.
        </div>
      )}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
        >
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
