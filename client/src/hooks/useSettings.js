import { useState, useEffect } from "react";

const defaultSettings = {
  // Notification Settings
  emailNotifications: true,
  borrowReminders: true,
  returnReminders: true,
  overdueAlerts: true,
  newItemAlerts: false,

  // Privacy Settings
  showProfile: true,
  showBorrowHistory: false,
  allowMessages: true,

  // Preferences
  language: "english",
  itemsPerPage: "12",
  defaultView: "grid",
};

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error("Error parsing settings:", error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error("Error parsing settings:", error);
        }
      }
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return settings;
};
