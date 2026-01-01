"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Database,
  Users,
  FileText,
} from "lucide-react";

export default function AnonymityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Anonymity & Privacy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your identity is <strong>NEVER</strong> revealed to anyone—not to
            the reported account, not to other users, and not even to our
            moderators.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              How Your Privacy Is Protected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  What You See
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your own profile information</li>
                  <li>• Reports you&apos;ve submitted</li>
                  <li>• Status updates on accounts you flagged</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                  What Moderators See
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Report content & evidence</li>
                  <li>• Abuse category & description</li>
                  <li>
                    • ❌ <span className="line-through">Reporter identity</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              What We Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Data</th>
                    <th className="text-left py-2 font-semibold">Purpose</th>
                    <th className="text-left py-2 font-semibold">
                      Who Can See
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">Your email</td>
                    <td className="py-2">Authentication only</td>
                    <td className="py-2">
                      <Badge variant="secondary">Only you</Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Display name</td>
                    <td className="py-2">Personalizing your experience</td>
                    <td className="py-2">
                      <Badge variant="secondary">Only you</Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Your user ID</td>
                    <td className="py-2">Linking reports to your account</td>
                    <td className="py-2">
                      <Badge variant="secondary">Only you</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Report content</td>
                    <td className="py-2">Moderator review</td>
                    <td className="py-2">
                      <Badge variant="outline">Moderators (anonymous)</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Technical Safeguards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Technical Safeguards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-500">
                    Row Level Security (RLS)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    PostgreSQL policies ensure only YOU can query your own
                    reporter ID.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <EyeOff className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-500">
                    Anonymous Views
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Moderators access reports through a sanitized view that
                    excludes reporter identity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-500">
                    No Backdoors
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    There is no admin override to reveal reporter identity. The
                    data is architecturally protected.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">
                  Can the reported person find out who reported them?
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>No.</strong> They only see that their account has been
                  flagged. They never see who flagged them, how many people
                  flagged them, or any report details.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  Can moderators see who I am?
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>No.</strong> Moderators review reports through a
                  system that completely hides reporter identity. They make
                  decisions based on the evidence and abuse category, not on who
                  submitted the report.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  Why do you need my email to sign up?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Email is used solely for preventing spam/bot abuse, allowing
                  you to track your report history, and notifying you about
                  accounts you&apos;ve flagged. Your email is never shared with
                  anyone else.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>Last updated: January 2026</p>
        </div>
      </div>
    </div>
  );
}
