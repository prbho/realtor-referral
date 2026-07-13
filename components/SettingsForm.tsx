"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BellDot,
  Camera,
  MonitorCog,
  Check,
  Loader2,
  Sun,
  Moon,
  Monitor,
  User,
  Trash2,
  BellRing,
  BellOff,
  LucideIcon,
} from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
};

type FormStatus = {
  loading: boolean;
  saved: boolean;
  error: string;
};

export default function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const { update } = useSession();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(user.image);
  const [photoStatus, setPhotoStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [emailNotifications, setEmailNotifications] = useState(
    user.emailNotifications
  );
  const [marketingEmails, setMarketingEmails] = useState(user.marketingEmails);
  const [prefsStatus, setPrefsStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [themeStatus, setThemeStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setThemeStatus({ loading: true, saved: false, error: "" });

    try {
      setTheme(newTheme);

      const res = await fetch("/api/settings/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!res.ok) {
        const data = await res.json();
        setThemeStatus({
          loading: false,
          saved: false,
          error: data.error || "Failed to save theme preference",
        });
      } else {
        setThemeStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setThemeStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
      }
    } catch {
      setThemeStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoStatus({ loading: true, saved: false, error: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setPhotoStatus({
          loading: false,
          saved: false,
          error: data.error || "Failed to upload image",
        });
      } else {
        setImage(data.image);
        await update({ image: data.image });
        setPhotoStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setPhotoStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        router.refresh();
      }
    } catch {
      setPhotoStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoStatus({ loading: true, saved: false, error: "" });
    try {
      const res = await fetch("/api/settings/avatar", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setPhotoStatus({
          loading: false,
          saved: false,
          error: data.error || "Failed to remove photo",
        });
      } else {
        setImage(null);
        await update({ image: null });
        setPhotoStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setPhotoStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        router.refresh();
      }
    } catch {
      setPhotoStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const handlePrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsStatus({ loading: true, saved: false, error: "" });

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications, marketingEmails }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPrefsStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
      } else {
        setPrefsStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setPrefsStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
      }
    } catch {
      setPrefsStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteStatus({
        loading: false,
        saved: false,
        error: 'Type "DELETE" to confirm',
      });
      return;
    }

    setDeleteStatus({ loading: true, saved: false, error: "" });

    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const themeOptions: {
    value: "light" | "dark" | "system";
    label: string;
    icon: LucideIcon;
    description: string;
  }[] = [
    { value: "light", label: "Light", icon: Sun, description: "Light mode" },
    { value: "dark", label: "Dark", icon: Moon, description: "Dark mode" },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follow system preference",
    },
  ];

  const renderSuccessAlert = (saved: boolean) => {
    if (!saved) return null;
    return (
      <Alert className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-300">
          Changes saved successfully!
        </AlertDescription>
      </Alert>
    );
  };

  const renderErrorAlert = (error: string) => {
    if (!error) return null;
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>

          <Tabs defaultValue="profile-photo" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="profile-photo"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photo</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <BellDot className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2">
                <MonitorCog className="h-4 w-4" />
                <span className="hidden sm:inline">Display</span>
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Danger</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Photo Tab */}
            <TabsContent value="profile-photo" id="profile-photo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Profile Photo
                  </CardTitle>
                  <CardDescription>
                    Upload a profile photo to personalize your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={image || undefined}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback className="text-lg bg-[#0b3264] text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={photoStatus.loading}
                          className="relative"
                        >
                          {photoStatus.loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : photoStatus.saved ? (
                            <Check className="mr-2 h-4 w-4 text-emerald-600" />
                          ) : (
                            <Camera className="mr-2 h-4 w-4" />
                          )}
                          {photoStatus.loading
                            ? "Uploading..."
                            : photoStatus.saved
                            ? "Saved!"
                            : "Change Photo"}
                        </Button>
                        {image && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemovePhoto}
                            disabled={photoStatus.loading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPEG, PNG, or WebP. Max 5MB.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {renderErrorAlert(photoStatus.error)}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" id="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellDot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePrefsSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="email-notifications"
                            className="text-base"
                          >
                            <div className="flex items-center gap-2">
                              <BellRing className="h-4 w-4 text-gray-500" />
                              Referral & account emails
                            </div>
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            New referrals, commission updates, security alerts
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="marketing-emails"
                            className="text-base"
                          >
                            <div className="flex items-center gap-2">
                              <BellOff className="h-4 w-4 text-gray-500" />
                              Marketing emails
                            </div>
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Product updates, tips, and promotions
                          </p>
                        </div>
                        <Switch
                          id="marketing-emails"
                          checked={marketingEmails}
                          onCheckedChange={setMarketingEmails}
                        />
                      </div>
                    </div>

                    {renderErrorAlert(prefsStatus.error)}
                    {renderSuccessAlert(prefsStatus.saved)}

                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={prefsStatus.loading}
                    >
                      {prefsStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : prefsStatus.saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" id="display">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MonitorCog className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Theme Preference
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred theme for the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themeOptions.map(
                      ({ value, label, icon: Icon, description }) => {
                        const isActive = theme === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleThemeChange(value)}
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                              isActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600"
                            }`}
                            disabled={themeStatus.loading}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="relative">
                                <Icon
                                  className={`h-8 w-8 ${
                                    isActive
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                />
                                {isActive && themeStatus.loading && (
                                  <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                                )}
                                {isActive && !themeStatus.loading && (
                                  <Check className="absolute -top-1 -right-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <span
                                className={`font-medium ${
                                  isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {label}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {description}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {renderErrorAlert(themeStatus.error)}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" id="danger">
              <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-400">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-800 text-white dark:border-red-900/50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <p className="text-white/85 dark:text-gray-300">
                      Deleting your account will permanently remove all your
                      data including referrals, commissions, and profile
                      information.
                    </p>
                  </Alert>

                  <div className="space-y-2">
                    <Label
                      htmlFor="delete-confirm"
                      className="text-sm font-medium"
                    >
                      Type <span className="font-mono font-bold">DELETE</span>{" "}
                      to confirm
                    </Label>
                    <Input
                      id="delete-confirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE here"
                      className="border-red-300 dark:border-red-800 focus-visible:ring-red-500"
                      disabled={deleteStatus.loading}
                    />
                  </div>

                  {renderErrorAlert(deleteStatus.error)}

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={
                      deleteStatus.loading || deleteConfirm !== "DELETE"
                    }
                    className="w-full sm:w-auto"
                  >
                    {deleteStatus.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
