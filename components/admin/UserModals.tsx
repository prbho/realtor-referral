// components/admin/UserModals.tsx
"use client";

import {
  X,
  User as UserIcon,
  MapPin,
  Landmark,
  Eye,
  EyeOff,
  Trash,
  AlertTriangle,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserRow } from "@/types/user";
import ModalShell from "./ModalShell";
import UserAvatar from "./UserAvatar";
import DetailRow from "./DetailRow";
import RoleBadge from "./RoleBadge";

type Role = "USER" | "REALTOR" | "ADMIN";

interface UserModalsProps {
  referralUser: UserRow | null;
  profileUser: UserRow | null;
  isModalVisible: boolean;
  showAccountNumber: boolean;
  setShowAccountNumber: (v: boolean) => void;
  showNIN: boolean;
  setShowNIN: (v: boolean) => void;
  isViewerSuperAdmin: boolean;
  pendingRoleChange: { user: UserRow; newRole: Role } | null;
  setPendingRoleChange: (v: null) => void;
  pendingDeleteUser: UserRow | null;
  setPendingDeleteUser: (v: null) => void;
  isBulkConfirmOpen: boolean;
  setIsBulkConfirmOpen: (v: boolean) => void;
  bulkAction: "delete" | "export" | null;
  selectedIds: Set<string>;
  confirmName: string;
  setConfirmName: (v: string) => void;
  currentUserName: string;
  isDeleting: boolean;
  closeModal: () => void;
  confirmRoleChange: () => void;
  confirmDeleteUser: () => void;
  confirmBulkDelete: () => void;
  onPrint: (user: UserRow) => void;
  maskedNIN: (nin: string | null) => string;
  maskedAccountNumber: (num: string | null) => string;
  addressLine: (u: UserRow) => string | null;
  formatShortDate: (d: string | Date) => string;
}

export default function UserModals({
  referralUser,
  profileUser,
  isModalVisible,
  showAccountNumber,
  setShowAccountNumber,
  showNIN,
  setShowNIN,
  isViewerSuperAdmin,
  pendingRoleChange,
  setPendingRoleChange,
  pendingDeleteUser,
  setPendingDeleteUser,
  isBulkConfirmOpen,
  setIsBulkConfirmOpen,
  bulkAction,
  selectedIds,
  confirmName,
  setConfirmName,
  currentUserName,
  isDeleting,
  closeModal,
  confirmRoleChange,
  confirmDeleteUser,
  confirmBulkDelete,
  onPrint,
  maskedNIN,
  maskedAccountNumber,
  addressLine,
  formatShortDate,
}: UserModalsProps) {
  // referral modal
  if (referralUser) {
    return (
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
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
                <div className="flex items-center gap-2">
                  <UserAvatar src={ref.image} name={ref.name} />
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
                    {formatShortDate(ref.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ModalShell>
    );
  }

  // profile modal
  if (profileUser) {
    return (
      <ModalShell isVisible={isModalVisible} onClose={closeModal}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-start gap-3">
            <UserAvatar
              src={profileUser.image}
              name={profileUser.name}
              size={60}
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-semibold capitalize text-neutral-800 dark:text-white">
                  {profileUser.name || "—"}
                </h2>
                <button
                  onClick={() => onPrint(profileUser)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-neutral-700 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors print:hidden"
                >
                  🖨️ Print
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={profileUser.role} />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {formatShortDate(profileUser.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {/* Basic info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <UserIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                Basic Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-9">
              <DetailRow label="Email" value={profileUser.email} />
              <DetailRow label="Phone" value={profileUser.phone} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  NIN (National ID)
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-neutral-800 dark:text-white font-mono">
                    {isViewerSuperAdmin && showNIN
                      ? profileUser.nin || "—"
                      : maskedNIN(profileUser.nin)}
                  </p>
                  {isViewerSuperAdmin && profileUser.nin && (
                    <button
                      onClick={() => setShowNIN(!showNIN)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNIN ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
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
              <div className="h-7 w-7 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
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
              <div className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <Landmark className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                Banking Details
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-9">
              <DetailRow label="Account Name" value={profileUser.accountName} />
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
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                Referral Info
              </h3>
            </div>
            <div className="pl-9">
              <p className="text-sm text-neutral-800 dark:text-white">
                {profileUser.referredBy ? (
                  `Referred by ${
                    profileUser.referredBy.name || profileUser.referredBy.id
                  }`
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    Direct signup (no referrer)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }

  // Role change confirmation
  if (pendingRoleChange) {
    return (
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50"
        onClick={() => setPendingRoleChange(null)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={confirmRoleChange}
              className="px-4 py-2 text-sm font-medium bg-[#0b3264] text-white rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Individual delete confirmation
  if (pendingDeleteUser) {
    return (
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-[60]"
        onClick={() => setPendingDeleteUser(null)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
                Delete User?
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-neutral-800 dark:text-white">
                {pendingDeleteUser.name || pendingDeleteUser.email}
              </span>
              ?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPendingDeleteUser(null)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />{" "}
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bulk delete confirmation
  if (isBulkConfirmOpen && bulkAction === "delete") {
    return (
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-[70]"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsBulkConfirmOpen(false);
        }}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
              Delete {selectedIds.size} user(s)?
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This action cannot be undone. Type your full name below to confirm.
          </p>
          <div className="mt-4">
            <label
              htmlFor="confirmName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your full name (as registered)
            </label>
            <Input
              id="confirmName"
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={currentUserName || "Enter your name"}
              className="mt-1 w-full"
              autoComplete="off"
              disabled={isDeleting}
            />
            {confirmName && confirmName !== currentUserName && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Name does not match. Please type your exact full name.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setIsBulkConfirmOpen(false);
                setConfirmName("");
              }}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmBulkDelete}
              disabled={confirmName !== currentUserName || isDeleting}
              className={`px-4 py-2 rounded-md text-white ${
                confirmName === currentUserName && !isDeleting
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-300 dark:bg-red-800 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />{" "}
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
