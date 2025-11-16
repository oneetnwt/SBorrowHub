import React, { useState } from "react";

function OfficerSettings() {
  // TODO: Replace with API call to fetch system settings from backend
  // GET /api/admin/settings
  const [settings, setSettings] = useState({
    systemName: "SBorrowHub",
    maxBorrowDays: 7,
    maxItemsPerUser: 3,
    allowReservations: true,
    requireApproval: true,
    emailNotifications: true,
    overdueReminders: true,
  });

  const handleSave = () => {
    // TODO: Replace with API call to save settings
    // PUT /api/admin/settings
    // Body: settings object
    alert("Settings saved successfully!");
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Configure system preferences and rules
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-4xl space-y-4">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-lg text-gray-900 mb-3">
            General Settings
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) =>
                  setSettings({ ...settings, systemName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
              />
            </div>
          </div>
        </div>

        {/* Borrowing Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-lg text-gray-900 mb-3">
            Borrowing Rules
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Borrow Days
              </label>
              <input
                type="number"
                value={settings.maxBorrowDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxBorrowDays: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default number of days users can borrow items
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Items Per User
              </label>
              <input
                type="number"
                value={settings.maxItemsPerUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxItemsPerUser: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum items a user can borrow at once
              </p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-lg text-gray-900 mb-3">Features</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  Allow Reservations
                </p>
                <p className="text-xs text-gray-500">
                  Users can reserve items in advance
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowReservations}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowReservations: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-(--accent)/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  Require Approval
                </p>
                <p className="text-xs text-gray-500">
                  Admin must approve all borrow requests
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requireApproval: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-(--accent)/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Send email notifications to users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-(--accent)/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  Overdue Reminders
                </p>
                <p className="text-xs text-gray-500">
                  Automatically send reminders for overdue items
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.overdueReminders}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      overdueReminders: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-(--accent)/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--accent)"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-(--accent) hover:bg-(--accent-dark) text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </section>
  );
}

export default OfficerSettings;
