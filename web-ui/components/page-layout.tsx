"use client";
import { useEffect, useState } from "react";
import { Nav } from "./Nav";

interface PageLayoutProps {
  children: React.ReactNode;
  backdropUrl?: string;
}

export function PageLayout({ children, backdropUrl }: PageLayoutProps) {
  const [loaded, setLoaded] = useState(false);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    if (!backdropUrl) {
      setLoaded(true);
      return;
    }

    const img = new Image();
    img.src = backdropUrl;
    img.onload = handleImageLoad;
  }, [backdropUrl]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center">
      <Nav />

      <main
        className={`flex-grow pl-32 pr-16 pt-32 pb-16 flex flex-col justify-between min-h-screen relative transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {children}
      </main>

      <div className="fixed top-6 right-6 z-20">
        <h1 className="text-5xl font-bold text-blue-500">DIDNEY+</h1>
      </div>
    </div>
  );
}