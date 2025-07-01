"use client";

import { FiShoppingCart } from "react-icons/fi";

interface Props {
  onClick: () => void;
  size?: number;
  title?: string;
  className?: string;
}

const CartButton = ({
  onClick,
  size = 18,
  title = "Add to Cart",
  className = "",
}: Props) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transition ${className}`}
      title={title}
    >
      <FiShoppingCart size={size} />
    </button>
  );
};

export default CartButton;
