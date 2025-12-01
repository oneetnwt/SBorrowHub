import { useState } from "react";

function UserHelp() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: "getting-started", name: "Getting Started", icon: "🚀" },
    { id: "browsing", name: "Browsing Items", icon: "🔍" },
    { id: "borrowing", name: "Borrowing Process", icon: "📦" },
    { id: "account", name: "Account & Profile", icon: "👤" },
    { id: "troubleshooting", name: "Troubleshooting", icon: "🔧" },
  ];

  const faqs = {
    "getting-started": [
      {
        question: "How do I create an account?",
        answer:
          "Click on 'Sign Up' on the login page, fill in your details including full name, email, student/employee ID, and password. You'll receive a verification email to activate your account.",
      },
      {
        question: "What can I do in the borrow system?",
        answer:
          "You can browse available items, add them to your cart, submit borrow requests, track your active borrowings, view transaction history, and manage your profile.",
      },
      {
        question: "How do I navigate the system?",
        answer:
          "Use the sidebar menu to access Dashboard (overview), Catalog (browse items), Cart (pending requests), and Profile (your account and history).",
      },
    ],
    browsing: [
      {
        question: "How do I search for items?",
        answer:
          "Go to the Catalog page and use the search bar at the top. You can search by item name, category, or description. Use the filter options to narrow down results.",
      },
      {
        question: "What does 'Available' status mean?",
        answer:
          "Items marked as 'Available' are currently in stock and ready to be borrowed. Items showing 'Unavailable' are either all borrowed out or under maintenance.",
      },
      {
        question: "Can I see item details before borrowing?",
        answer:
          "Yes! Click on any item card to view detailed information including description, specifications, available quantity, and borrowing policies.",
      },
    ],
    borrowing: [
      {
        question: "How do I borrow an item?",
        answer:
          "Browse the catalog, click 'Add to Cart' on desired items, specify quantity and duration, then go to your Cart and click 'Submit Request'. An officer will review and approve your request.",
      },
      {
        question: "How long can I borrow items?",
        answer:
          "Borrowing duration varies by item type and is set by officers. Typical periods range from 1 day to 2 weeks. Check item details or ask an officer for specific policies.",
      },
      {
        question: "What happens after I submit a borrow request?",
        answer:
          "Your request goes to the pending queue where officers review it. You'll receive a notification when it's approved or if more information is needed. Once approved, you can pick up the items.",
      },
      {
        question: "Can I cancel a pending request?",
        answer:
          "Yes, go to your Cart or Transaction History, find the pending request, and click 'Cancel Request'. This is only possible before an officer processes it.",
      },
      {
        question: "How do I return borrowed items?",
        answer:
          "Return items to the designated return location before the due date. An officer will check the items and mark them as returned in the system.",
      },
    ],
    account: [
      {
        question: "How do I update my profile information?",
        answer:
          "Go to Profile > Edit Profile. You can update your contact information, phone number, and upload a profile picture. Your student/employee ID cannot be changed.",
      },
      {
        question: "How do I change my password?",
        answer:
          "In your Profile settings, look for 'Change Password' option. You'll need to enter your current password and then set a new one.",
      },
      {
        question: "Where can I see my borrowing history?",
        answer:
          "Navigate to Profile > Transactions to view your complete borrowing history including active, completed, and cancelled requests.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Click 'Forgot Password' on the login page, enter your email, and you'll receive a verification code. Use that code to reset your password.",
      },
    ],
    troubleshooting: [
      {
        question: "I can't add items to my cart. Why?",
        answer:
          "Check if the item is available and in stock. Make sure you're logged in and your account is verified. If the issue persists, try refreshing the page or clearing your browser cache.",
      },
      {
        question: "My request was rejected. What now?",
        answer:
          "Check the rejection reason in your transaction history. Common reasons include item unavailability, incomplete information, or policy violations. You can submit a new request after addressing the issues.",
      },
      {
        question: "I didn't receive a notification email.",
        answer:
          "Check your spam/junk folder. Verify your email address is correct in your profile. If emails still don't arrive, contact system administrators.",
      },
      {
        question: "The page is loading slowly or not working.",
        answer:
          "Try refreshing the page, clearing your browser cache, or using a different browser. Ensure you have a stable internet connection. If problems continue, report to support.",
      },
    ],
  };

  const resources = [
    {
      title: "User Guide",
      description: "Complete guide to using the borrow system",
      icon: "📖",
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: "🎥",
      link: "#",
    },
    {
      title: "Borrowing Policies",
      description: "Read our terms and borrowing rules",
      icon: "📋",
      link: "/terms",
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
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
            Help & Support Center
          </h1>
          <p className="text-gray-600">
            Find answers to common questions and learn how to use the system
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

export default UserHelp;
