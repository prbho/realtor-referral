// app/admin/AdminUsersTable.tsx
"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Users,
  TrendingUp,
  Wallet,
  X,
  User as UserIcon,
  MapPin,
  Landmark,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

type Role = "USER" | "REALTOR" | "ADMIN";

type Referral = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  image: string | null;
};

type UserRow = {
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
};

const ROLE_OPTIONS: Role[] = ["USER", "REALTOR", "ADMIN"];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 5;

const roleBadgeColor = (role: string) =>
  role === "ADMIN"
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    : role === "REALTOR"
    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    : "bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300";

function SummaryCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 px-4 py-8 rounded-lg shadow-md transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${color}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold text-neutral-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeColor(
        role
      )}`}
    >
      {role}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-neutral-800 dark:text-white">{value || "—"}</p>
    </div>
  );
}

function ModalShell({
  isVisible,
  onClose,
  children,
}: {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-150 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col transition-all duration-150 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {(currentPage - 1) * pageSize + 1}–
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [usersState, setUsersState] = useState<UserRow[]>(users);
  const [image, setImage] = useState(users[0]?.image);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [referralUser, setReferralUser] = useState<UserRow | null>(null);
  const [profileUser, setProfileUser] = useState<UserRow | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<{
    userId: string;
    message: string;
  } | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: UserRow;
    newRole: Role;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] =
    useState(DEFAULT_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const activeUser = referralUser || profileUser;

  useEffect(() => {
    if (activeUser) {
      const frame = requestAnimationFrame(() => setIsModalVisible(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [activeUser]);

  const openReferrals = (user: UserRow) => setReferralUser(user);
  const openProfile = (user: UserRow) => {
    setShowAccountNumber(false);
    setProfileUser(user);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setReferralUser(null);
      setProfileUser(null);
    }, 150);
  };

  const requestRoleChange = (user: UserRow, newRole: Role) => {
    if (newRole === user.role) return;
    setPendingRoleChange({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { user, newRole } = pendingRoleChange;
    setPendingRoleChange(null);

    const previous = usersState;
    setUsersState((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    setSavingRoleFor(user.id);
    setRoleError(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUsersState(previous);
        setRoleError({
          userId: user.id,
          message: data.error || "Failed to update role",
        });
        showToast(data.error || "Failed to update role", "error");
      } else {
        showToast(
          `${user.name || user.email}'s role changed to ${newRole}`,
          "success"
        );
      }
    } catch {
      setUsersState(previous);
      const message = "Something went wrong. Please try again.";
      setRoleError({ userId: user.id, message });
      showToast(message, "error");
    } finally {
      setSavingRoleFor(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return usersState.filter((u) => {
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.referralCode?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersState, search, roleFilter]);

  // Reset pagination when filters change. Done during render (not in an
  // effect) per React's guidance for "adjusting state when props change" —
  // comparing against a stored previous key avoids the extra effect-driven
  // render pass that `react-hooks/set-state-in-effect` warns about.
  const filterKey = `${search}|${roleFilter}|${pageSize}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
    setMobileVisibleCount(pageSize);
  }

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const goToPreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const mobileUsers = useMemo(
    () => filteredUsers.slice(0, mobileVisibleCount),
    [filteredUsers, mobileVisibleCount]
  );
  const hasMoreMobile = mobileVisibleCount < filteredUsers.length;

  const loadMoreMobile = useCallback(() => {
    setMobileVisibleCount((count) =>
      Math.min(count + pageSize, filteredUsers.length)
    );
  }, [filteredUsers.length, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMobile) {
          loadMoreMobile();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreMobile, loadMoreMobile]);

  const totals = useMemo(() => {
    return {
      totalUsers: usersState.length,
      totalReferrals: usersState.reduce((sum, u) => sum + u.referralCount, 0),
      totalCommission: usersState.reduce((sum, u) => sum + u.commission, 0),
    };
  }, [usersState]);

  const maskedAccountNumber = (num: string | null) => {
    if (!num) return "—";
    if (num.length <= 4) return num;
    return `•••• ${num.slice(-4)}`;
  };

  const addressLine = (u: UserRow) => {
    const parts = [
      [u.streetAddress, u.apartment].filter(Boolean).join(", "),
      [u.city, u.state, u.zipCode].filter(Boolean).join(", "),
      u.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  const roleFilterItems = [
    { label: "All Roles", value: "ALL" },
    { label: "User", value: "USER" },
    { label: "Realtor", value: "REALTOR" },
    { label: "Admin", value: "ADMIN" },
  ];

  // Helper function to get the role badge color with the select trigger styling
  const getRoleSelectClass = (role: string) => {
    const baseClass = "text-xs font-medium rounded-full px-3 py-1 border-0";
    const colorClass = roleBadgeColor(role);
    return `${baseClass} ${colorClass}`;
  };

  return (
    <div className="mt-10 mb-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white transition-colors duration-200">
          Admin — Users
        </h1>
        <a
          href="/admin/settings"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          System Settings →
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={Users}
          color="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          label="Total Users"
          value={String(totals.totalUsers)}
        />
        <SummaryCard
          icon={TrendingUp}
          color="bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
          label="Total Referrals"
          value={String(totals.totalReferrals)}
        />
        <SummaryCard
          icon={Wallet}
          color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          label="Total Commission"
          value={`₦${totals.totalCommission.toFixed(2)}`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />

        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as "ALL" | Role)}
        >
          <SelectTrigger className="w-full sm:max-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              {roleFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-full sm:max-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Rows per page</SelectLabel>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-x-auto transition-colors duration-200">
        <Table className="w-full text-sm min-w-3xl">
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 text-left text-gray-500 dark:text-gray-400">
              <TableHead className="px-4 py-3 font-medium">Name</TableHead>
              <TableHead className="px-4 py-3 font-medium">Email</TableHead>
              <TableHead className="px-4 py-3 font-medium">Role</TableHead>
              <TableHead className="px-4 py-3 font-medium">Referrals</TableHead>
              <TableHead className="px-4 py-3 font-medium">
                Commission
              </TableHead>
              <TableHead className="px-4 py-3 font-medium">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              const isSaving = savingRoleFor === user.id;

              return (
                <TableRow
                  key={user.id}
                  className="border-b border-gray-200 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors duration-200"
                >
                  <TableCell className="px-4 py-3">
                    <Image
                      src={image || "/avatar.png"}
                      alt={user.name || "Avatar"}
                      width={32}
                      height={32}
                      className="inline-block rounded-full mr-2"
                      unoptimized
                    />
                    <button
                      onClick={() => openProfile(user)}
                      className="font-medium text-neutral-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left"
                    >
                      {user.name || "—"}
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          disabled={isSelf || isSaving}
                          onValueChange={(value) =>
                            requestRoleChange(user, value as Role)
                          }
                        >
                          <SelectTrigger
                            className={getRoleSelectClass(user.role)}
                            title={
                              isSelf
                                ? "You cannot change your own role"
                                : undefined
                            }
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Change Role</SelectLabel>
                              {ROLE_OPTIONS.map((r) => (
                                <SelectItem
                                  key={r}
                                  value={r}
                                  className="cursor-pointer"
                                >
                                  <span
                                    className={`px-2 py-0.5 rounded-full ${roleBadgeColor(
                                      r
                                    )}`}
                                  >
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
                      {roleError?.userId === user.id && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {roleError.message}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {user.referralCount > 0 ? (
                      <button
                        onClick={() => openReferrals(user)}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        {user.referralCount}
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        0
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    ₦{user.commission.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Desktop pagination */}
      <div className="hidden md:block">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredUsers.length}
          pageSize={pageSize}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {mobileUsers.map((user) => {
          const isSelf = user.id === currentUserId;
          const isSaving = savingRoleFor === user.id;

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 space-y-3 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <button
                    onClick={() => openProfile(user)}
                    className="font-medium text-neutral-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left"
                  >
                    {user.name || "—"}
                  </button>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Select
                    value={user.role}
                    disabled={isSelf || isSaving}
                    onValueChange={(value) =>
                      requestRoleChange(user, value as Role)
                    }
                  >
                    <SelectTrigger
                      className={getRoleSelectClass(user.role)}
                      title={
                        isSelf ? "You cannot change your own role" : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Change Role</SelectLabel>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="cursor-pointer"
                          >
                            <span
                              className={`px-2 py-0.5 rounded-full ${roleBadgeColor(
                                r
                              )}`}
                            >
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
                      onClick={() => openReferrals(user)}
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
                  <p className="text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
            No users match your search.
          </div>
        )}

        {hasMoreMobile && (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-4"
          >
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {!hasMoreMobile && filteredUsers.length > pageSize && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
            You&apos;ve reached the end — {filteredUsers.length} users
          </p>
        )}
      </div>

      {/* Referral detail modal */}
      {referralUser && (
        <ModalShell isVisible={isModalVisible} onClose={closeModal}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h2 className="font-semibold text-neutral-800 dark:text-white">
                Referrals by {referralUser.name || referralUser.email}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {referralUser.referralCount} total referral
                {referralUser.referralCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-4 space-y-3">
            {referralUser.referrals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No referrals to show.
              </p>
            ) : (
              referralUser.referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center">
                    <Image
                      src={ref.image || "/avatar.png"}
                      alt={ref.name || "Avatar"}
                      width={32}
                      height={32}
                      className="inline-block rounded-full mr-2"
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-neutral-800 dark:text-white">
                        {ref.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ref.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <RoleBadge role={ref.role} />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModalShell>
      )}

      {/* Full profile detail modal */}
      {profileUser && (
        <ModalShell isVisible={isModalVisible} onClose={closeModal}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h2 className="font-semibold text-neutral-800 dark:text-white">
                {profileUser.name || "—"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={profileUser.role} />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-4 space-y-6">
            {/* Basic info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <UserIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-9">
                <DetailRow label="Email" value={profileUser.email} />
                <DetailRow label="Phone" value={profileUser.phone} />
                <DetailRow
                  label="Referral Code"
                  value={profileUser.referralCode}
                />
                <DetailRow
                  label="Total Referrals"
                  value={String(profileUser.referralCount)}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Address
                </h3>
              </div>
              <div className="pl-9">
                <p className="text-sm text-neutral-800 dark:text-white">
                  {addressLine(profileUser) || (
                    <span className="text-gray-400 dark:text-gray-500">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Banking */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Landmark className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                  Banking Details
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-9">
                <DetailRow
                  label="Account Name"
                  value={profileUser.accountName}
                />
                <DetailRow label="Bank Name" value={profileUser.bankName} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Account Number
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-800 dark:text-white">
                      {showAccountNumber
                        ? profileUser.accountNumber || "—"
                        : maskedAccountNumber(profileUser.accountNumber)}
                    </p>
                    {profileUser.accountNumber && (
                      <button
                        onClick={() => setShowAccountNumber((v) => !v)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={
                          showAccountNumber
                            ? "Hide account number"
                            : "Show account number"
                        }
                      >
                        {showAccountNumber ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Role change confirmation dialog */}
      {pendingRoleChange && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setPendingRoleChange(null)}
        >
          <div
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-semibold text-neutral-800 dark:text-white">
                Change role?
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-loose">
              Are you sure you want to change{" "}
              <span className="font-medium text-neutral-800 dark:text-white">
                {pendingRoleChange.user.name || pendingRoleChange.user.email}
              </span>{" "}
              from <RoleBadge role={pendingRoleChange.user.role} /> to{" "}
              <RoleBadge role={pendingRoleChange.newRole} />?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingRoleChange(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 text-sm font-medium bg-[#0b3264] text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
