import React, { useState } from "react";

function BorrowCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Office Chair",
      category: "Furniture",
      image:
        "https://images.unsplash.com/photo-1589939705882-c6aa3f1d3642?w=200&h=200&fit=crop",
      available: 5,
      borrowDays: 7,
    },
    {
      id: 2,
      name: "Laptop",
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1588872657840-90a119b3026e?w=200&h=200&fit=crop",
      available: 2,
      borrowDays: 14,
    },
    {
      id: 3,
      name: "Projector",
      category: "Equipment",
      image:
        "https://images.unsplash.com/photo-1595381453635-330f609b4dce?w=200&h=200&fit=crop",
      available: 1,
      borrowDays: 3,
    },
  ]);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleDaysChange = (id, days) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, borrowDays: days } : item
      )
    );
  };

  const totalItems = cartItems.length;

  return (
    <section className="h-full w-full flex flex-col overflow-hidden p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold mb-1">Borrow Cart</h1>
        <p className="text-gray-600 text-sm">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4 h-full">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-3 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm p-4 border border-black/10 flex gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Item Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg shrink-0"
                  />

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {item.category}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        {item.available} available
                      </span>
                    </p>
                  </div>

                  {/* Borrow Duration & Remove */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Remove from cart"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-xs text-gray-500">Duration</label>
                      <select
                        value={item.borrowDays}
                        onChange={(e) =>
                          handleDaysChange(item.id, parseInt(e.target.value))
                        }
                        className="px-3 py-1.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--accent) bg-white"
                      >
                        <option value={1}>1 day</option>
                        <option value={3}>3 days</option>
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-black/10 sticky top-0">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-(--accent)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Request Summary
                </h2>

                {/* Summary Details */}
                <div className="space-y-3 mb-4 pb-4 border-b border-black/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold text-(--accent)">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. Duration</span>
                    <span className="font-medium">
                      {Math.round(
                        cartItems.reduce(
                          (sum, item) => sum + item.borrowDays,
                          0
                        ) / totalItems
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>

                {/* Borrowing Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-blue-900">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Borrowing Terms
                  </h3>
                  <ul className="text-xs text-blue-900 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Maximum borrow period: 30 days
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Late fees apply after due date
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Items must be returned in original condition
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full bg-(--accent) hover:bg-(--accent)/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Submit Request
                  </button>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding items from the catalog
            </p>
            <a
              href="/catalog"
              className="bg-(--accent) hover:bg-(--accent)/90 text-white font-medium py-2 px-6 rounded-lg transition-all hover:shadow-md"
            >
              Browse Items
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default BorrowCart;
