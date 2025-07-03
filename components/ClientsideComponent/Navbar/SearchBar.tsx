'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { Product } from '@/types/product';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔄 Live API search on input
  useEffect(() => {
    const term = query.trim();
    if (term === '') {
      setFiltered([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://cosmaticadmin.twilightparadox.com/product/filter/?search=${encodeURIComponent(term)}`
        );
        const data = await res.json();
        console.log('🔍 API search results:', data.products); // Debug log
        setFiltered(data.products?.slice(0, 6) || []);
      } catch (err) {
        console.error(' Failed to fetch search suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300); // debounce for smoother UX

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelect = (slug: string) => {
    setQuery('');
    setFiltered([]);
    router.push(`/product/${slug}`);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-0.5 focus:ring-orange-500"
          />
          <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 " size={18} />
          {query && (
            <IoClose
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              size={18}
              onClick={() => setQuery('')}
            />
          )}
        </div>
      </form>

      {/* 🔽 Suggestion dropdown */}
      {filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#f3f4f6] border-1 border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {filtered.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product.slug)}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <Image
             src={
              product.images?.[0]?.image || 
              product.variants?.[0]?.images?.[0]?.url || 
              '/placeholder.png'
            }
                alt={product.name}
                width={25}
                height={25}
                className="rounded borde-1 "
              />
              <div className="flex flex-col">
                <p className="font-medium text-sm">{product.name}</p>
                {product.subcategory?.name && (
                  <p className="text-xs text-orange-500 italic">
                    In {product.subcategory.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optional: No results */}
      {query && !loading && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow px-4 py-2 text-sm text-gray-500">
          No matching products found.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
