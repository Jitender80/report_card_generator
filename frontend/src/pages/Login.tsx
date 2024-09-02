import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../lib/db";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true); // State to manage current screen
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(loginData);
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);

    console.log(response.data);
    localStorage.setItem("user", response.data);


    localStorage.setItem("authToken",response.data.token);
    localStorage.setItem("user", response.data.user._id);
    localStorage.setItem("usermail", response.data.user.email);
    localStorage.setItem("role", response.data.user.role);
    
    navigate("/itemanalysis");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isLogin ? (
        <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4">Login</h2>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={handleChange}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
            Login
          </button>
          <button
            type="button"
            className="mt-4 text-blue-500"
            onClick={()=> navigate('/signup')}
          >
            Don't have an account? Signup
          </button>
        </form>
      ) : (
        <Signup />
      )}
    </div>
  );
};

export default Login;