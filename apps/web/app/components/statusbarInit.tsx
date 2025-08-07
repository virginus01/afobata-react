"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export function StatusBarInit({ overlay, style }: { style: "light" | "dark"; overlay: boolean }) {
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await StatusBar.setOverlaysWebView({
            overlay: overlay ? true : false,
          });
          await StatusBar.setStyle({
            style: style === "light" ? Style.Light : Style.Dark,
          });

          if (!overlay) {
            await StatusBar.setBackgroundColor({ color: "#F3F4F6" });
          }
          await StatusBar.hide();
        }
      } catch (err) {
        if (!(err instanceof Error && err.message.includes("not implemented on web"))) {
          console.error("Error initializing status bar:", err);
        }
      }
    };

    initStatusBar();
  }, [overlay, style]);

  useEffect(() => {
    const initStatusBar = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await StatusBar.setOverlaysWebView({
            overlay: overlay ? true : false,
          });
          await StatusBar.setStyle({
            style: style === "light" ? Style.Light : Style.Dark,
          });
          if (!overlay) {
            await StatusBar.setBackgroundColor({ color: "#F3F4F6" });
          }
          await StatusBar.show();
        }
      } catch (err) {
        if (!(err instanceof Error && err.message.includes("not implemented on web"))) {
          console.error("Error initializing status bar:", err);
        }
      }
    };

    initStatusBar();
  }, [overlay, style]);

  return null;
}
