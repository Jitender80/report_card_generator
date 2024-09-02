import React from "react";
import { Link, useNavigate } from "react-router-dom";


const Navbar: React.FC = () => {
  const navigate = useNavigate();



  
    const handleLogout = () => {
      // Clear local storage
      localStorage.clear();
  
      // Redirect to login page
      navigate('/login');
    };

  return (
    <nav className="bg-blue-700 px-4 py-2 flex flex-row justify-between items-center gap-5">
      <div className="container mx-auto">
        <h1 className="text-white text-2xl">Report Card</h1>
        <h2 className="text-white text-sm">Upload the report card PDF</h2>

      </div>

      <div className=" flex flex-row gap-10 justify-around text-green-400 text-2xl">

        <Link to="/check-report">Reports</Link>
      </div>
      <div className=" flex flex-row gap-10 justify-around text-white text-2xl">
        {/* <h2 >Materials</h2>
        <h2>Sessions</h2>
        <h2>Result</h2> */}
        <Link to="/">home</Link>
      </div>

      <button onClick={handleLogout}>
      Logout
    </button>
    </nav>
  );
};

export default Navbar;