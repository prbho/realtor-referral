// components/admin/AdminFilters.tsx
"use client";

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
import { Trash, Download } from "lucide-react";

type Role = "USER" | "REALTOR" | "ADMIN";

interface AdminFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  roleFilter: "ALL" | Role;
  setRoleFilter: (val: "ALL" | Role) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 200, 500] as const;
const roleFilterItems = [
  { label: "All Roles", value: "ALL" },
  { label: "User", value: "USER" },
  { label: "Realtor", value: "REALTOR" },
  { label: "Admin", value: "ADMIN" },
];

export default function AdminFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  pageSize,
  setPageSize,
  selectedCount,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
}: AdminFiltersProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-slate-800 text-neutral-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
            onClick={onBulkExport}
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
