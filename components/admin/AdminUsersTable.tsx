"use client";

import { Check, Loader2, AlertTriangle } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import AdminFilters from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminMobileCards from "./AdminMobileCards";
import UserModals from "./UserModals";
import { UserRow } from "@/types/user";
import AdminStats from "./AdminStats";

// helper (needed for formatting)
function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getMonth() + 1}/${d.getDate()}/${d
    .getFullYear()
    .toString()
    .slice(2)}`;
}

function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = formatShortDate(d);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${dateStr} ${hours}:${minutes} ${ampm}`;
}

export default function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    pageSize,
    setPageSize,
    currentPage,
    totalPages,
    paginatedUsers,
    filteredUsers,
    mobileUsers,
    hasMoreMobile,
    selectedIds,
    // setSelectedIds,
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
    // showToast,
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
  } = useAdminUsers(users, currentUserId);

  return (
    <>
      <div
        className={`mt-10 mb-16 px-4 sm:px-0 ${
          isDeleting ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Admin — Users
          </h1>
          <a
            href="/admin/settings"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            System Settings →
          </a>
        </div>

        <AdminStats
          totalUsers={totals.totalUsers}
          totalReferrals={totals.totalReferrals}
          totalCommission={totals.totalCommission}
        />

        <AdminFilters
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          pageSize={pageSize}
          setPageSize={setPageSize}
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          onClearSelection={clearSelection}
        />

        <AdminTable
          users={paginatedUsers}
          currentUserId={currentUserId}
          selectedIds={selectedIds}
          savingRoleFor={savingRoleFor}
          onToggleSelect={toggleSelection}
          onToggleAll={toggleAllOnPage}
          onRequestRoleChange={requestRoleChange}
          onOpenProfile={openProfile}
          onOpenReferrals={openReferrals}
          onRequestDelete={requestDeleteUser}
          formatShortDate={formatShortDate}
          formatDateTime={formatDateTime}
        />

        <div className="hidden md:block">
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <AdminMobileCards
          users={mobileUsers}
          currentUserId={currentUserId}
          selectedIds={selectedIds}
          savingRoleFor={savingRoleFor}
          roleError={roleError}
          onToggleSelect={toggleSelection}
          onRequestRoleChange={requestRoleChange}
          onOpenProfile={openProfile}
          onOpenReferrals={openReferrals}
          onRequestDelete={requestDeleteUser}
          formatShortDate={formatShortDate}
          formatDateTime={formatDateTime}
          hasMore={hasMoreMobile}
          loadMore={loadMoreMobile}
          sentinelRef={sentinelRef}
        />
      </div>

      <UserModals
        referralUser={referralUser}
        profileUser={profileUser}
        isModalVisible={isModalVisible}
        showAccountNumber={showAccountNumber}
        setShowAccountNumber={setShowAccountNumber}
        showNIN={showNIN}
        setShowNIN={setShowNIN}
        isViewerSuperAdmin={isViewerSuperAdmin}
        pendingRoleChange={pendingRoleChange}
        setPendingRoleChange={setPendingRoleChange}
        pendingDeleteUser={pendingDeleteUser}
        setPendingDeleteUser={setPendingDeleteUser}
        isBulkConfirmOpen={isBulkConfirmOpen}
        setIsBulkConfirmOpen={setIsBulkConfirmOpen}
        bulkAction={bulkAction}
        selectedIds={selectedIds}
        confirmName={confirmName}
        setConfirmName={setConfirmName}
        currentUserName={currentUserName}
        isDeleting={isDeleting}
        closeModal={closeModal}
        confirmRoleChange={confirmRoleChange}
        confirmDeleteUser={confirmDeleteUser}
        confirmBulkDelete={confirmBulkDelete}
        onPrint={(user) => setPrintContent(getPrintContent(user))}
        maskedNIN={maskedNIN}
        maskedAccountNumber={maskedAccountNumber}
        addressLine={addressLine}
        formatShortDate={formatShortDate}
      />

      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-neutral-800 dark:text-white font-medium">
              Deleting user...
            </p>
          </div>
        </div>
      )}

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

      {printContent && <div className="print-only">{printContent}</div>}
    </>
  );
}
