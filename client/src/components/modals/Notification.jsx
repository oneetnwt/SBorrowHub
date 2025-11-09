import React, { useState } from "react";

function Notification({ onClose }) {
  const [activeTab, setActiveTab] = useState("unread");

  const notifications = [
    {
      id: 1,
      code: "OCN-25",
      title: "Item Borrowed",
      status: "In progress",
      description: "Your request for 'Office Chair' has been approved.",
      time: "Thursday 23 Jan, 12:00",
      icon: "📦",
      color: "bg-(--info)",
      isRead: false,
    },
    {
      id: 2,
      code: "OFC-112",
      title: "Return Reminder",
      status: "Action needed",
      description:
        "This request has progressed to the Select Suppliers step. Open the request to make a supplier selection.",
      time: "Thursday 23 Jan, 11:00",
      icon: "⏰",
      color: "bg-(--warning)",
      isRead: false,
    },
    {
      id: 3,
      code: "OFC-101",
      title: "Item Available",
      status: "Action needed",
      description:
        "This request has progressed to the Award step. Open the request to make an award selection.",
      time: "Thursday 23 Jan, 10:00",
      icon: "✓",
      color: "bg-(--accent)",
      isRead: false,
    },
    {
      id: 4,
      code: "OCN-23",
      title: "Completed",
      status: "Completed",
      description:
        "An award selection has been made for this request. Open the request to view the details of the award.",
      time: "Thursday 23 Jan, 10:00",
      icon: "✓",
      color: "bg-(--success)",
      isRead: true,
    },
  ];

  const getStatusColor = (status) => {
    if (status === "In progress") return "bg-(--info)/20 text-(--info)";
    if (status === "Action needed") return "bg-(--warning)/20 text-(--warning)";
    if (status === "Completed") return "bg-(--success)/20 text-(--success)";
    return "bg-(--neutral-200) text-(--neutral-600)";
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Menu */}
      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-black/10 w-96 max-h-[500px] overflow-y-auto z-50">
        {/* Header + Tabs (Fixed together) */}
        <div className="sticky top-0 z-10 bg-white">
          {/* Header */}
          <div className="border-b border-black/10 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Notifications</h2>
            <button className="text-sm font-semibold text-(--accent) hover:text-(--accent-dark)">
              Mark all as read
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-black/10 flex">
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "unread"
                  ? "border-(--accent) text-(--accent)"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "read"
                  ? "border-(--accent) text-(--accent)"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-black/10">
          {notifications
            .filter((notif) => {
              if (activeTab === "unread") return !notif.isRead;
              if (activeTab === "read") return notif.isRead;
              return true;
            })
            .map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notif.isRead ? "bg-white" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Red dot indicator - only for unread */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-(--error) mt-1.5 shrink-0" />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 ${notif.color} rounded-full flex items-center justify-center shrink-0 text-white`}
                  >
                    <span className="text-lg">{notif.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm ${
                          !notif.isRead
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-900"
                        }`}
                      >
                        {notif.code}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                          notif.status
                        )}`}
                      >
                        {notif.status}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        !notif.isRead ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {notif.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                  </div>

                  {/* Time on right */}
                  <div className="text-xs text-gray-500 text-right shrink-0">
                    {notif.time.split(",")[1]?.trim()}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Show more button */}
        <div className="border-t border-black/10 p-4 text-center">
          <button className="text-sm font-semibold text-(--accent) hover:text-(--accent-dark)">
            Show 3 more notifications
          </button>
        </div>
      </div>
    </>
  );
}

export default Notification;
