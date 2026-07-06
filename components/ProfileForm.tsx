"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import {
  LockKeyhole,
  UserPen,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
};

type FormStatus = {
  loading: boolean;
  saved: boolean;
  error: string;
};

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  // Profile form state
  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    streetAddress: user.streetAddress || "",
    apartment: user.apartment || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode || "",
    country: user.country || "",
  });

  // Banking form state
  const [banking, setBanking] = useState({
    accountName: user.accountName || "",
    accountNumber: user.accountNumber || "",
    bankName: user.bankName || "",
  });

  // Password form state
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [profileStatus, setProfileStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [bankingStatus, setBankingStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const [passwordStatus, setPasswordStatus] = useState<FormStatus>({
    loading: false,
    saved: false,
    error: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleBankingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBanking({ ...banking, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus({ ...profileStatus, error: "", loading: true });

    if (!isValidEmail(profile.email)) {
      setProfileStatus({
        loading: false,
        saved: false,
        error: "Please enter a valid email address",
      });
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
      } else {
        setProfileStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setProfileStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        router.refresh();
      }
    } catch {
      setProfileStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const handleBankingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankingStatus({ ...bankingStatus, error: "", loading: true });

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banking),
      });
      const data = await res.json();

      if (!res.ok) {
        setBankingStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
      } else {
        setBankingStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setBankingStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        router.refresh();
      }
    } catch {
      setBankingStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ ...passwordStatus, error: "", loading: true });

    if (password.new !== password.confirm) {
      setPasswordStatus({
        loading: false,
        saved: false,
        error: "New passwords do not match",
      });
      return;
    }

    const passwordCheck = isValidPassword(password.new);
    if (!passwordCheck.valid) {
      setPasswordStatus({
        loading: false,
        saved: false,
        error: passwordCheck.message || "Invalid password",
      });
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordStatus({
          loading: false,
          saved: false,
          error: data.error || "Something went wrong",
        });
      } else {
        setPasswordStatus({ loading: false, saved: true, error: "" });
        setTimeout(
          () => setPasswordStatus((prev) => ({ ...prev, saved: false })),
          3000
        );
        setPassword({ current: "", new: "", confirm: "" });
        router.refresh();
      }
    } catch {
      setPasswordStatus({
        loading: false,
        saved: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

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
        <AlertCircle className="h-4 w-4" />
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
              Profile Settings
            </h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserPen className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                <span className="hidden sm:inline">Banking</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
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
                          value={profile.email}
                          onChange={handleProfileChange}
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
                          value={profile.phone}
                          onChange={handleProfileChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-neutral-700">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input
                          id="streetAddress"
                          name="streetAddress"
                          value={profile.streetAddress}
                          onChange={handleProfileChange}
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apartment">
                          Apartment, Suite, etc.
                        </Label>
                        <Input
                          id="apartment"
                          name="apartment"
                          value={profile.apartment}
                          onChange={handleProfileChange}
                          placeholder="Apt 4B"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={profile.city}
                            onChange={handleProfileChange}
                            placeholder="New York"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State / Province</Label>
                          <Input
                            id="state"
                            name="state"
                            value={profile.state}
                            onChange={handleProfileChange}
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={profile.zipCode}
                            onChange={handleProfileChange}
                            placeholder="10001"
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
                            value={profile.country}
                            onChange={handleProfileChange}
                            placeholder="United States"
                          />
                        </div>
                      </div>
                    </div>

                    {renderErrorAlert(profileStatus.error)}
                    {renderSuccessAlert(profileStatus.saved)}

                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={profileStatus.loading}
                    >
                      {profileStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : profileStatus.saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banking Tab */}
            <TabsContent value="banking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Banking Details
                  </CardTitle>
                  <CardDescription>
                    Used for commission payouts. Kept private and never shared.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBankingSubmit} className="space-y-6">
                    <div className="space-y-4">
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
                          value={banking.accountName}
                          onChange={handleBankingChange}
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
                          value={banking.accountNumber}
                          onChange={handleBankingChange}
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
                          value={banking.bankName}
                          onChange={handleBankingChange}
                          placeholder="Chase Bank"
                          required
                        />
                      </div>

                      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          Your banking details are encrypted and securely
                          stored. They will only be used for commission
                          payments.
                        </AlertDescription>
                      </Alert>
                    </div>

                    {renderErrorAlert(bankingStatus.error)}
                    {renderSuccessAlert(bankingStatus.saved)}

                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={bankingStatus.loading}
                    >
                      {bankingStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : bankingStatus.saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        "Save Banking Details"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockKeyhole className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <Input
                        id="current"
                        name="current"
                        type="password"
                        value={password.current}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        name="new"
                        type="password"
                        value={password.new}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        At least 8 characters, one uppercase letter, one number.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <Input
                        id="confirm"
                        name="confirm"
                        type="password"
                        value={password.confirm}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    {renderErrorAlert(passwordStatus.error)}
                    {renderSuccessAlert(passwordStatus.saved)}

                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={passwordStatus.loading}
                    >
                      {passwordStatus.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : passwordStatus.saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Updated!
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
