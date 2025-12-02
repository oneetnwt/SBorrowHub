import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function BorrowCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    fetchCart();
    // Set default borrow date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBorrowDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cart");
      const items = response.data.items || [];
      setCartItems(items);

      // Set initial return date based on first item or default to 7 days from now
      if (items.length > 0 && !returnDate) {
        const date = new Date();
        date.setDate(date.getDate() + (items[0].borrowDays || 7));
        setReturnDate(date.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await axiosInstance.delete(`/cart/remove/${itemId}`);
      setCartItems(cartItems.filter((item) => item.itemId._id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleDateChange = async (selectedDate) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const returnDateObj = new Date(selectedDate);
      returnDateObj.setHours(0, 0, 0, 0);
      const days = Math.ceil((returnDateObj - today) / (1000 * 60 * 60 * 24));

      if (days < 1) {
        toast.error("Return date must be at least tomorrow");
        return;
      }

      setReturnDate(selectedDate);

      // Update all items with the same borrowDays
      const updatePromises = cartItems.map((item) =>
        axiosInstance.put(`/cart/update/${item.itemId._id}`, {
          borrowDays: days,
        })
      );

      await Promise.all(updatePromises);

      // Refresh cart to get updated data
      const response = await axiosInstance.get("/cart");
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error updating items:", error);
      toast.error("Failed to update return date");
    }
  };

  const handleQuantityChange = async (itemId, newQuantity, available) => {
    if (newQuantity < 1) return;
    if (newQuantity > available) {
      toast.error(`Only ${available} items available`);
      return;
    }

    // Optimistic update - update UI immediately
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.itemId._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await axiosInstance.put(`/cart/update/${itemId}`, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
      // Revert on error
      fetchCart();
    }
  };

  const handleSubmitRequest = async () => {
    if (!borrowDate) {
      toast.error("Please select a borrow date");
      return;
    }

    if (!returnDate) {
      toast.error("Please select a return date");
      return;
    }

    if (!purpose.trim()) {
      toast.error("Please provide a purpose for borrowing");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      // Convert borrowDate from YYYY-MM-DD to ISO string
      const borrowDateObj = new Date(borrowDate);
      borrowDateObj.setHours(0, 0, 0, 0);
      const borrowDateISO = borrowDateObj.toISOString();

      // Convert returnDate from YYYY-MM-DD to ISO string
      const returnDateObj = new Date(returnDate);
      returnDateObj.setHours(23, 59, 59, 999);
      const returnDateISO = returnDateObj.toISOString();

      // Validate that return date is after borrow date
      if (returnDateObj <= borrowDateObj) {
        toast.error("Return date must be after borrow date");
        setSubmitting(false);
        return;
      }

      // Create borrow requests for each cart item
      const requestPromises = cartItems.map((item) =>
        axiosInstance.post("/catalog/request-item", {
          itemId: item.itemId._id,
          quantity: item.quantity,
          borrowDate: borrowDateISO,
          returnDate: returnDateISO,
          purpose: purpose.trim(),
          notes: "",
        })
      );

      await Promise.all(requestPromises);

      // Clear the cart after successful submission
      await axiosInstance.delete("/cart/clear");

      // Reset state
      setCartItems([]);
      setReturnDate("");
      setPurpose("");

      toast.success(
        `Successfully submitted ${cartItems.length} borrow request(s)!`
      );
    } catch (error) {
      console.error("Error submitting requests:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit borrow requests. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = cartItems.length;

  return (
    <section className="h-full w-full flex flex-col overflow-hidden bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Borrowing Cart</h1>
          <p className="text-gray-600 text-sm mt-1">
            Review your selected items and confirm your borrowing request
          </p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader variant="spinner" size="lg" />
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Selected Items ({totalItems})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div
                        key={item.itemId._id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-6">
                          {/* Item Image */}
                          <div className="shrink-0">
                            <div className="w-24 h-24 rounded-lg bg-white border border-gray-200 p-2 flex items-center justify-center overflow-hidden">
                              <img
                                src={
                                  item.itemId?.image ||
                                  "https://via.placeholder.com/96"
                                }
                                alt={item.itemId?.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/96";
                                }}
                              />
                            </div>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {item.itemId.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                  Category: {item.itemId.category}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg
                                      className="w-3.5 h-3.5 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {item.itemId.available} Available
                                  </span>
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemove(item.itemId._id)}
                                className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                                title="Remove item"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="mt-4 flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700">
                                Quantity:
                              </label>
                              <div className="inline-flex items-center border border-gray-300 rounded-lg shadow-sm bg-white">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.itemId._id,
                                      item.quantity - 1,
                                      item.itemId.available
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                                <span className="px-6 py-2 text-base font-semibold text-gray-900 min-w-16 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.itemId._id,
                                      item.quantity + 1,
                                      item.itemId.available
                                    )
                                  }
                                  disabled={
                                    item.quantity >= item.itemId.available
                                  }
                                  className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">
                      Request Summary
                    </h2>
                  </div>

                  <div className="px-6 py-5 space-y-6">
                    {/* Total Items */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        Total Items
                      </span>
                      <span className="text-2xl font-bold text-(--accent)">
                        {totalItems}
                      </span>
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Purpose of Borrowing
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Please describe why you need these items..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent bg-white shadow-sm resize-none"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Required for request approval
                      </p>
                    </div>

                    {/* Borrow Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Borrow Date
                      </label>
                      <input
                        type="date"
                        min={
                          new Date(Date.now() + 86400000)
                            .toISOString()
                            .split("T")[0]
                        }
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent bg-white shadow-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        When you plan to pick up the items
                      </p>
                    </div>

                    {/* Return Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Expected Return Date
                      </label>
                      <input
                        type="date"
                        min={
                          borrowDate ||
                          new Date(Date.now() + 86400000)
                            .toISOString()
                            .split("T")[0]
                        }
                        value={returnDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent bg-white shadow-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        When you will return all items
                      </p>
                    </div>

                    {/* Borrowing Terms */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900">
                        <svg
                          className="w-5 h-5"
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
                      <ul className="text-xs text-blue-900 space-y-2">
                        <li className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-blue-600 mt-0.5 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Maximum borrow period: 30 days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-blue-600 mt-0.5 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Late fees apply after due date</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-blue-600 mt-0.5 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            Items must be returned in original condition
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <button
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                        className="w-full bg-(--accent) hover:bg-(--accent)/90 text-white font-semibold py-3.5 px-4 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
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
                            Submit Borrow Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate("/catalog")}
                        className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all"
                      >
                        Continue Browsing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Cart is Empty
                </h3>
                <p className="text-gray-600 mb-8">
                  Browse our catalog and add items to get started with your
                  borrowing request
                </p>
                <button
                  onClick={() => navigate("/catalog")}
                  className="bg-(--accent) hover:bg-(--accent)/90 text-white font-semibold py-3 px-8 rounded-lg transition-all hover:shadow-lg inline-flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Browse Catalog
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BorrowCart;
