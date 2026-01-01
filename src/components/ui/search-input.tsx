"use client";

import { useState, useCallback } from "react";
import { Search, Instagram, Twitter, Loader2 } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Platform = "instagram" | "x" | "all";

interface SearchInputProps {
  onSearch: (handle: string, platform: Platform) => void;
  isLoading?: boolean;
  defaultPlatform?: Platform;
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  onSearch,
  isLoading = false,
  defaultPlatform = "all",
  className,
  placeholder = "Enter username to search...",
}: SearchInputProps) {
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (handle.trim()) {
        // Remove @ symbol if present
        const cleanHandle = handle.trim().replace(/^@/, "");
        onSearch(cleanHandle, platform);
      }
    },
    [handle, platform, onSearch]
  );

  const platformButtons: {
    value: Platform;
    label: string;
    icon?: React.ReactNode;
  }[] = [
    { value: "all", label: "All" },
    {
      value: "instagram",
      label: "Instagram",
      icon: <Instagram className="w-4 h-4" />,
    },
    { value: "x", label: "X", icon: <Twitter className="w-4 h-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {/* Platform Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Platform:</span>
        <div className="flex gap-1">
          {platformButtons.map((p) => (
            <button
              key={p.value}
              type="button"
              disabled={isLoading}
              onClick={() => setPlatform(p.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                platform === p.value
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-12 text-base"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!handle.trim() || isLoading}
          className="h-12 px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
