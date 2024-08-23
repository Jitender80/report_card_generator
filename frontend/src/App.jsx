import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

import "./App.css";
import Login from "./pages/Login";
import AuthRoute from "./components/AuthRoute";

const ProtectedLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

// export const BASE_URL =
//   "https://fictional-space-sniffle-94pgrxqq9qwfxg54-3000.app.github.dev";
export const BASE_URL = "https://fictional-space-sniffle-94pgrxqq9qwfxg54-3000.app.github.dev";

const App = () => {
  return (
    <Router basename="/">
      <Layout>
        <Routes initialRoute="/login">
          <Route path="/login" element={<Login />} />
          <Route path="/protected/*" element={<AuthRoute element={ProtectedLayout} />}>
          <Route path="home" element={<Home />} />

          </Route>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
