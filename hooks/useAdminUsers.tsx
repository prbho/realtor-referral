// hooks/useAdminUsers.tsx
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { UserRow } from "@/types/user";

type Role = "USER" | "REALTOR" | "ADMIN";

function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getMonth() + 1}/${d.getDate()}/${d
    .getFullYear()
    .toString()
    .slice(2)}`;
}

interface UseAdminUsersReturn {
  usersState: UserRow[];
  setUsersState: React.Dispatch<React.SetStateAction<UserRow[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  roleFilter: "ALL" | Role;
  setRoleFilter: React.Dispatch<React.SetStateAction<"ALL" | Role>>;
  ninVerifiedFilter: "ALL" | "VERIFIED" | "UNVERIFIED";
  setNinVerifiedFilter: React.Dispatch<
    React.SetStateAction<"ALL" | "VERIFIED" | "UNVERIFIED">
  >;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  totalPages: number;
  paginatedUsers: UserRow[];
  filteredUsers: UserRow[];
  mobileUsers: UserRow[];
  hasMoreMobile: boolean;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  isDeleting: boolean;
  toast: { message: string; type: "success" | "error" } | null;
  savingRoleFor: string | null;
  roleError: { title: string; message: string; userId?: string } | null;
  pendingRoleChange: { user: UserRow; newRole: Role } | null;
  setPendingRoleChange: React.Dispatch<
    React.SetStateAction<{ user: UserRow; newRole: Role } | null>
  >;
  pendingDeleteUser: UserRow | null;
  setPendingDeleteUser: React.Dispatch<React.SetStateAction<UserRow | null>>;
  bulkAction: "delete" | "export" | null;
  isBulkConfirmOpen: boolean;
  setIsBulkConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmName: string;
  setConfirmName: React.Dispatch<React.SetStateAction<string>>;
  deleteError: string | null;
  setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
  referralUser: UserRow | null;
  profileUser: UserRow | null;
  isModalVisible: boolean;
  showAccountNumber: boolean;
  setShowAccountNumber: React.Dispatch<React.SetStateAction<boolean>>;
  showNIN: boolean;
  setShowNIN: React.Dispatch<React.SetStateAction<boolean>>;
  printContent: React.ReactNode | null;
  setPrintContent: React.Dispatch<React.SetStateAction<React.ReactNode | null>>;
  currentUserName: string;
  isViewerSuperAdmin: boolean;
  sentinelRef: React.MutableRefObject<HTMLDivElement | null>;
  showToast: (message: string, type?: "success" | "error") => void;
  openReferrals: (user: UserRow) => void;
  openProfile: (user: UserRow) => void;
  closeModal: () => void;
  requestRoleChange: (user: UserRow, newRole: Role) => void;
  confirmRoleChange: () => Promise<void>;
  toggleSelection: (id: string) => void;
  toggleAllOnPage: (pageIds: string[]) => void;
  clearSelection: () => void;
  handleBulkDelete: () => void;
  confirmBulkDelete: () => Promise<void>;
  handleBulkExport: () => void;
  requestDeleteUser: (user: UserRow) => void;
  confirmDeleteUser: () => Promise<void>;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  loadMoreMobile: () => void;
  totals: {
    totalUsers: number;
    totalReferrals: number;
    totalCommission: number;
    ninVerifiedCount: number;
  };
  addressLine: (u: UserRow) => string | null;
  getPrintContent: (user: UserRow) => React.ReactElement;
  maskedAccountNumber: (num: string | null) => string;
  maskedNIN: (nin: string | null) => string;
}

export function useAdminUsers(
  initialUsers: UserRow[],
  currentUserId: string
): UseAdminUsersReturn {
  const [usersState, setUsersState] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [ninVerifiedFilter, setNinVerifiedFilter] = useState<
    "ALL" | "VERIFIED" | "UNVERIFIED"
  >("ALL");
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<{
    title: string;
    message: string;
    userId?: string;
  } | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: UserRow;
    newRole: Role;
  } | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRow | null>(
    null
  );
  const [bulkAction, setBulkAction] = useState<"delete" | "export" | null>(
    null
  );
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [referralUser, setReferralUser] = useState<UserRow | null>(null);
  const [profileUser, setProfileUser] = useState<UserRow | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showNIN, setShowNIN] = useState(false);
  const [printContent, setPrintContent] = useState<React.ReactNode | null>(
    null
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const currentUser = initialUsers.find((u) => u.id === currentUserId);
  const currentUserName = currentUser?.name || currentUser?.email || "";
  const isViewerSuperAdmin = currentUser?.isSuperAdmin ?? false;

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

  useEffect(() => {
    const afterPrint = () => setPrintContent(null);
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, []);

  useEffect(() => {
    if (!printContent) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  }, [printContent]);

  const openReferrals = (user: UserRow) => setReferralUser(user);
  const openProfile = (user: UserRow) => {
    setShowAccountNumber(false);
    setShowNIN(false);
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
          title: "Role Update Failed",
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
      const msg = "Something went wrong. Please try again.";
      setRoleError({ title: "Error", message: msg });
      showToast(msg, "error");
    } finally {
      setSavingRoleFor(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = (pageIds: string[]) => {
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkAction("delete");
    setIsBulkConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsBulkConfirmOpen(false);
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/admin/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk delete failed");
      setUsersState((prev) => prev.filter((u) => !ids.includes(u.id)));
      setSelectedIds(new Set());
      showToast(`Deleted ${ids.length} user(s)`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk delete failed";
      setDeleteError(msg);
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
      setConfirmName("");
    }
  };

  const handleBulkExport = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const selectedUsers = usersState.filter((u) => ids.includes(u.id));
    const headers = [
      "Name",
      "Email",
      "Role",
      "Referrals",
      "Commission",
      "Joined",
      "Phone",
      "City",
      "State",
      "Country",
      "NIN",
      "Account Name",
      "Bank Name",
      "Account Number",
    ];
    const rows = selectedUsers.map((u) => [
      u.name || "",
      u.email,
      u.role,
      u.referralCount,
      u.commission.toFixed(2),
      formatShortDate(u.createdAt),
      u.phone || "",
      u.city || "",
      u.state || "",
      u.country || "",
      u.nin || "",
      u.accountName || "",
      u.bankName || "",
      u.accountNumber || "",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${ids.length} user(s)`, "success");
  };

  const requestDeleteUser = (user: UserRow) => setPendingDeleteUser(user);

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;
    const user = pendingDeleteUser;
    setIsDeleting(true);
    setDeleteError(null);
    setPendingDeleteUser(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setUsersState((prev) => prev.filter((u) => u.id !== user.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
      showToast("User deleted successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setDeleteError(msg);
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filtering & pagination ────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return usersState.filter((u) => {
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.referralCode?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      // ✅ NIN verification filter
      let matchesNin = true;
      if (ninVerifiedFilter === "VERIFIED") {
        matchesNin = u.ninVerified === true;
      } else if (ninVerifiedFilter === "UNVERIFIED") {
        matchesNin = u.ninVerified === false;
      }
      return matchesSearch && matchesRole && matchesNin;
    });
  }, [usersState, search, roleFilter, ninVerifiedFilter]);

  const filterKey = `${search}|${roleFilter}|${pageSize}|${ninVerifiedFilter}`;
  const prevFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (filterKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = filterKey;
      setCurrentPage(1);
      setMobileVisibleCount(pageSize);
    }
  }, [filterKey, pageSize]);

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

  const totals = useMemo(
    () => ({
      totalUsers: usersState.length,
      totalReferrals: usersState.reduce((sum, u) => sum + u.referralCount, 0),
      totalCommission: usersState.reduce((sum, u) => sum + u.commission, 0),
      ninVerifiedCount: usersState.filter((u) => u.ninVerified).length,
    }),
    [usersState]
  );

  const addressLine = (u: UserRow) => {
    const parts = [
      [u.streetAddress, u.apartment].filter(Boolean).join(", "),
      [u.city, u.state, u.zipCode].filter(Boolean).join(", "),
      u.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  const getPrintContent = (user: UserRow): React.ReactElement => (
    <div className="print-profile">
      <div className="print-header">
        <h1>{user.name || "User Profile"}</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Joined: {formatShortDate(user.createdAt)}</p>
      </div>
      <div className="print-section">
        <h2>Basic Information</h2>
        <div className="print-grid">
          <div>
            <span>Phone:</span> {user.phone || "—"}
          </div>
          <div>
            <span>NIN:</span> {user.nin || "—"}
          </div>
          <div>
            <span>Referral Code:</span> {user.referralCode || "—"}
          </div>
          <div>
            <span>Total Referrals:</span> {user.referralCount}
          </div>
        </div>
      </div>
      <div className="print-section">
        <h2>Address</h2>
        <p>{addressLine(user) || "Not provided"}</p>
      </div>
      <div className="print-section">
        <h2>Banking Details</h2>
        <div className="print-grid">
          <div>
            <span>Account Name:</span> {user.accountName || "—"}
          </div>
          <div>
            <span>Bank Name:</span> {user.bankName || "—"}
          </div>
          <div>
            <span>Account Number:</span> {user.accountNumber || "—"}
          </div>
        </div>
      </div>
      <div className="print-section">
        <h2>Referral Info</h2>
        <p>
          {user.referredBy
            ? `Referred by ${user.referredBy.name || user.referredBy.id}`
            : "Direct signup (no referrer)"}
        </p>
      </div>
    </div>
  );

  const maskedAccountNumber = (num: string | null) => {
    if (!num) return "—";
    if (num.length <= 4) return num;
    return `•••• ${num.slice(-4)}`;
  };
  const maskedNIN = (nin: string | null) => {
    if (!nin) return "—";
    if (nin.length <= 4) return nin;
    return `•••• ${nin.slice(-4)}`;
  };

  return {
    usersState,
    setUsersState,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    ninVerifiedFilter,
    setNinVerifiedFilter,
    pageSize,
    setPageSize,
    currentPage,
    totalPages,
    paginatedUsers,
    filteredUsers,
    mobileUsers,
    hasMoreMobile,
    selectedIds,
    setSelectedIds,
    isDeleting,
    toast,
    savingRoleFor,
    roleError,
    pendingRoleChange,
    setPendingRoleChange,
    pendingDeleteUser,
    setPendingDeleteUser,
    bulkAction,
    isBulkConfirmOpen,
    setIsBulkConfirmOpen,
    confirmName,
    setConfirmName,
    deleteError,
    setDeleteError,
    referralUser,
    profileUser,
    isModalVisible,
    showAccountNumber,
    setShowAccountNumber,
    showNIN,
    setShowNIN,
    printContent,
    setPrintContent,
    currentUserName,
    isViewerSuperAdmin,
    sentinelRef,
    showToast,
    openReferrals,
    openProfile,
    closeModal,
    requestRoleChange,
    confirmRoleChange,
    toggleSelection,
    toggleAllOnPage,
    clearSelection,
    handleBulkDelete,
    confirmBulkDelete,
    handleBulkExport,
    requestDeleteUser,
    confirmDeleteUser,
    goToPreviousPage,
    goToNextPage,
    loadMoreMobile,
    totals,
    addressLine,
    getPrintContent,
    maskedAccountNumber,
    maskedNIN,
  };
}
