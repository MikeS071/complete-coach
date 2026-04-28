"use client";

import { Bell, CheckCircle2, ClipboardCheck, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initialNotifications } from "./notifications";

const notificationIconClass = {
  "check-in": "bg-green-50 text-green-700",
  message: "bg-blue-50 text-blue-700",
  form: "bg-indigo-50 text-indigo-700",
  task: "bg-orange-50 text-orange-700"
};

const notificationIcons = {
  "check-in": ClipboardCheck,
  message: MessageCircle,
  form: FileText,
  task: CheckCircle2
};

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, unread: false }))
    );
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={isOpen}
        aria-controls="notification-menu"
        aria-label={`Notifications: ${unreadCount} unread`}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative rounded-xl"
      >
        <Bell className="size-5" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-indigo-700 px-1 text-xs text-white">
          {unreadCount}
        </span>
      </Button>

      {isOpen ? (
        <section
          id="notification-menu"
          role="region"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-border bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Notifications</h2>
              <p className="text-xs text-muted-foreground">{unreadCount} unread updates</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>

          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];

              return (
                <article
                  key={notification.id}
                  className={cn(
                    "flex gap-3 rounded-xl border p-3",
                    notification.unread ? "border-indigo-100 bg-indigo-50/40" : "border-border bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                      notificationIconClass[notification.type]
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{notification.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{notification.time}</span>
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
