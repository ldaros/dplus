"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import debounce from "lodash/debounce";

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `/api/contents/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setSearchResults(data);
        setSelectedIndex(0); // Select the first item by default
      } catch (error) {
        console.error("Failed to search:", error);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearch(query), 500),
    [handleSearch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setSearchQuery((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setSearchQuery((prev) => prev + e.key);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          Math.min(prev + 1, searchResults.length - 1)
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          Math.min(prev + 4, searchResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => Math.max(prev - 4, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleVideoSelect(searchResults[selectedIndex]);
        }
      }
    },
    [searchResults, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (gridRef.current && selectedIndex >= 0) {
      const selectedElement = gridRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  const handleVideoSelect = (video: any) => {
    navigate(`/watch/${video._id}`);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-black text-white p-8">
        <div className="mb-8">
          <div className="text-4xl h-16">
            {searchQuery || (
              <span className="text-gray-500">Start typing to search...</span>
            )}
          </div>
        </div>

        {searchResults.length > 0 ? (
          <motion.div
            ref={gridRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-4 gap-4 overflow-y-auto p-4"
          >
            {searchResults.map((item, index) => (
              <motion.div
                key={index}
                className={`relative aspect-video cursor-pointer ${
                  index === selectedIndex ? "ring-4 ring-blue-500" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleVideoSelect(item)}
              >
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-2 left-2 right-2 text-white text-lg font-semibold text-center truncate">
                  <span>{item.title}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            {loading ? (
              <p className="text-2xl text-gray-400">Searching...</p>
            ) : searchQuery ? (
              <p className="text-2xl text-gray-400">
                No results found for "{searchQuery}"
              </p>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}
