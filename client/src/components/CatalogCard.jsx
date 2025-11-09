import React from "react";

function CatalogCard({ name, quantity, tags, image, onBorrowClick }) {
  return (
    <div className="w-full rounded-md shadow-sm p-3 bg-white border border-black/10 hover:shadow-md transition-all">
      <img
        src={image}
        alt={name}
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="font-medium text-md my-3">{name}</h3>
      <span>
        <h6 className="text-sm text-gray-500">Available</h6>
        <p className="text-sm font-medium">{quantity}</p>
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
        <button className="text-sm w-full mt-3 p-2 border border-(--accent) hover:border-(--accent-dark) rounded-sm text-(--accent) hover:text-(--accent-dark) font-medium transition-colors">
          Add Item
        </button>
        <button
          onClick={onBorrowClick}
          className="text-sm w-full mt-3 p-2 bg-(--accent) hover:bg-(--accent-dark) rounded-sm text-white font-medium transition-colors"
        >
          Borrow Item
        </button>
      </div>
    </div>
  );
}

export default CatalogCard;
