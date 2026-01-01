import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, accounts(handle, platform)")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark all as read
  if (notifications && notifications.length > 0) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user?.id || "")
      .eq("read", false);
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "update":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on community alerts and flagged accounts.
        </p>
      </div>

      {/* Notifications List */}
      {!notifications || notifications.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Notifications</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive alerts when flagged accounts reach the report
              threshold.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`bg-card/50 transition-colors ${
                !notification.read ? "border-primary/50" : ""
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
