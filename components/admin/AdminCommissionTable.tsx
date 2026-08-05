"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trophy, Users, Wallet } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CommissionUser = {
  id: string;
  name: string | null;
  email: string;
  referralCount: number;
  verifiedReferralCount: number;
  paidReferralCount: number;
  totalCommission: number;
  paidCommission: number;
  remainingCommission: number;
  createdAt: string;
};

const PAGE_SIZE = 20;

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function AdminCommissionTable({
  users,
}: {
  users: CommissionUser[];
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [dialogUser, setDialogUser] = useState<CommissionUser | null>(null);
  const [dialogMode, setDialogMode] = useState<"pay" | "adjustment">("pay");
  const [paidReferralInput, setPaidReferralInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const totalCommission = users.reduce(
    (sum, user) => sum + user.totalCommission,
    0
  );
  const totalPaidCommission = users.reduce(
    (sum, user) => sum + user.paidCommission,
    0
  );
  const totalVerifiedReferrals = users.reduce(
    (sum, user) => sum + user.verifiedReferralCount,
    0
  );
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const currentDialogMax = dialogUser?.verifiedReferralCount ?? 0;
  const currentDialogName =
    dialogUser?.name || dialogUser?.email || "this user";

  const totalRemainingCommission = users.reduce(
    (sum, user) => sum + user.remainingCommission,
    0
  );

  const openPayDialog = (user: CommissionUser) => {
    setDialogMode("pay");
    setDialogUser(user);
    setPaidReferralInput(String(user.paidReferralCount));
    setSubmitError(null);
    setMenuUserId(null);
  };

  const openAdjustmentDialog = (user: CommissionUser) => {
    setDialogMode("adjustment");
    setDialogUser(user);
    setPaidReferralInput(String(user.paidReferralCount));
    setSubmitError(null);
    setMenuUserId(null);
  };

  const closeDialog = () => {
    if (isPending) return;
    setDialogUser(null);
    setPaidReferralInput("");
    setSubmitError(null);
  };

  const submitPaidReferrals = async () => {
    if (!dialogUser) return;

    const nextPaidReferralCount = Number(paidReferralInput);
    if (
      !Number.isInteger(nextPaidReferralCount) ||
      nextPaidReferralCount < 0 ||
      nextPaidReferralCount > dialogUser.verifiedReferralCount
    ) {
      setSubmitError(
        `Enter a whole number between 0 and ${dialogUser.verifiedReferralCount}.`
      );
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/users/${dialogUser.id}/commission`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paidReferralCount: nextPaidReferralCount }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error || "Failed to update paid referrals.");
          return;
        }

        closeDialog();
        router.refresh();
      } catch {
        setSubmitError("Failed to update paid referrals.");
      }
    });
  };

  return (
    <div className="mt-10 mb-16 px-4 sm:px-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Commission
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Review commission earnings for every user, ranked from highest to
            lowest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          }
          label="Total Commission"
          value={currencyFormatter.format(totalCommission)}
          bg="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
          label="Commission Paid"
          value={currencyFormatter.format(totalPaidCommission)}
          bg="bg-sky-50 dark:bg-sky-950/20"
        />
        <StatCard
          icon={
            <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          }
          label="Verified Referrals"
          value={String(totalVerifiedReferrals)}
          bg="bg-amber-50 dark:bg-amber-950/20"
        />
        <StatCard
          icon={
            <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          }
          label="Commission Left"
          value={currencyFormatter.format(totalRemainingCommission)}
          bg="bg-violet-50 dark:bg-violet-950/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/40">
              <TableHead className="px-4 py-3">Rank</TableHead>
              <TableHead className="px-4 py-3">User</TableHead>
              <TableHead className="px-4 py-3">Referrals</TableHead>
              <TableHead className="px-4 py-3">Verified</TableHead>
              <TableHead className="px-4 py-3 text-right">
                Total Commission
              </TableHead>
              <TableHead className="px-4 py-3 text-right">
                Commission Paid
              </TableHead>
              <TableHead className="px-4 py-3 text-right">
                Commission Left
              </TableHead>
              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                  #{(currentPage - 1) * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {user.name || "Unnamed User"}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {user.referralCount}
                </TableCell>
                <TableCell className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {user.verifiedReferralCount}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                  {currencyFormatter.format(user.totalCommission)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {currencyFormatter.format(user.paidCommission)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {currencyFormatter.format(user.remainingCommission)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="relative inline-flex">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setMenuUserId((openId) =>
                          openId === user.id ? null : user.id
                        )
                      }
                      aria-label={`Open actions for ${user.name || user.email}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {menuUserId === user.id ? (
                      <div className="absolute right-0 top-9 z-10 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <button
                          onClick={() => openPayDialog(user)}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Pay
                        </button>
                        {user.paidReferralCount > 0 ? (
                          <button
                            onClick={() => openAdjustmentDialog(user)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Adjustment
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {users.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, users.length)} of {users.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Previous
            </button>
            <span className="text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:hidden">
        {paginatedUsers.map((user, index) => (
          <div
            key={user.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">
                  {user.name || "Unnamed User"}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  #{(currentPage - 1) * PAGE_SIZE + index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openPayDialog(user)}
                  aria-label={`Open actions for ${user.name || user.email}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Total Commission
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {currencyFormatter.format(user.totalCommission)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Referrals</p>
                <p className="text-slate-900 dark:text-white">
                  {user.referralCount}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Verified</p>
                <p className="text-slate-900 dark:text-white">
                  {user.verifiedReferralCount}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">
                  Commission Paid
                </p>
                <p className="text-slate-900 dark:text-white">
                  {currencyFormatter.format(user.paidCommission)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400">
                  Commission Left
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {currencyFormatter.format(user.remainingCommission)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!dialogUser}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "adjustment"
                ? "Adjust Referral Payments"
                : "Mark Referral Payments"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "adjustment"
                ? `Correct the paid verified referral count for ${currentDialogName}. The maximum is ${currentDialogMax}.`
                : `Set how many verified referrals have already been paid for ${currentDialogName}. The maximum is ${currentDialogMax}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
              <p>Verified referrals: {currentDialogMax}</p>
              <p>
                Currently marked as paid: {dialogUser?.paidReferralCount ?? 0}
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="paidReferralCount"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Paid verified referrals
              </label>
              <Input
                id="paidReferralCount"
                type="number"
                min={0}
                max={currentDialogMax}
                value={paidReferralInput}
                onChange={(event) => setPaidReferralInput(event.target.value)}
                disabled={isPending}
              />
            </div>

            {submitError ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={submitPaidReferrals} disabled={isPending}>
              {isPending
                ? "Saving..."
                : dialogMode === "adjustment"
                ? "Apply Adjustment"
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
