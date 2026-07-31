// components/admin/AdminTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface AdminTableProps {
  users: UserRow[];
  currentUserId: string;
  selectedIds: Set<string>;
  savingRoleFor: string | null;
  onToggleSelect: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onRequestRoleChange: (user: UserRow, newRole: Role) => void;
  onOpenProfile: (user: UserRow) => void;
  onOpenReferrals: (user: UserRow) => void;
  onRequestDelete: (user: UserRow) => void;
  formatShortDate: (d: string | Date) => string;
  formatDateTime: (d: string | Date) => string;
}

const ROLE_OPTIONS: Role[] = ["USER", "REALTOR", "ADMIN"];

export default function AdminTable({
  users,
  currentUserId,
  selectedIds,
  savingRoleFor,
  onToggleSelect,
  onToggleAll,
  onRequestRoleChange,
  onOpenProfile,
  onOpenReferrals,
  onRequestDelete,
  formatShortDate,
  formatDateTime,
}: AdminTableProps) {
  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.id));

  return (
    <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto transition-colors duration-200">
      <Table className="w-full text-sm min-w-3xl">
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-slate-900/50 text-left text-gray-500 dark:text-gray-400">
            <TableHead className="px-4 py-3 w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleAll(users.map((u) => u.id))}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-medium">Name</TableHead>
            <TableHead className="px-4 py-3 font-medium">Email</TableHead>
            <TableHead className="px-4 py-3 font-medium">NIN</TableHead>
            <TableHead className="px-4 py-3 font-medium">Role</TableHead>
            <TableHead className="px-4 py-3 font-medium">Referrals</TableHead>
            <TableHead className="px-4 py-3 font-medium">Commission</TableHead>
            <TableHead className="px-4 py-3 font-medium">Joined</TableHead>
            <TableHead className="px-4 py-3 w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isSaving = savingRoleFor === user.id;
            const isSelected = selectedIds.has(user.id);

            return (
              <TableRow
                key={user.id}
                className="border-b border-gray-200 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors duration-200 group"
              >
                <TableCell className="px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(user.id)}
                    disabled={isSelf || user.isSuperAdmin}
                    aria-label={`Select ${user.name || user.email}`}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 truncate">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar src={user.image} name={user.name} />
                    <button
                      onClick={() => onOpenProfile(user)}
                      className="font-medium capitalize text-neutral-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate"
                      title={user.name || ""}
                    >
                      {user.name || "—"}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 max-w-50">
                  <span className="truncate block" title={user.email}>
                    {user.email}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {user.nin ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
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
                                <span className="px-1 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300">
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
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
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
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  ₦{user.commission.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col leading-tight">
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatShortDate(user.createdAt)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDateTime(user.createdAt)
                        .split(" ")
                        .slice(1)
                        .join(" ")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  {!user.isSuperAdmin && user.id !== currentUserId && (
                    <button
                      onClick={() => onRequestDelete(user)}
                      className="opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-opacity"
                      aria-label="Delete user"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No users match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
