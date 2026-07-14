"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isValidEmail, isValidNIN } from "@/lib/validation";
import {
  Check,
  Loader2,
  Landmark,
  User,
  Phone,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  phone: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  nin: string | null;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
};

type FormStatus = {
  loading: boolean;
  saved: boolean;
  error: string;
};

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "address", label: "Address", icon: MapPin },
  { id: "identification", label: "Identification", icon: IdCard },
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

  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === STEPS.length - 1;

  const [image, setImage] = useState(user.image);
  const [photoStatus, setPhotoStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    streetAddress: user.streetAddress || "",
    apartment: user.apartment || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode || "",
    country: user.country || "",
    nin: user.nin || "",
    accountName: user.accountName || "",
    accountNumber: user.accountNumber || "",
    bankName: user.bankName || "",
  });

  const [stepStatus, setStepStatus] = useState<FormStatus>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (!formData.name.trim()) return "Full name is required";
      if (!isValidEmail(formData.email))
        return "Please enter a valid email address";
    }
    if (step === 2) {
      if (!formData.nin.trim())
        return "National Identification Number (NIN) is required";
      if (!isValidNIN(formData.nin)) return "NIN must be exactly 11 digits";
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>

          {/* Profile photo */}
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
              {currentStep === 0 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Your name and how we can reach you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Changing your email will require re-verifying the new
                        address.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-gray-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      Address
                    </CardTitle>
                    <CardDescription>Where you&apos;re based.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, Suite, etc.</Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Lagos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Lagos State"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="100001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4 text-gray-500" />
                          Country
                        </Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Nigeria"
                        />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IdCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      Identification
                    </CardTitle>
                    <CardDescription>
                      Required for identity verification and commission payouts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nin">
                        National Identification Number (NIN) *
                      </Label>
                      <Input
                        id="nin"
                        name="nin"
                        value={formData.nin}
                        onChange={handleChange}
                        placeholder="12345678901"
                        inputMode="numeric"
                        maxLength={11}
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your 11-digit NIN. This is kept private and used only
                        for identity verification.
                      </p>
                    </div>
                  </CardContent>
                </>
              )}

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
                    <div className="space-y-2">
                      <Label
                        htmlFor="accountName"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-gray-500" />
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountName"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="accountNumber"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Account Number *
                      </Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="1234567890"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="bankName"
                        className="flex items-center gap-2"
                      >
                        <Banknote className="h-4 w-4 text-gray-500" />
                        Bank Name *
                      </Label>
                      <Input
                        id="bankName"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="GTBank"
                        required
                      />
                    </div>

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
