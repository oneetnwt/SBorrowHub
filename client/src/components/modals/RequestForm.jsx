import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

function RequestForm({ isOpen, onClose, item }) {
  const [loading, setLoading] = useState(false);
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  console.log(item?._id);

  const [formData, setFormData] = useState({
    itemId: item?._id,
    itemName: item?.name || "",
    quantity: 1,
    borrowDate: getTodayDate(),
    returnDate: "",
    purpose: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Update itemId and itemName when item changes
  useEffect(() => {
    if (item) {
      setFormData((prev) => ({
        ...prev,
        itemId: item._id,
        itemName: item.name || "",
      }));
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (!formData.borrowDate) {
      newErrors.borrowDate = "Borrow date is required";
    }

    if (!formData.returnDate) {
      newErrors.returnDate = "Return date is required";
    }

    if (formData.borrowDate && formData.returnDate) {
      const borrow = new Date(formData.borrowDate);
      const returnDate = new Date(formData.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (borrow < today) {
        newErrors.borrowDate = "Borrow date cannot be in the past";
      }
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    if (item?.quantity && formData.quantity > item.quantity) {
      newErrors.quantity = `Only ${item.quantity} available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);
        const res = await axiosInstance.post("/catalog/request-item", formData);

        if (res.status === 201 || res.status === 200) {
          toast.success("Borrow request submitted successfully!");
          setFormData({
            itemId: item?._id,
            itemName: item?.name || "",
            quantity: 1,
            borrowDate: getTodayDate(),
            returnDate: "",
            purpose: "",
            notes: "",
          });
          setErrors({});
          onClose();
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to submit request"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      itemId: item?._id,
      itemName: item?.name || "",
      quantity: 1,
      borrowDate: getTodayDate(),
      returnDate: "",
      purpose: "",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
      />
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              Borrow Request Form
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill out the details below to submit your borrow request
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-3">
              {/* Item Name (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={item?.quantity || 999}
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) transition-all ${
                    errors.quantity
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.quantity}
                  </p>
                )}
                {item?.quantity && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Available: {item.quantity}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Borrow Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Borrow Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="borrowDate"
                    value={formData.borrowDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) transition-all ${
                      errors.borrowDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.borrowDate ? (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.borrowDate}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Defaults to today
                    </p>
                  )}
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Return Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) transition-all ${
                      errors.returnDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.returnDate && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.returnDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Class project, Event, Research"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) transition-all ${
                    errors.purpose
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.purpose && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.purpose}
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional information or special requests..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${
                  loading
                    ? "bg-(--neutral-500)"
                    : "bg-(--accent) hover:bg-(--accent-dark)"
                }`}
              >
                {loading ? "Requesting Item" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RequestForm;
