"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, nome, region }),
    });

    setLoading(false); // Set loading to false

    if (response.ok) {
      const { token } = await response.json();
      Cookies.set("token", token); // Store the token in cookies

      navigate("/browse"); // Redirect to /browse
    } else {
      alert("Registration failed. Please check your credentials."); // Handle error appropriately
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
        <form onSubmit={handleSignup} className="space-y-6">
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
          <div>
            <Input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BR">Brasil</SelectItem>
                <SelectItem value="US">EUA</SelectItem>
                <SelectItem value="CA">Canadá</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </motion.div>

      <div className="fixed bottom-6 left-6 z-20 text-sm text-gray-500">
        © 2023 DIDNEY+. All rights reserved.
      </div>
    </div>
  );
}
