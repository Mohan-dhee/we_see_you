"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Twitter,
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";

const ABUSE_CATEGORIES = [
  {
    value: "non_consensual_nudity",
    label: "Non-consensual nudity/sexual content",
    description: "Sharing intimate images without consent",
  },
  {
    value: "sexual_harassment",
    label: "Sexual harassment",
    description: "Unwanted sexual comments, messages, or advances",
  },
  {
    value: "hate_speech",
    label: "Hate speech / Discrimination",
    description: "Content targeting race, gender, religion, etc.",
  },
  {
    value: "threats",
    label: "Threats of violence",
    description: "Threats to hurt, kill, or harm someone",
  },
  {
    value: "graphic_violence",
    label: "Graphic violence",
    description: "Extremely violent or gory content",
  },
  {
    value: "other",
    label: "Other",
    description: "Other forms of abuse not listed above",
  },
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    platform: "",
    handle: "",
    category: "",
    description: "",
    evidenceFile: null as File | null,
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to submit a report");
        return;
      }

      // Upload evidence if provided
      let evidenceUrl = null;
      if (formData.evidenceFile) {
        const fileExt = formData.evidenceFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("evidence")
          .upload(fileName, formData.evidenceFile);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("evidence").getPublicUrl(fileName);
          evidenceUrl = publicUrl;
        }
      }

      // Check if account already exists
      let accountId: string;
      const normalizedHandle = formData.handle.replace("@", "").toLowerCase();

      const { data: existingAccount } = await supabase
        .from("accounts")
        .select("id, flag_count")
        .eq("platform", formData.platform)
        .eq("handle", normalizedHandle)
        .single();

      if (existingAccount) {
        // Update existing account
        accountId = existingAccount.id;
        await supabase
          .from("accounts")
          .update({
            flag_count: existingAccount.flag_count + 1,
            last_flagged_at: new Date().toISOString(),
          })
          .eq("id", accountId);
      } else {
        // Create new account
        const { data: newAccount, error: accountError } = await supabase
          .from("accounts")
          .insert({
            platform: formData.platform,
            handle: normalizedHandle,
            flag_count: 1,
          })
          .select("id")
          .single();

        if (accountError) {
          throw new Error("Failed to create account record");
        }
        accountId = newAccount.id;
      }

      // Create report
      const { error: reportError } = await supabase.from("reports").insert({
        account_id: accountId,
        reporter_id: user.id,
        category: formData.category,
        description: formData.description,
        evidence_urls: evidenceUrl ? [evidenceUrl] : [],
      });

      if (reportError) {
        throw new Error("Failed to submit report");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Report Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for helping keep the community safe. Your report has
              been submitted anonymously and will be reviewed by our moderators.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Submit a Report</h1>
        <p className="text-muted-foreground">
          Report an abusive account anonymously. Your identity will never be
          revealed.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Platform & Account */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform & Account</CardTitle>
            <CardDescription>
              Select the platform and enter the account handle you want to
              report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Platform</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: "instagram",
                    icon: Instagram,
                    label: "Instagram",
                    color: "text-pink-500",
                  },
                  {
                    value: "x",
                    icon: Twitter,
                    label: "X (Twitter)",
                    color: "text-blue-400",
                  },
                ].map((platform) => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, platform: platform.value })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.platform === platform.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <platform.icon
                      className={`w-8 h-8 mx-auto mb-2 ${platform.color}`}
                    />
                    <span className="font-medium">{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="handle">Account Handle</Label>
              <Input
                id="handle"
                placeholder="@username or profile URL"
                value={formData.handle}
                onChange={(e) =>
                  setFormData({ ...formData, handle: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Enter the username (with or without @) or paste the profile URL.
              </p>
            </div>

            <Button
              className="w-full"
              disabled={!formData.platform || !formData.handle}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Category & Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Select the type of abuse and provide additional context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Category of Abuse</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {ABUSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex flex-col">
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide any additional details about the abuse..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Evidence (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="evidence"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      evidenceFile: e.target.files?.[0] || null,
                    })
                  }
                />
                <label
                  htmlFor="evidence"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  {formData.evidenceFile ? (
                    <span className="text-sm text-primary">
                      {formData.evidenceFile.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-sm">
                        Click to upload screenshot
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!formData.category}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Self-Moderation Reminder */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Self-Moderation Reminder */}
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="w-5 h-5" />
                Before You Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For your immediate safety, consider using the platform&apos;s
                built-in tools:
              </p>
              <div className="grid gap-3">
                {formData.platform === "instagram" ? (
                  <>
                    <a
                      href="https://help.instagram.com/426700567389543"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      How to block someone on Instagram
                    </a>
                    <a
                      href="https://help.instagram.com/1005852136194365"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      How to restrict someone on Instagram
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="https://help.twitter.com/en/using-x/blocking-and-unblocking-accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      How to block someone on X
                    </a>
                    <a
                      href="https://help.twitter.com/en/using-x/muting-accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      How to mute someone on X
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Your Report</CardTitle>
              <CardDescription>
                Please confirm the details before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Platform
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {formData.platform === "instagram" && (
                      <Instagram className="w-3 h-3 mr-1" />
                    )}
                    {formData.platform === "x" && (
                      <Twitter className="w-3 h-3 mr-1" />
                    )}
                    {formData.platform}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <span className="font-medium">
                    @{formData.handle.replace("@", "")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Category
                  </span>
                  <span className="font-medium">
                    {
                      ABUSE_CATEGORIES.find(
                        (c) => c.value === formData.category
                      )?.label
                    }
                  </span>
                </div>
                {formData.description && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      Description
                    </span>
                    <span className="text-sm">{formData.description}</span>
                  </div>
                )}
                {formData.evidenceFile && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Evidence
                    </span>
                    <span className="text-sm">
                      {formData.evidenceFile.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Your report will be submitted{" "}
                    <strong>100% anonymously</strong>. Your identity will never
                    be revealed to anyone—not to the reported account, not to
                    other users, and <em>not even to our moderators</em>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
