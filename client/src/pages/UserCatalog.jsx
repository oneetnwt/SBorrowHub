import axiosInstance from "../api/axiosInstance";
import CatalogCard from "../components/CatalogCard";
import CardSkeleton from "../components/skeleton/CardSkeleton";
import Search from "../components/icons/Search";
import RequestForm from "../components/modals/RequestForm";
import { useEffect, useState } from "react";
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
} from "../constants/index";
import Checkbox from "../components/Checkbox";
import toast from "react-hot-toast";

function UserCatalog() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null); // Track which item is being added

  const handleSortChange = (id) => {
    setSelectedSort(selectedSort === id ? null : id);
  };

  const handleCategoryChange = (id) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  const handleAvailabilityChange = (id) => {
    setSelectedAvailability(selectedAvailability === id ? null : id);
  };

  const handleBorrowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (item) => {
    try {
      setAddingToCart(item._id);
      await axiosInstance.post("/cart/add", {
        itemId: item._id,
        quantity: 1,
        borrowDays: 7,
      });
      toast.success(`${item.name} has been added to your cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        error.response?.data?.message || "Failed to add item to cart"
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const clearAllFilters = () => {
    setSelectedSort(null);
    setSelectedCategory(null);
    setSelectedAvailability(null);
    setSearchQuery("");
  };

  const hasActiveFilters = () => {
    return (
      selectedSort ||
      selectedCategory ||
      selectedAvailability ||
      searchQuery.trim()
    );
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { status, data } = await axiosInstance.get("/catalog/get-items");

        if (status === 200) {
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and Sort Items
  const filteredAndSortedItems = () => {
    let result = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tags &&
            item.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )) ||
          (item.category &&
            item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((item) => {
        if (!item.category) return false;
        const itemCategory = item.category.toLowerCase();
        return (
          (selectedCategory === "office" && itemCategory.includes("office")) ||
          (selectedCategory === "sports" && itemCategory.includes("sport"))
        );
      });
    }

    // Apply availability filter
    if (selectedAvailability) {
      result = result.filter((item) => {
        if (selectedAvailability === "available") {
          return item.available > 0;
        } else if (selectedAvailability === "borrowed") {
          return item.quantity > 0 && item.available === 0;
        } else if (selectedAvailability === "unavailable") {
          return item.available === 0;
        }
        return true;
      });
    }

    // Apply sorting
    if (selectedSort) {
      result.sort((a, b) => {
        if (selectedSort === "name") {
          return a.name.localeCompare(b.name);
        } else if (selectedSort === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (selectedSort === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        return 0;
      });
    }

    return result;
  };

  const displayItems = filteredAndSortedItems();

  return (
    <section className="flex h-full w-full">
      {/* Sidebar Filters */}
      <div className="hidden md:block md:fixed md:left-0 md:top-20 mx-25 md:w-64 md:h-[calc(100vh-80px)] md:overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-3 mr-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Filters</h2>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-(--accent) hover:text-(--accent-dark) font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Search</label>
            <div className="shadow-xs border border-black/10 w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:border-(--accent) transition-colors">
              <Search />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm focus:outline-0 w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-3 pb-3 border-b border-black/10">
            <h3 className="font-semibold mb-3 text-sm">Category</h3>
            <div className="space-y-2">
              {CATEGORY_OPTIONS.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  handleChange={() => handleCategoryChange(option.id)}
                  checked={selectedCategory === option.id}
                />
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-4 pb-4 border-b border-black/10">
            <h3 className="font-semibold mb-3 text-sm">Availability</h3>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  id={`availability-${option.id}`}
                  handleChange={() => handleAvailabilityChange(option.id)}
                  checked={selectedAvailability === option.id}
                />
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="mb-2">
            <h3 className="font-semibold mb-3 text-sm">Sort By</h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  id={`sort-${option.id}`}
                  handleChange={() => handleSortChange(option.id)}
                  checked={selectedSort === option.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-65 flex flex-col h-full w-full">
        {/* Item Catalog Header */}
        <div className="sticky top-0 z-10 bg-(--background) px-3 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Item Catalog</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isLoading ? (
                  "Loading items..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold">{displayItems.length}</span>{" "}
                    of <span className="font-semibold">{items.length}</span>{" "}
                    items
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {/* Items Catalog */}
        <div className="overflow-y-auto flex-1 px-3 pb-4">
          <div className="md:grid md:grid-cols-4 gap-3">
            {isLoading ? (
              <>
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
              </>
            ) : displayItems.length > 0 ? (
              displayItems.map((item) => (
                <CatalogCard
                  key={item._id}
                  name={item.name}
                  quantity={item.available}
                  tags={item.tags}
                  image={item.image}
                  onBorrowClick={() => handleBorrowClick(item)}
                  onAddToCart={() => handleAddToCart(item)}
                  isAddingToCart={addingToCart === item._id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-semibold mb-2">
                  No items found
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      <RequestForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </section>
  );
}

export default UserCatalog;
