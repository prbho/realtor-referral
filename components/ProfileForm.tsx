"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isValidEmail, isValidNIN } from "@/lib/validation";
import {
  Check,
  Loader2,
  Landmark,
  User,
  MapPin,
  Globe,
  CreditCard,
  Banknote,
  AlertCircle,
  Info,
  IdCard,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { countryCodes, NIGERIA_STATES } from "@/types/location";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  phone: string | null;
  whatsapp: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  nin: string | null;
  ninVerified: boolean;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  isSuperAdmin: boolean;
};

type FormStatus = {
  loading: boolean;
  saved: boolean;
  error: string;
};

type FieldStatusMap = Record<string, FormStatus>;

type FormData = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nin: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
};

const COUNTRY_OPTIONS = (() => {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countries = countryCodes
    .map((code) => regionNames.of(code))
    .filter((name): name is string => Boolean(name))
    .filter((name) => name !== "Nigeria")
    .sort((a, b) => a.localeCompare(b));
  return ["Nigeria", ...countries];
})();

// ─── Steps: NIN first ──────────────────────────────────────────
const STEPS = [
  { id: "identification", label: "ID Verification", icon: IdCard },
  { id: "personal", label: "Personal", icon: User },
  { id: "address", label: "Address", icon: MapPin },
  { id: "banking", label: "Banking", icon: Landmark },
] as const;

function renderSuccessAlert(saved: boolean) {
  if (!saved) return null;
  return (
    <Alert className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <AlertDescription className="text-emerald-700 dark:text-emerald-300">
        Changes saved successfully!
      </AlertDescription>
    </Alert>
  );
}

function renderErrorAlert(error: string) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

