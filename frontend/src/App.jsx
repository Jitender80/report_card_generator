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
import ItemAnalysis from "./pages/ItemAnalysis";

const ProtectedLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};




const App = () => {
  return (
    <Router
    basename="/"
    >
      <Layout>
        <Routes
        initialRoute="/"
        >
          <Route path="" element={<Home />} />
          <Route path="itemanalysis" element={<ItemAnalysis />} />
          <Route path="studentTable" element={<StudentTable />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
