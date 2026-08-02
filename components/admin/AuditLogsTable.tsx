"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AuditLogEntry = {
  id: string;
  action: string;
  details: Record<string, unknown> | string | unknown[] | null;
  ip: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function formatAuditDetails(
  details: Record<string, unknown> | string | unknown[] | null
) {
  if (!details) {
    return "—";
  }

  if (typeof details === "string") {
    return details;
  }

  if (Array.isArray(details)) {
    return details.map((item) => String(item)).join(", ");
  }

  const entries = Object.entries(details);
  if (entries.length === 0) {
    return "—";
  }

  const text = entries
    .map(([key, value]) => {
      const formattedValue =
        value === null || value === undefined
          ? "—"
          : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
      return `${prettyLabel(key)}: ${formattedValue}`;
    })
    .join("; ");

  return text;
}

interface AuditLogsTableProps {
  logs: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AuditLogsTable({
  logs,
  page,
  pageSize,
  total,
  totalPages,
}: AuditLogsTableProps) {
  return (
    <div className="mt-10 mb-16 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Audit Logs
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            A recent record of admin actions, who triggered them, and when.
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to admin dashboard
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 shadow-sm">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-900/80 text-left text-gray-500 dark:text-gray-400">
              <TableHead className="px-4 py-3">Action</TableHead>
              <TableHead className="px-4 py-3">Performed By</TableHead>
              <TableHead className="px-4 py-3">IP Address</TableHead>
              <TableHead className="px-4 py-3">Details</TableHead>
              <TableHead className="px-4 py-3">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No audit records found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                >
                  <TableCell className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {log.action}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {log.user?.name || log.user?.email || "System"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {log.ip || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-[24rem] whitespace-normal wrap-break-word">
                    {formatAuditDetails(log.details)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {logs.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-slate-900/70">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/audit?page=${Math.max(page - 1, 1)}`}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                  page === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-white/80 dark:bg-slate-800/80"
                    : "border-gray-300 text-neutral-700 bg-white hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                }`}
                aria-disabled={page === 1}
              >
                Previous
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/admin/audit?page=${Math.min(page + 1, totalPages)}`}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                  page === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-white/80 dark:bg-slate-800/80"
                    : "border-gray-300 text-neutral-700 bg-white hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                }`}
                aria-disabled={page === totalPages}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
