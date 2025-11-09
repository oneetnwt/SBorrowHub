import React, { useState } from "react";

function UserSettings() {
  const [settings, setSettings] = useState({
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
    theme: "light",
    itemsPerPage: "12",
    defaultView: "grid",
  });

  const [activeTab, setActiveTab] = useState("notifications");

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const tabs = [
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🛡️" },
  ];

  return (
    <section className="h-full w-full flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-gray-600 text-sm">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4">
        {/* Sidebar Tabs */}
        <div className="md:w-64 bg-white rounded-lg shadow-sm border border-black/10 p-2 md:h-fit">
          <div className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-(--accent) text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-black/10 overflow-y-auto">
          <div className="p-6">
            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Notification Settings
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Choose how you want to be notified about important events
                </p>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive notifications via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle("emailNotifications")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* Borrow Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Borrow Request Updates
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get notified when your borrow requests are approved or
                        declined
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.borrowReminders}
                        onChange={() => handleToggle("borrowReminders")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* Return Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Return Reminders
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get reminded before items are due for return
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.returnReminders}
                        onChange={() => handleToggle("returnReminders")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* Overdue Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Overdue Alerts
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive alerts when items are overdue
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.overdueAlerts}
                        onChange={() => handleToggle("overdueAlerts")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* New Item Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        New Item Alerts
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get notified when new items are added to the catalog
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.newItemAlerts}
                        onChange={() => handleToggle("newItemAlerts")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Control your privacy and data sharing preferences
                </p>

                <div className="space-y-4">
                  {/* Show Profile */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Public Profile
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow others to view your profile information
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showProfile}
                        onChange={() => handleToggle("showProfile")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* Show Borrow History */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Show Borrow History
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow others to see your borrowing history
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showBorrowHistory}
                        onChange={() => handleToggle("showBorrowHistory")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  {/* Allow Messages */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Allow Messages
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow other users to send you messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowMessages}
                        onChange={() => handleToggle("allowMessages")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--accent)/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
                    </label>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">
                          Privacy Information
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your personal information is always kept secure and
                          will never be shared with third parties without your
                          consent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Preferences</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Customize your experience with SBorrowHub
                </p>

                <div className="space-y-6">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
                    >
                      <option value="english">English</option>
                      <option value="tagalog">Tagalog</option>
                      <option value="cebuano">Cebuano</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["light", "dark", "auto"].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleChange("theme", theme)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            settings.theme === theme
                              ? "border-(--accent) bg-(--accent)/10"
                              : "border-black/10 hover:border-black/20"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">
                              {theme === "light" && "☀️"}
                              {theme === "dark" && "🌙"}
                              {theme === "auto" && "🔄"}
                            </div>
                            <p className="text-sm font-medium capitalize">
                              {theme}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items Per Page */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Items Per Page
                    </label>
                    <select
                      value={settings.itemsPerPage}
                      onChange={(e) =>
                        handleChange("itemsPerPage", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
                    >
                      <option value="8">8 items</option>
                      <option value="12">12 items</option>
                      <option value="24">24 items</option>
                      <option value="48">48 items</option>
                    </select>
                  </div>

                  {/* Default View */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Default Catalog View
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleChange("defaultView", "grid")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.defaultView === "grid"
                            ? "border-(--accent) bg-(--accent)/10"
                            : "border-black/10 hover:border-black/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          <span className="font-medium">Grid View</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleChange("defaultView", "list")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.defaultView === "list"
                            ? "border-(--accent) bg-(--accent)/10"
                            : "border-black/10 hover:border-black/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          </svg>
                          <span className="font-medium">List View</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Manage your account security and password
                </p>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Change Password
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
                        />
                      </div>
                      <button className="w-full bg-(--accent) hover:bg-(--accent-dark) text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Not Enabled
                        </span>
                      </div>
                      <button className="bg-(--accent) hover:bg-(--accent-dark) text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                        Enable
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-(--accent)/10 rounded-lg flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-(--accent)"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              Windows PC - Chrome
                            </p>
                            <p className="text-xs text-gray-600">
                              Current session • Cagayan de Oro, Philippines
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
                      Sign out all other sessions
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-black/10 flex justify-end gap-3">
              <button className="px-6 py-2 border border-black/10 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Reset to Default
              </button>
              <button className="px-6 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserSettings;
