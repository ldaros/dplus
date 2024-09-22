import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ContentCarousel } from "../components/ContentCarousel";

export function BrowsePage() {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [contents, setContents] = useState<any[]>([]); // Store fetched content
  const [loading, setLoading] = useState(true); // Loading state for content
  const [loadingPlay, setLoadingPlay] = useState(false); // Loading state for playing content
  const [watchlistContents, setWatchlistContents] = useState<any[]>([]); // Store fetched watchlist contents
  const navigate = useNavigate();

  const handleItemSelect = (index) => {
    setIsChanging(true);
    setTimeout(() => {
      setActiveCarouselIndex(index);
      setIsChanging(false);
    }, 300);
  };

  const fetchData = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      const response = await fetch("/api/contents", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setContents(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const fetchWatchlistContents = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      const response = await fetch("/api/watchlist/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setWatchlistContents(data.contents);
    } catch (error) {
      console.error("Failed to fetch watchlist contents:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchWatchlistContents();
  }, []);

  const handleWatchlist = async (contentId: string, add: boolean) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      const response = await fetch(
        add ? "/api/watchlist/add" : `/api/watchlist/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentId: contentId }),
        }
      );

      setWatchlistContents(
        add
          ? [
              ...watchlistContents,
              { contentId: contentId, addedAt: new Date() },
            ]
          : watchlistContents.filter((item) => item.contentId !== contentId)
      );
    } catch (error) {
      console.error("Failed to add/remove content from watchlist:", error);
    }
  };

  const getYear = (date: string) => {
    const dateObject = new Date(date);
    return dateObject.getFullYear();
  };

  const getFormatedDuration = (duration: number) => {
    const hours = Math.floor(duration / 60 / 60);
    const minutes = Math.floor(duration / 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        No content available
      </div>
    );
  }

  return (
    <Layout backdropUrl={contents[activeCarouselIndex]?.backdropUrl}>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-transparent opacity-75" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCarouselIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-3xl"
        >
          <h1 className="text-8xl font-bold mb-6">
            {contents[activeCarouselIndex].title}
          </h1>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-md font-semibold">
              {getYear(contents[activeCarouselIndex].releaseDate)}
            </span>
            <span className="text-md font-semibold">
              {getFormatedDuration(contents[activeCarouselIndex].duration)}
            </span>
            {contents[activeCarouselIndex].genre.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-2xl mb-8 max-w-2xl">
            {contents[activeCarouselIndex].description}
          </p>
          <div className="flex space-x-6">
            <Button
              className="bg-white text-black hover:bg-gray-200 px-16 py-6 text-2xl"
              onClick={() => {
                navigate(`/watch/${contents[activeCarouselIndex]._id}`);
              }}
            >
              {loadingPlay ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                "▶ Play"
              )}
            </Button>
            {watchlistContents.some(
              (item) => item.contentId === contents[activeCarouselIndex]._id
            ) ? (
              <Button
                variant="outline"
                className="px-16 py-6 text-2xl"
                onClick={() =>
                  handleWatchlist(contents[activeCarouselIndex]._id, false)
                }
              >
                Remove from Watchlist
              </Button>
            ) : (
              <Button
                variant="outline"
                className="px-16 py-6 text-2xl"
                onClick={() =>
                  handleWatchlist(contents[activeCarouselIndex]._id, true)
                }
              >
                <Plus className="h-6 w-6" />
                Add to Watchlist
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">Trending Now</h2>
          <Button variant="ghost" size="lg" className="text-lg">
            See All <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
        <ContentCarousel
          items={contents}
          activeIndex={activeCarouselIndex}
          setActiveIndex={setActiveCarouselIndex}
          onItemSelect={handleItemSelect}
        />
      </div>
    </Layout>
  );
}
