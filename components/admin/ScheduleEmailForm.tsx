"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

type RoleRecipients = {
  USER: string[];
  REALTOR: string[];
  ADMIN: string[];
};

const roleOptions = [
  { label: "Users", value: "USER" },
  { label: "Realtors", value: "REALTOR" },
  { label: "Admins", value: "ADMIN" },
];

export default function ScheduleEmailForm({
  templates,
  roleRecipients,
}: {
  templates: Template[];
  roleRecipients: RoleRecipients;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedRecipients = useMemo(() => {
    const recipients = new Set<string>();
    selectedRoles.forEach((role) => {
      const ids = roleRecipients[role as keyof RoleRecipients] ?? [];
      ids.forEach((id) => recipients.add(id));
    });
    return Array.from(recipients);
  }, [selectedRoles, roleRecipients]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templateId, templates]
  );

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = templates.find((template) => template.id === value);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setSubject("");
      setBody("");
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (!templateId && (!subject.trim() || !body.trim())) {
      setError("Select a template or provide a subject and body.");
      return;
    }

    if (!scheduledAt) {
      setError("Schedule date and time required.");
      return;
    }

    if (selectedRecipients.length === 0) {
      setError("Select at least one recipient role.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/emails/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: templateId || null,
          subject: subject.trim(),
          body: body.trim(),
          recipients: selectedRecipients,
          scheduledAt,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to schedule email.");
      }

      setMessage("Email scheduled successfully.");
      setTemplateId("");
      setSubject("");
      setBody("");
      setSelectedRoles([]);
      setScheduledAt("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Schedule failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-10 mb-16 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Schedule Email
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Choose a template, select recipients, and schedule when the email
            should send.
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to admin dashboard
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Template
            </Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Saved templates</SelectLabel>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </Label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schedule date
              </Label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Body
            </Label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Email body text. Variables like {{name}} will be replaced where available."
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              If you select a template, its subject and body will populate
              automatically.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipients
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {roleOptions.map((role) => {
                const count =
                  roleRecipients[role.value as keyof RoleRecipients]?.length ??
                  0;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      selectedRoles.includes(role.value)
                        ? "border-blue-500 bg-blue-50 text-slate-900 dark:border-blue-400 dark:bg-blue-950/30"
                        : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{role.label}</span>
                      {selectedRoles.includes(role.value) && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {count} recipients
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {(error || message) && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-950/40"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40"
              }`}
            >
              {error || message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Sending to {selectedRecipients.length} recipient
              {selectedRecipients.length === 1 ? "" : "s"}.
            </div>
            <Button onClick={handleSubmit} disabled={isSaving}>
              Schedule email
            </Button>
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 shadow-sm p-6">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Template details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a saved template or type your own content. If the template
              is selected, the fields above will populate.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Selected template
            </p>
            <p className="text-sm text-slate-900 dark:text-white">
              {selectedTemplate?.name || "Custom content"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedTemplate
                ? selectedTemplate.subject
                : "Use your own subject and body."}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Recipients
            </p>
            {selectedRoles.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recipient groups selected.
              </p>
            ) : (
              selectedRoles.map((role) => (
                <p
                  key={role}
                  className="text-sm text-slate-700 dark:text-slate-300"
                >
                  {roleOptions.find((option) => option.value === role)?.label}:{" "}
                  {roleRecipients[role as keyof RoleRecipients]?.length ?? 0}
                </p>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
