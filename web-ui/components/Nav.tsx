import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Film, Tv, Plus, User } from "lucide-react";
import { Button } from "./ui/button";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname

  const handleItemSelect = (item: string) => {
    router.push(`/${item}`);
  };

  const activeNavItem = pathname.slice(1) || "browse"; // Set the active item based on the current path

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col items-center justify-center space-y-12 w-32 z-20">
      <NavItem
        icon={<Home className="h-8 w-8" />}
        isActive={activeNavItem === "browse"}
        onClick={() => handleItemSelect("browse")}
      />
      <NavItem
        icon={<Search className="h-8 w-8" />}
        isActive={activeNavItem === "search"}
        onClick={() => handleItemSelect("search")}
      />
      <NavItem
        icon={<Film className="h-8 w-8" />}
        isActive={activeNavItem === "movies"}
        onClick={() => handleItemSelect("movies")}
      />
      <NavItem
        icon={<Tv className="h-8 w-8" />}
        isActive={activeNavItem === "tv"}
        onClick={() => handleItemSelect("tv")}
      />
      <NavItem
        icon={<Plus className="h-8 w-8" />}
        isActive={activeNavItem === "watchlist"}
        onClick={() => handleItemSelect("watchlist")}
      />
      <NavItem
        icon={<User className="h-8 w-8" />}
        isActive={activeNavItem === "profile"}
        onClick={() => handleItemSelect("profile")}
      />
    </nav>
  );
}

const NavItem = ({ icon, isActive, onClick }) => (
  <div className="relative">
    <Button variant="ghost" size="icon" className="w-16 h-16" onClick={onClick}>
      {icon}
    </Button>
    {isActive && (
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
    )}
  </div>
);
