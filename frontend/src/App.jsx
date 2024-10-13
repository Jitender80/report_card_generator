import React, { useEffect, useState } from "react";
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
import InstructorsList from "./pages/InstructorsList";
import FinalReport from "./pages/FinalReport";
const ProtectedLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

const App = () => {
  const [active ,setActive] = useState(false);


  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        toast.loading("Waking up server...",{
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          progressStyle: { backgroundColor: "#00ff00" },
        });
        const response = await axios.get(`http://localhost:3000/wake-up`);
        if (response.status === 200) {
          setActive(true);
          toast.dismiss();
          toast.success(response.data.message);
        }
      } catch (error) {
        setActive(false)
        toast.dismiss();
        toast.error(`Error waking up server| Refresh to try again | ${error.message}`);
      }
    };

    wakeUpServer();
  }, []);
  return (
    <>
      <Router basename="/">
        <Layout>

          <Routes initialRoute="/" >
            <Route path="" element={<Home />} />
            <Route path="login" element={<Login/>} /> 
            <Route path="signup" element={<Signup/>} /> 
              {active &&(

                <Route  
                path="/*"
                element={<AuthRoute element={ProtectedLayout} />}
                >
              <Route path="itemanalysis" element={<ItemAnalysis />} />
              <Route path="studentTable" element={<StudentTable />} />
              <Route path="check-report" element={<CheckReports />} />
              <Route path="instructors" element={<InstructorsList />} />
              <Route path="finalReport" element={<FinalReport/>} />
            </Route>
            )}  
          </Routes>
        </Layout>
      </Router>
    </>
  );
};

export default App;
