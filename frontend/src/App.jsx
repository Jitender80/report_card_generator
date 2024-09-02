import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

import "./App.css";

import StudentTable from "./pages/Dashboard";
import ItemAnalysis from "./pages/ItemAnalysis";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "./lib/db";
import axios from "axios";
import AuthRoute from "./components/AuthRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CheckReports from "./pages/CheckReports";
const ProtectedLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        toast.loading("Waking up server...");
        const response = await axios.get(`${BASE_URL}/wake-up`);
        if (response.status === 200) {
          toast.dismiss();
          toast.success(response.data.message);
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Error waking up server| Refresh to try again");
      }
    };

    wakeUpServer();
  }, []);
  return (
    <>
      <Router basename="/">
        <Layout>
          <Routes initialRoute="/">
            <Route path="" element={<Home />} />
            <Route path="login" element={<Login/>} /> 
            <Route path="signup" element={<Signup/>} /> 
            
            <Route
              path="/*"
              element={<AuthRoute element={ProtectedLayout} />}
            >
              <Route path="itemanalysis" element={<ItemAnalysis />} />
              <Route path="studentTable" element={<StudentTable />} />
              <Route path="check-report" element={<CheckReports />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </>
  );
};

export default App;
