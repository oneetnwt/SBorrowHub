import { useState } from "react";

function OfficerHelp() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: "getting-started", name: "Getting Started", icon: "🚀" },
    { id: "inventory", name: "Inventory Management", icon: "📦" },
    { id: "requests", name: "Borrow Requests", icon: "📝" },
    { id: "users", name: "User Management", icon: "👥" },
    { id: "troubleshooting", name: "Troubleshooting", icon: "🔧" },
  ];

  const faqs = {
    "getting-started": [
      {
        question: "How do I access the officer panel?",
        answer:
          "You need an officer role assigned to your account. Log in with your officer credentials and you'll be automatically redirected to the officer dashboard.",
      },
      {
        question: "What are my main responsibilities as an officer?",
        answer:
          "As an officer, you manage inventory, review and approve/reject borrow requests, track transactions, monitor user activity, and ensure items are properly maintained and returned.",
      },
      {
        question: "How do I navigate the officer panel?",
        answer:
          "Use the sidebar menu: Dashboard for overview statistics, Inventory for item management, Requests for pending approvals, Users for user info, Analytics for reports, and Settings for preferences.",
      },
    ],
    inventory: [
      {
        question: "How do I add a new item to inventory?",
        answer:
          "Go to Inventory page, click 'Add Item' button, fill in item details (name, category, quantity, description, image), set availability status, and click Save. The item will immediately appear in the catalog.",
      },
      {
        question: "How do I update item information?",
        answer:
          "In the Inventory page, find the item you want to edit, click the edit icon, modify the details, and save. Changes will reflect immediately across the system.",
      },
      {
        question: "How do I mark an item as unavailable?",
        answer:
          "Edit the item and toggle the 'Available' switch to Off. This prevents users from borrowing it while you maintain or repair it. Don't forget to mark it available again when ready.",
      },
      {
        question: "Can I delete items from inventory?",
        answer:
          "Yes, but only if the item has no active borrowings. Click the delete icon on the item. Items with pending returns should be marked unavailable instead of deleted.",
      },
      {
        question: "How do I track item quantities?",
        answer:
          "The inventory page shows total quantity and available quantity for each item. Available quantity updates automatically when items are borrowed or returned.",
      },
    ],
    requests: [
      {
        question: "How do I approve a borrow request?",
        answer:
          "Go to Requests page, review the pending request details (user info, items, duration), verify item availability, then click 'Approve'. The user will be notified and can pick up the items.",
      },
      {
        question: "What should I check before approving a request?",
        answer:
          "Verify: 1) Items are available in sufficient quantity, 2) User has no overdue items, 3) Request duration is reasonable, 4) User information is complete and verified.",
      },
      {
        question: "How do I reject a request?",
        answer:
          "Click on the request, select 'Reject', provide a clear reason (e.g., item unavailable, incomplete info), and confirm. The user will receive notification with your reason.",
      },
      {
        question: "Can I modify a request before approving?",
        answer:
          "You can communicate with users about modifications, but can't directly edit their requests. Either approve as-is, reject with instructions, or ask them to submit a new request.",
      },
      {
        question: "How do I process returns?",
        answer:
          "Go to Transactions, find the active borrowing, inspect returned items for damage, then click 'Mark as Returned'. This updates inventory and closes the transaction.",
      },
    ],
    users: [
      {
        question: "How do I view user details?",
        answer:
          "Navigate to Users page, click on any user to view their complete profile including contact info, borrowing history, active requests, and account status.",
      },
      {
        question: "Can I see a user's borrowing history?",
        answer:
          "Yes, in the user details page, scroll to the 'Transaction History' section to see all past and current borrowings, including dates, items, and return status.",
      },
      {
        question: "What if a user has overdue items?",
        answer:
          "Check the user's active transactions for overdue items (highlighted in red). Contact the user via their email/phone, send reminders, and follow your organization's overdue item policy.",
      },
      {
        question: "Can I block a user from borrowing?",
        answer:
          "This requires admin privileges. As an officer, you can reject their requests individually. Contact an admin if a user needs to be blocked system-wide.",
      },
    ],
    troubleshooting: [
      {
        question: "Item quantity not updating after approval. Why?",
        answer:
          "Refresh the page first. If the issue persists, check if the approval was actually successful in the Transactions page. If data is inconsistent, contact an admin to check system logs.",
      },
      {
        question: "Can't approve a request - button is disabled.",
        answer:
          "This usually means: 1) Insufficient item quantity available, 2) Request already processed, or 3) System is updating. Check item stock and request status.",
      },
      {
        question: "User says they didn't receive approval notification.",
        answer:
          "Verify the approval was saved (check Transactions), ask user to check spam folder, and verify their email in the Users page. You can manually notify them as backup.",
      },
      {
        question: "Analytics page showing incorrect data.",
        answer:
          "Try refreshing the page. Analytics updates may have a slight delay. If numbers seem very wrong, report to admin with specific details about which metrics are incorrect.",
      },
    ],
  };

  const resources = [
    {
      title: "Officer Manual",
      description: "Complete guide for officer operations",
      icon: "📖",
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step process guides",
      icon: "🎥",
      link: "#",
    },
    {
      title: "Best Practices",
      description: "Tips for efficient request handling",
      icon: "⭐",
      link: "#",
    },
    {
      title: "Contact Admin",
      description: "Get help from system administrators",
      icon: "💬",
      link: "#contact",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Officer Help & Support Center
          </h1>
          <p className="text-gray-600">
            Find answers to common questions about managing the borrow system
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeCategory === category.id
                        ? "bg-(--accent) text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Quick Info
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>System Version</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span className="font-medium">Dec 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-medium text-green-600">Online</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {categories.find((c) => c.id === activeCategory)?.name}
              </h2>

              <div className="space-y-4">
                {faqs[activeCategory]?.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                    >
                      <span className="font-semibold text-gray-900">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedFAQ === index ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-white">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerHelp;
