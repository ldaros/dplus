"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false); // Set loading to false

    if (response.ok) {
      const { token } = await response.json();
      Cookies.set("token", token); // Store the token in cookies
      router.push("/browse"); // Redirect to /browse
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-12 rounded-lg shadow-xl max-w-md w-full"
      >
        <h1 className="text-5xl font-bold mb-8 text-center text-blue-500">
          DIDNEY+
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              "Log In"
            )}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => alert("lol")}
          >
            Forgot password?
          </a>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-400">New to DIDNEY+?</p>
          <a
            href="#"
            className="text-white hover:text-blue-400 transition-colors font-semibold"
            onClick={() => router.push("/signup")}
          >
            Sign up now
          </a>
        </div>
      </motion.div>

      <div className="fixed bottom-6 left-6 z-20 text-sm text-gray-500">
        © 2023 DIDNEY+. All rights reserved.
      </div>
    </div>
  );
}
