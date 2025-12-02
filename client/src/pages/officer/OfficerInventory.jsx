import React, { useState, useEffect } from "react";
import Modal from "../../components/modals/Modal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import Toast from "../../components/Toast";
import axiosInstance from "../../api/axiosInstance";

function OfficerInventory() {
  // TODO: Replace with API call to fetch items from backend
  // GET /api/admin/items
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    quantity: 0,
    available: 0,
    condition: "Good",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    "All",
    "Office Supplies",
    "Electronics",
    "Cables",
    "Equipment",
    "Tools",
    "Others",
  ];

  console.log(formData);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        let url = "/catalog/get-items";

        // If date filter is active and date is set, use availability endpoint
        if (isDateFilterActive && selectedDate) {
          url = `/catalog/get-items-availability?startDate=${selectedDate}&endDate=${selectedDate}`;
        }

        const response = await axiosInstance.get(url);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [isDateFilterActive, selectedDate]);

  const filteredItems = items.filter((item) => {
    const name = item?.name || ""; // fallback to empty string
    const matchesSearch = name
      .toLowerCase()
      .includes(searchTerm?.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Item name is required";
    }
    if (!formData.description || formData.description.trim() === "") {
      errors.description = "Description is required";
    }
    if (!formData.category || formData.category === "") {
      errors.category = "Category is required";
    }
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.image || formData.image.trim() === "") {
      errors.image = "Image is required";
    }
    return errors;
  };

  const handleAddItem = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setFormErrors({});
    setLoading(true);
    try {
      const newItem = {
        ...formData,
        available: formData.quantity || 1,
      };
      const response = await axiosInstance.post("/catalog/add-item", newItem);
      // Backend returns { message, newItem }, so we need response.data.newItem
      setItems([...items, response.data.newItem]);
      setIsAddModalOpen(false);
      resetForm();
      setToast({
        message: "Item added successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to add item. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setFormErrors({});
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/catalog/update-item/${selectedItem._id}`,
        {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          condition: formData.condition,
          image: formData.image,
        }
      );
      setItems(
        items.map((item) =>
          item._id === selectedItem._id ? response.data : item
        )
      );
      setIsEditModalOpen(false);
      resetForm();
      setToast({
        message: "Item updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to update item. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/catalog/archive-item/${selectedItem._id}`);
      setItems(items.filter((item) => item._id !== selectedItem._id));
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setToast({
        message: "Item archived successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error archiving item:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to archive item. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity.toString(),
      condition: item.condition,
      image: item.image,
    });
    setImagePreview(item.image);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      quantity: "",
      condition: "Good",
      image: "",
    });
    setSelectedItem(null);
    setImageFile(null);
    setImagePreview("");
    setFormErrors({});
  };

  const getStockStatus = (item) => {
    const percentage = (item.available / item.quantity) * 100;
    if (percentage <= 20)
      return { text: "Low Stock", color: "text-red-600 bg-red-50" };
    if (percentage <= 50)
      return { text: "Medium", color: "text-yellow-600 bg-yellow-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Manage all borrowable items in the system
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent) transition-all"
            />
          </div>

          {/* Date Filter */}
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent) text-sm"
            />
            <button
              onClick={() => {
                if (selectedDate) {
                  setIsDateFilterActive(true);
                }
              }}
              disabled={!selectedDate}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Apply
            </button>
            {isDateFilterActive && (
              <button
                onClick={() => {
                  setSelectedDate("");
                  setIsDateFilterActive(false);
                }}
                className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter & Add Button */}
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent) bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Item
            </button>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {isDateFilterActive && selectedDate && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
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
            <span className="text-sm text-blue-800">
              Showing availability for:{" "}
              <span className="font-semibold">
                {new Date(selectedDate).toLocaleDateString()}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredItems.map((item) => {
          const status = getStockStatus(item);
          return (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                >
                  {status.text}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-3 mb-3 py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total</p>
                    <p className="text-base font-bold text-gray-900">
                      {item.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Available</p>
                    <p className="text-base font-bold text-(--accent)">
                      {isDateFilterActive &&
                      item.availableForDateRange !== undefined
                        ? item.availableForDateRange
                        : item.available}
                    </p>
                  </div>
                </div>

                {/* Condition & Date */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>
                    Condition:{" "}
                    <span className="font-medium text-gray-700">
                      {item.condition}
                    </span>
                  </span>
                  <span>Updated: {item.lastUpdated}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={isEditModalOpen ? "Edit Item" : "Add New Item"}
        size="md"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-(--accent) file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-(--accent) file:text-white hover:file:bg-(--accent-dark) file:cursor-pointer ${
                    formErrors.image
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-(--accent)"
                  }`}
                />
                {formErrors.image && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.image}
                  </p>
                )}
                {imagePreview && (
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setFormData({ ...formData, image: "" });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${
                  formErrors.name
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-(--accent) focus:border-(--accent)"
                }`}
                placeholder="Enter item name"
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${
                  formErrors.description
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-(--accent) focus:border-(--accent)"
                }`}
                placeholder="Enter item description"
              />
              {formErrors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${
                    formErrors.category
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-(--accent) focus:border-(--accent)"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
                {formErrors.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${
                    formErrors.quantity
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-(--accent) focus:border-(--accent)"
                  }`}
                  placeholder="0"
                  min="1"
                />
                {formErrors.quantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={isEditModalOpen ? handleEditItem : handleAddItem}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors
                ${
                  loading
                    ? "bg-linear-to-r from-(--neutral-400) to-(--neutral-300)"
                    : " bg-(--accent) hover:bg-(--accent-dark)  "
                }
              `}
            >
              {loading
                ? "Adding Items"
                : `${isEditModalOpen ? "Update Item" : "Add Item"}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}

export default OfficerInventory;
