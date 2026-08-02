// components/admin/AdminFilters.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, Download, CheckCircle2 } from "lucide-react";

type Role = "USER" | "REALTOR" | "ADMIN";

interface AdminFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  roleFilter: "ALL" | Role;
  setRoleFilter: (val: "ALL" | Role) => void;
  ninVerifiedFilter: "ALL" | "VERIFIED" | "UNVERIFIED"; // ✅ new
  setNinVerifiedFilter: (val: "ALL" | "VERIFIED" | "UNVERIFIED") => void; // ✅ new
  topReferralFilter: "ALL" | "TOP_5" | "TOP_10" | "TOP_25";
  setTopReferralFilter: (val: "ALL" | "TOP_5" | "TOP_10" | "TOP_25") => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExport: (
    mode:
      | "selected"
      | "all"
      | "with-nin"
      | "without-nin"
      | "realtors"
      | "users"
      | "top-referrals",
    format: "csv" | "xlsx"
  ) => void;
  onClearSelection: () => void;
}

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 200, 500] as const;
const roleFilterItems = [
  { label: "All Roles", value: "ALL" },
  { label: "User", value: "USER" },
  { label: "Realtor", value: "REALTOR" },
  { label: "Admin", value: "ADMIN" },
];
const ninFilterItems = [
  { label: "All", value: "ALL" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Not Verified", value: "UNVERIFIED" },
];

export default function AdminFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  ninVerifiedFilter,
  setNinVerifiedFilter,
  pageSize,
  setPageSize,
  selectedCount,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
  topReferralFilter,
  setTopReferralFilter,
}: AdminFiltersProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <Input
          type="text"
          placeholder="Search by name, email, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-45 p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-slate-800 text-neutral-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as "ALL" | Role)}
        >
          <SelectTrigger className="w-full sm:max-w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              {roleFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={ninVerifiedFilter}
          onValueChange={(value) =>
            setNinVerifiedFilter(value as "ALL" | "VERIFIED" | "UNVERIFIED")
          }
        >
          <SelectTrigger className="w-full sm:max-w-40">
            <SelectValue placeholder="NIN Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>NIN Verification</SelectLabel>
              {ninFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center gap-2">
                    {item.value === "VERIFIED" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={topReferralFilter}
          onValueChange={(value) =>
            setTopReferralFilter(value as "ALL" | "TOP_5" | "TOP_10" | "TOP_25")
          }
        >
          <SelectTrigger className="w-full sm:max-w-40">
            <SelectValue placeholder="Top referrals" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Top Referrals</SelectLabel>
              <SelectItem value="ALL">All users</SelectItem>
              <SelectItem value="TOP_5">Top 5</SelectItem>
              <SelectItem value="TOP_10">Top 10</SelectItem>
              <SelectItem value="TOP_25">Top 25</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-full sm:max-w-36">
            <SelectValue placeholder="Rows" />
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

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Select
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as "csv" | "xlsx")}
        >
          <SelectTrigger className="w-full sm:max-w-40">
            <SelectValue placeholder="Export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Format</SelectLabel>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">XLSX</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => onBulkExport("all", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Export All
        </button>

        <button
          type="button"
          onClick={() => onBulkExport("with-nin", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> With NIN
        </button>

        <button
          type="button"
          onClick={() => onBulkExport("without-nin", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Without NIN
        </button>

        <button
          type="button"
          onClick={() => onBulkExport("realtors", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Realtors Only
        </button>

        <button
          type="button"
          onClick={() => onBulkExport("users", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Users Only
        </button>

        <button
          type="button"
          onClick={() => onBulkExport("top-referrals", exportFormat)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Top referrals
        </button>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 mb-4 shadow-sm">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedCount} selected
          </span>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <Trash className="h-4 w-4" /> Delete
          </button>
          <button
            onClick={() => onBulkExport("selected", exportFormat)}
            className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={onClearSelection}
            className="ml-auto text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      )}
    </>
  );
}
