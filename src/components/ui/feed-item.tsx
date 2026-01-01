"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Instagram,
  Twitter,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

export interface FeedItemData {
  id: string;
  account_id: string;
  activity_type:
    | "new_report"
    | "threshold_reached"
    | "status_changed"
    | "verified";
  platform: "instagram" | "x";
  handle: string;
  description: string;
  created_at: string;
}

interface FeedItemProps {
  item: FeedItemData;
}

export function FeedItem({ item }: FeedItemProps) {
  const getActivityConfig = (type: FeedItemData["activity_type"]) => {
    switch (type) {
      case "new_report":
        return {
          icon: Activity,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        };
      case "threshold_reached":
        return {
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
        };
      case "status_changed":
        return {
          icon: Shield,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        };
      case "verified":
        return {
          icon: CheckCircle,
          color: "text-red-600",
          bgColor: "bg-red-600/10",
        };
      default:
        return {
          icon: Activity,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
        };
    }
  };

  const activityConfig = getActivityConfig(item.activity_type);
  const ActivityIcon = activityConfig.icon;
  const PlatformIcon = item.platform === "instagram" ? Instagram : Twitter;

  return (
    <Card className="hover:bg-secondary/20 transition-colors">
      <CardContent className="p-4 flex gap-4">
        {/* Activity Icon */}
        <div className={cn("p-2 rounded-full h-fit", activityConfig.bgColor)}>
          <ActivityIcon className={cn("w-5 h-5", activityConfig.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{item.description}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlatformIcon className="w-3 h-3" />@{item.handle}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Link href={`/search/${item.platform}/${item.handle}`}>
          <div className="p-2 hover:bg-secondary rounded-full transition-colors">
            <span className="sr-only">View Details</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-muted-foreground"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
