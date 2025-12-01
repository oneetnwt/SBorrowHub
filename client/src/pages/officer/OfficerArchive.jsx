import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/modals/ConfirmModal";

const OfficerArchive = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const categories = [
    "All",
    "Office Supplies",
    "Electronics",
    "Cables",
    "Equipment",
    "Tools",
    "Others",
  ];

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchArchivedItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/catalog/get-archived-items");
      setArchivedItems(response.data);
    } catch (error) {
      console.error("Error fetching archived items:", error);
      setToast({
        message: "Failed to load archived items",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreItem = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/catalog/unarchive-item/${selectedItem._id}`);
      setArchivedItems(
        archivedItems.filter((item) => item._id !== selectedItem._id)
      );
      setIsRestoreModalOpen(false);
      setSelectedItem(null);
      setToast({
        message: "Item restored successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error restoring item:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to restore item. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openRestoreModal = (item) => {
    setSelectedItem(item);
    setIsRestoreModalOpen(true);
  };

  const filteredItems = archivedItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && archivedItems.length === 0) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Archived Items</h1>
        <p className="text-gray-600 mt-1">
          View and restore archived items from your inventory
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Items
            </label>
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Archived Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
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
          </div>
          <p className="text-gray-500 text-lg">No archived items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">
                    Quantity:{" "}
                    <span className="font-medium">{item.quantity}</span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.condition === "Good"
                        ? "bg-green-100 text-green-800"
                        : item.condition === "Fair"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
                <button
                  onClick={() => openRestoreModal(item)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={loading}
                >
                  Restore Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {isRestoreModalOpen && (
        <ConfirmModal
          isOpen={isRestoreModalOpen}
          onClose={() => {
            setIsRestoreModalOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={handleRestoreItem}
          title="Restore Item"
          message={`Are you sure you want to restore "${selectedItem?.name}"? This will move it back to your active inventory.`}
          confirmText="Restore"
          cancelText="Cancel"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OfficerArchive;
