"use client";

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
  details: Record<string, unknown> | null;
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

export default function AuditLogsTable({ logs }: { logs: AuditLogEntry[] }) {
  return (
    <div className="mt-10 mb-16 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Admin
          </p>
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
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-[24rem] truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