export default function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStepFromHash = (hash: string): number => {
    if (hash === "#nin" || hash === "#identification") return 0;
    return 0;
  };

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      return getStepFromHash(window.location.hash);
    }
    return 0;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const step = getStepFromHash(window.location.hash);
      setCurrentStep(step);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isLastStep = currentStep === STEPS.length - 1;

  const [image, setImage] = useState(user.image);
  const [photoStatus, setPhotoStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const buildFormData = (u: UserData): FormData => ({
    name: u.name || "",
    email: u.email,
    phone: u.phone || "",
    whatsapp: u.whatsapp || "",
    streetAddress: u.streetAddress || "",
    apartment: u.apartment || "",
    city: u.city || "",
    state: u.state || "",
    zipCode: u.zipCode || "",
    country: u.country || "",
    nin: u.nin || "",
    accountName: u.accountName || "",
    accountNumber: u.accountNumber || "",
    bankName: u.bankName || "",
  });

  const [initialFormValues, setInitialFormValues] = useState<FormData>(() =>
    buildFormData(user)
  );
  const [formData, setFormData] = useState<FormData>(() => buildFormData(user));

  const prevUserRef = useRef(user);

  useEffect(() => {
    if (prevUserRef.current !== user) {
      const newValues = buildFormData(user);
      const hasChanged = Object.keys(newValues).some(
        (key) =>
          newValues[key as keyof FormData] !==
          initialFormValues[key as keyof FormData]
      );
      if (hasChanged) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInitialFormValues(newValues);
        setFormData(newValues);
      }
      prevUserRef.current = user;
    }
  }, [user, initialFormValues]);

  const [stepStatus, setStepStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });
  const [fieldStatus, setFieldStatus] = useState<FieldStatusMap>({});

  const [isVerifying, setIsVerifying] = useState(false);
  const [ninVerified, setNinVerified] = useState(user.ninVerified || false);

  // ─── Handlers ──────────────────────────────────────────────────

  const handleVerifyNin = async () => {
    const nin = formData.nin.trim();
    if (!nin) {
      setStepStatus({
        loading: false,
        saved: false,
        error: "Please enter your NIN first.",
      });
      return;
    }

    // ✅ Check if the NIN has unsaved changes
    if (hasUnsavedChanges("nin")) {
      setStepStatus({
        loading: false,
        saved: false,
        error: "Please save your NIN first before verifying.",
      });
      return;
    }

    setIsVerifying(true);
    setStepStatus({ loading: false, saved: false, error: "" });

    try {
      const res = await fetch("/api/profile/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStepStatus({
          loading: false,
          saved: false,
          error: data.error || "Verification failed. Please try again.",
        });
      } else {
        // Auto‑populate name from Monnify
        if (data.fullName) {
          setFormData((prev) => ({ ...prev, name: data.fullName }));
        }
        setNinVerified(true);
        // Update initial values so the NIN save button disappears
        setInitialFormValues((prev) => ({ ...prev, nin: formData.nin }));
        setStepStatus({
          loading: false,
          saved: true,
          error: "",
        });
        setTimeout(
          () => setStepStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
      }
    } catch {
      setStepStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value as FormData[keyof FormData],
    });
  };

  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value });
  };

  const hasUnsavedChanges = (field: keyof FormData) => {
    const currentValue = formData[field] ?? "";
    const initialValue = initialFormValues[field] ?? "";
    return currentValue.trim() !== initialValue.trim();
  };

  const handleFieldSave = async (field: keyof FormData, value: string) => {
    const trimmedValue = value.trim();

    if (
      field === "country" &&
      trimmedValue &&
      !COUNTRY_OPTIONS.includes(trimmedValue)
    ) {
      setFieldStatus((prev) => ({
        ...prev,
        [field]: {
          loading: false,
          saved: false,
          error: "Please select a country from the list.",
        },
      }));
      return;
    }

    setFieldStatus((prev) => ({
      ...prev,
      [field]: { loading: true, saved: false, error: "" },
    }));

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: trimmedValue }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFieldStatus((prev) => ({
          ...prev,
          [field]: {
            loading: false,
            saved: false,
            error: data.error || "Could not save this field.",
          },
        }));
      } else {
        setInitialFormValues((prev) => ({ ...prev, [field]: trimmedValue }));
        setFieldStatus((prev) => ({
          ...prev,
          [field]: { loading: false, saved: true, error: "" },
        }));
        setTimeout(() => {
          setFieldStatus((prev) => {
            const next = { ...prev };
            if (next[field]) {
              next[field] = { ...next[field], saved: false };
            }
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } catch {
      setFieldStatus((prev) => ({
        ...prev,
        [field]: {
          loading: false,
          saved: false,
          error: "Something went wrong. Please try again.",
        },
      }));
    }
  };

  const renderFieldWithSave = ({
    field,
    label,
    value,
    type = "text",
    placeholder,
    inputMode,
    maxLength,
    required,
    autoComplete,
    icon,
    list,
    datalistOptions,
    disabled = false,
  }: {
    field: keyof FormData;
    label: React.ReactNode;
    value: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
    required?: boolean;
    autoComplete?: string;
    icon?: React.ReactNode;
    list?: string;
    datalistOptions?: readonly string[];
    disabled?: boolean;
  }) => {
    const status = fieldStatus[field];
    const showSaveButton = !disabled && hasUnsavedChanges(field);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field} className="flex items-center gap-2">
            {icon}
            {label}
          </Label>
        </div>
        <div className="relative">
          <Input
            id={field}
            name={field}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            required={required}
            autoComplete={autoComplete}
            list={list}
            className="pr-10"
            disabled={disabled}
          />
          {list && datalistOptions?.length ? (
            <datalist id={list}>
              {datalistOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          ) : null}
          {showSaveButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => handleFieldSave(field, value)}
              disabled={status?.loading}
              className="absolute w-fit p-1 right-1.5 top-1/2 shrink-0 border border-stone-200 cursor-pointer -translate-y-1/2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              title="Save this field"
            >
              {status?.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <div className="flex gap-1 items-center">
                  <Check className="h-3.5 w-3.5" />
                  <span>Save</span>
                </div>
              )}
            </Button>
          )}
        </div>
        {status?.error ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {status.error}
          </p>
        ) : status?.saved ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Saved
          </p>
        ) : null}
      </div>
    );
  };

  // ─── Photo handlers ──────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoStatus({ loading: true, saved: false, error: "" });

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: uploadData,
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

  // ─── Navigation ──────────────────────────────────────────────
  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (!user.isSuperAdmin) {
        if (!formData.nin.trim())
          return "National Identification Number (NIN) is required";
        if (!isValidNIN(formData.nin)) return "NIN must be exactly 11 digits";
        if (!ninVerified) return "Please verify your NIN before proceeding.";
      }
    }
    if (step === 1) {
      if (!formData.name.trim()) return "Full name is required";
      if (!isValidEmail(formData.email))
        return "Please enter a valid email address";
    }
    if (step === 3) {
      if (!formData.accountName.trim())
        return "Account holder name is required";
      if (!formData.accountNumber.trim()) return "Account number is required";
      if (!formData.bankName.trim()) return "Bank name is required";
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepStatus({ loading: false, saved: false, error });
      return;
    }
    setStepStatus({ loading: false, saved: false, error: "" });
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => {
    setStepStatus({ loading: false, saved: false, error: "" });
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setStepStatus({ loading: false, saved: false, error: "" });
      setCurrentStep(index);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateStep(currentStep);
    if (error) {
      setStepStatus({ loading: false, saved: false, error });
      return;
    }

    setStepStatus({ loading: true, saved: false, error: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setStepStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
      } else {
        setStepStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setStepStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        router.refresh();
      }
    } catch {
      setStepStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>

          {/* Profile photo (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Upload a photo to personalize your account.
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

          {/* Step indicator */}
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isClickable = index <= currentStep;

              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={!isClickable}
                    className="flex flex-col items-center gap-1.5 group"
                    id={step.id}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                        isComplete
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : isActive
                          ? "border-blue-600 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-neutral-700 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : isComplete
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 transition-colors duration-200 ${
                        index < currentStep
                          ? "bg-emerald-600"
                          : "bg-gray-200 dark:bg-neutral-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleFinalSubmit}>
            <Card>
              {/* ─── Step 0: Identification ──────────────────────── */}
              {currentStep === 0 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      Identity Verification
                    </CardTitle>
                    <CardDescription>
                      Verify your identity with your NIN. This unlocks referral
                      features and auto‑fills your profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ✅ NIN field with Save button inside */}
                    {renderFieldWithSave({
                      field: "nin",
                      label: "National Identification Number (NIN) *",
                      value: formData.nin,
                      placeholder: "12345678901",
                      inputMode: "numeric",
                      maxLength: 11,
                      required: true,
                      disabled: ninVerified && !user.isSuperAdmin,
                    })}

                    {/* ✅ "Verify NIN" button – only appears if NIN is saved and not verified */}
                    {formData.nin.trim() &&
                      !ninVerified &&
                      !hasUnsavedChanges("nin") && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleVerifyNin}
                            disabled={isVerifying}
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Verifying...
                              </>
                            ) : (
                              "Verify NIN"
                            )}
                          </Button>
                        </div>
                      )}

                    {/* ✅ Verified status */}
                    {ninVerified && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          NIN verified successfully
                        </span>
                      </div>
                    )}

                    {/* Info note for super admin */}
                    {user.isSuperAdmin && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ℹ️ As a super admin, you can skip NIN verification or
                        leave it blank.
                      </p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your 11-digit NIN. Once verified, your name will be
                      auto‑filled and locked.
                    </p>

                    {!ninVerified &&
                      formData.nin.trim() &&
                      fieldStatus.nin?.saved && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Please verify your NIN to continue.
                        </p>
                      )}
                  </CardContent>
                </>
              )}

              {/* ─── Step 1: Personal ────────────────────────────── */}
              {currentStep === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Your name and contact details. Name is auto‑filled from
                      your verified NIN.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderFieldWithSave({
                      field: "name",
                      label: "Full Name *",
                      value: formData.name,
                      placeholder: "John Doe",
                      required: true,
                      disabled: ninVerified && !user.isSuperAdmin,
                    })}

                    <div className="space-y-2">
                      {renderFieldWithSave({
                        field: "email",
                        label: "Email Address *",
                        value: formData.email,
                        type: "email",
                        placeholder: "john@example.com",
                        required: true,
                      })}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Changing your email will require re-verifying the new
                        address.
                      </p>
                    </div>

                    {renderFieldWithSave({
                      field: "phone",
                      label: "Phone Number",
                      value: formData.phone,
                      type: "tel",
                      placeholder: "+234 800 000 0000",
                    })}

                    {renderFieldWithSave({
                      field: "whatsapp",
                      label: "WhatsApp Number",
                      value: formData.whatsapp,
                      type: "tel",
                      placeholder: "+234 800 000 0000",
                    })}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This WhatsApp number will be visible to anyone viewing
                      your profile.
                    </p>
                  </CardContent>
                </>
              )}

              {/* ─── Step 2: Address ────────────────────────────── */}
              {currentStep === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      Address
                    </CardTitle>
                    <CardDescription>Where you&apos;re based.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderFieldWithSave({
                      field: "streetAddress",
                      label: "Street Address",
                      value: formData.streetAddress,
                      placeholder: "123 Main Street",
                    })}

                    {renderFieldWithSave({
                      field: "apartment",
                      label: "Apartment, Suite, etc.",
                      value: formData.apartment,
                      placeholder: "Apt 4B",
                    })}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldWithSave({
                        field: "city",
                        label: "City",
                        value: formData.city,
                        placeholder: "Lagos",
                      })}
                      {renderFieldWithSave({
                        field: "state",
                        label: "State / Province",
                        value: formData.state,
                        placeholder: "Lagos State",
                        list: "nigeria-states",
                        datalistOptions: NIGERIA_STATES,
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldWithSave({
                        field: "zipCode",
                        label: "ZIP / Postal Code",
                        value: formData.zipCode,
                        placeholder: "100001",
                      })}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="country"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4 text-gray-500" />
                            Country
                          </Label>
                        </div>
                        <div className="relative">
                          <Select
                            value={formData.country || "Nigeria"}
                            onValueChange={handleCountryChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {hasUnsavedChanges("country") && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                handleFieldSave("country", formData.country)
                              }
                              disabled={fieldStatus.country?.loading}
                              className="absolute right-10 top-1/2 border border-stone-200 cursor-pointer -translate-y-1/2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                              title="Save this field"
                            >
                              {fieldStatus.country?.loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                        {fieldStatus.country?.error ? (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {fieldStatus.country.error}
                          </p>
                        ) : fieldStatus.country?.saved ? (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Saved
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* ─── Step 3: Banking ────────────────────────────── */}
              {currentStep === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Banking Details
                    </CardTitle>
                    <CardDescription>
                      Used for commission payouts. Kept private and never
                      shared.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderFieldWithSave({
                      field: "accountName",
                      label: "Account Holder Name *",
                      value: formData.accountName,
                      placeholder: "John Doe",
                      required: true,
                      icon: <User className="h-4 w-4 text-gray-500" />,
                    })}

                    {renderFieldWithSave({
                      field: "accountNumber",
                      label: "Account Number *",
                      value: formData.accountNumber,
                      placeholder: "1234567890",
                      autoComplete: "off",
                      required: true,
                      icon: <CreditCard className="h-4 w-4 text-gray-500" />,
                    })}

                    {renderFieldWithSave({
                      field: "bankName",
                      label: "Bank Name *",
                      value: formData.bankName,
                      placeholder: "GTBank",
                      required: true,
                      icon: <Banknote className="h-4 w-4 text-gray-500" />,
                    })}

                    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        Your banking details are encrypted and securely stored.
                        They will only be used for commission payments.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </>
              )}

              {/* ─── Footer ───────────────────────────────────────── */}
              <CardContent className="pt-0 space-y-4">
                {renderErrorAlert(stepStatus.error)}
                {renderSuccessAlert(stepStatus.saved)}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={currentStep === 0 || stepStatus.loading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>

                  {isLastStep ? (
                    <Button type="submit" disabled={stepStatus.loading}>
                      {stepStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : stepStatus.saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  ) : (
                    <Button type="button" onClick={goNext}>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
