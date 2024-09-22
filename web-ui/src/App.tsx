import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { BrowsePage } from "./pages/Browse";
import { PlayerPage } from "./pages/Player";
import { Watchlist } from "./pages/Watchlist";
import { Loader2 } from "lucide-react";
import { Search } from "./pages/Search";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/watch/:id" element={<PlayerPage />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  );
};

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cookies = Cookies.get("token");

    if (!cookies) {
      navigate("/login");
    } else {
      navigate("/browse");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen text-white">
      <Loader2 className="animate-spin h-10 w-10" />
    </div>
  );
};

export default App;
