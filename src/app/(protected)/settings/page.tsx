"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    notification_preferences: {
      in_app: true,
      push: false,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile({
          display_name: profileData?.display_name || "",
          email: user.email || "",
          notification_preferences: profileData?.notification_preferences || {
            in_app: true,
            push: false,
          },
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          notification_preferences: profile.notification_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and notification preferences.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your display name is shown to moderators only. It&apos;s never
            visible to reported accounts or other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
              }
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to receive community alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="space-y-1">
              <span className="font-medium">In-App Notifications</span>
              <p className="text-sm text-muted-foreground">
                Receive alerts within the app
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setProfile({
                  ...profile,
                  notification_preferences: {
                    ...profile.notification_preferences,
                    in_app: !profile.notification_preferences.in_app,
                  },
                })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                profile.notification_preferences.in_app
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.notification_preferences.in_app
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Push Notifications</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Browser push notifications for urgent alerts
              </p>
            </div>
            <button
              type="button"
              disabled
              className="w-12 h-6 rounded-full bg-muted opacity-50 cursor-not-allowed"
            >
              <div className="w-5 h-5 rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <span className="font-medium">Your Privacy is Protected</span>
              <p className="text-sm text-muted-foreground">
                All your reports remain <strong>100% anonymous</strong>. Your
                identity is never shared with reported accounts, other users,{" "}
                <em>or even our moderators</em>. We use database-level
                protections to ensure no one can access your reporter identity.
              </p>
              <a
                href="/anonymity"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more about our anonymity model →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
