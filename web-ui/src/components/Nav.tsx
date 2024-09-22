import { Link, useLocation } from "react-router-dom";
import { Home, Search, Film, Tv, Plus, User } from "lucide-react";
import { Button } from "./ui/button";

export function Nav() {
  const location = useLocation(); // Get the current location

  const activeNavItem = location.pathname.slice(1) || "browse"; // Set the active item based on the current path

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col items-center justify-center space-y-12 w-32 z-20">
      <NavItem
        icon={<Home className="h-8 w-8" />}
        isActive={activeNavItem === "browse"}
        to="/browse"
      />
      <NavItem
        icon={<Search className="h-8 w-8" />}
        isActive={activeNavItem === "search"}
        to="/search"
      />
      <NavItem
        icon={<Film className="h-8 w-8" />}
        isActive={activeNavItem === "movies"}
        to="/movies"
      />
      <NavItem
        icon={<Tv className="h-8 w-8" />}
        isActive={activeNavItem === "tv"}
        to="/tv"
      />
      <NavItem
        icon={<Plus className="h-8 w-8" />}
        isActive={activeNavItem === "watchlist"}
        to="/watchlist"
      />
      <NavItem
        icon={<User className="h-8 w-8" />}
        isActive={activeNavItem === "profile"}
        to="/profile"
      />
    </nav>
  );
}

const NavItem = ({ icon, isActive, to }) => (
  <div className="relative">
    <Link to={to}>
      <Button variant="ghost" size="icon" className="w-16 h-16">
        {icon}
      </Button>
    </Link>
    {isActive && (
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
    )}
  </div>
);