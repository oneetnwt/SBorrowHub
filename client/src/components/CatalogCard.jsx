import React from "react";

function CatalogCard({
  name,
  quantity,
  tags,
  image,
  onBorrowClick,
  onAddToCart,
  isAddingToCart = false,
  isAvailable = true,
}) {
  return (
    <div
      className={`w-full rounded-md shadow-sm p-3 bg-white border hover:shadow-md transition-all relative ${
        isAvailable ? "border-black/10" : "border-red-200 bg-gray-50"
      }`}
    >
      {/* Unavailable Badge */}
      {!isAvailable && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          Not Available
        </div>
      )}

      <img
        src={image}
        alt={name}
        className={`w-full h-40 object-cover rounded-md ${
          !isAvailable ? "opacity-60 grayscale" : ""
        }`}
      />
      <h3
        className={`font-medium text-md my-3 ${
          !isAvailable ? "text-gray-500" : ""
        }`}
      >
        {name}
      </h3>
      <span>
        <h6 className="text-sm text-gray-500">Available</h6>
        <p
          className={`text-sm font-medium ${
            !isAvailable ? "text-red-600" : ""
          }`}
        >
          {quantity}
        </p>
      </span>
      <div className="my-3 pt-3 flex items-center gap-3 border-t border-black/10">
        {tags &&
          tags.map((tag) => (
            <div
              key={tag}
              className="text-xs py-1 px-2 rounded-full bg-gray-200 w-fit hover:bg-gray-300 transition-colors"
            >
              {tag}
            </div>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !isAvailable}
          className="text-sm w-full mt-3 p-2 border border-(--accent) hover:border-(--accent-dark) rounded-sm text-(--accent) hover:text-(--accent-dark) font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              Adding...
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={onBorrowClick}
          disabled={!isAvailable}
          className="text-sm w-full mt-3 p-2 bg-(--accent) hover:bg-(--accent-dark) rounded-sm text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Borrow Item
        </button>
      </div>
    </div>
  );
}

export default CatalogCard;
