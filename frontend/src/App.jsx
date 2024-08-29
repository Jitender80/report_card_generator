import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

import "./App.css";
import Login from "./pages/Login";
import AuthRoute from "./components/AuthRoute";
import StudentTable from "./pages/Dashboard";
// import Class from "./components/Class";
const ProtectedLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

// export const BASE_URL =
//   "https://fictional-space-sniffle-94pgrxqq9qwfxg54-3000.app.github.dev";
// export const BASE_URL =

//   "https://fictional-space-sniffle-94pgrxqq9qwfxg54-3000.app.github.dev";
// export const BASE_URL = "http://127.0.0.1:3000";
export const BASE_URL = "";
const App = () => {
  return (
<Router basename="/">
  <Layout>
    <Routes initialRoute="home">
      <Route path="/login" element={<Login />} />
      <Route path="home" element={<Home />} />
      <Route path="studentTable" element={<StudentTable />} />
    </Routes>
  </Layout>
</Router>
  );
};

export default App;
