"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Save, Edit3 } from "lucide-react";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
};

export default function EmailTemplatesManager({
  initialTemplates,
}: {
  initialTemplates: EmailTemplate[];
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [variables, setVariables] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  );

  const handleSelect = (template: EmailTemplate) => {
    setError(null);
    setMessage(null);
    setSelectedTemplateId(template.id);
    setName(template.name);
    setSubject(template.subject);
    setBody(template.body);
    setVariables(template.variables.join(", "));
  };

  const resetForm = () => {
    setSelectedTemplateId(null);
    setError(null);
    setMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError("Name, subject, and body are required.");
      return;
    }

    const variablesArray = variables
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      id: selectedTemplateId,
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      variables: variablesArray,
    };

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save template.");
      }

      setTemplates((current) => {
        const existingIndex = current.findIndex(
          (item) => item.id === result.id
        );
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = result;
          return next;
        }
        return [...current, result];
      });

      setSelectedTemplateId(result.id);
      setMessage(
        selectedTemplateId ? "Template updated." : "Template created."
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/email-templates?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to delete template.");
      }

      setTemplates((current) =>
        current.filter((template) => template.id !== id)
      );
      if (selectedTemplateId === id) {
        resetForm();
      }
      setMessage("Template deleted.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Deletion failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-10 mb-16 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Email Templates
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Create, edit, and delete reusable email templates for scheduled
            messaging.
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to admin dashboard
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Template library
              </h2>
              <Button variant="secondary" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4" /> New template
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-900/80 text-left text-gray-500 dark:text-gray-400">
                  <TableHead className="px-4 py-3">Name</TableHead>
                  <TableHead className="px-4 py-3">Subject</TableHead>
                  <TableHead className="px-4 py-3">Variables</TableHead>
                  <TableHead className="px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow
                    key={template.id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                  >
                    <TableCell className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <button
                        type="button"
                        onClick={() => handleSelect(template)}
                        className="text-left text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {template.name}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 truncate max-w-[18rem]">
                      {template.subject}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {template.variables.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <button
                        type="button"
                        onClick={() => handleDelete(template.id)}
                        className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No templates created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {selectedTemplate ? "Edit template" : "Create template"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Save a name, subject line, body, and optional placeholder
                variables.
              </p>
            </div>
            {selectedTemplate && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                Editing
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template name
              </Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. welcome-email"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </Label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Welcome to Regal PDC Realtor"
              />
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
                placeholder="HTML or plain text body. Example: Hello {{name}}, welcome..."
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Variables
              </Label>
              <Input
                value={variables}
                onChange={(event) => setVariables(event.target.value)}
                placeholder="name, email, referralCode"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Separate variables with commas. These help you keep placeholders
                consistent.
              </p>
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
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {selectedTemplate ? "Update template" : "Create template"}
              </Button>
              {selectedTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  <Edit3 className="h-4 w-4" /> New template
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
