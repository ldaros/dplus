import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ContentCarousel } from "../components/ContentCarousel";
import Cookies from "js-cookie";

export function Watchlist() {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [contents, setContents] = useState<any[]>([]); // Store fetched content
  const [loading, setLoading] = useState(true); // Loading state for content
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        navigate(`/watch/${watchlistContents[activeCarouselIndex].contentId}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCarouselIndex]);

  const getFilteredContents = () => {
    return watchlistContents.map((item) => {
      return contents.find((content) => content._id === item.contentId);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-black text-white p-8">
        <div className="mb-8">
          <div className="text-4xl h-16">
            {watchlistContents.length} item(s) in your watchlist
          </div>
        </div>

        <div className="relative z-10">
          <ContentCarousel
            items={getFilteredContents()}
            activeIndex={activeCarouselIndex}
            setActiveIndex={setActiveCarouselIndex}
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>
    </Layout>
  );
}
