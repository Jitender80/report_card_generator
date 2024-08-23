import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../App";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
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

    localStorage.setItem("authToken", response.data.token);
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={loginData.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;
