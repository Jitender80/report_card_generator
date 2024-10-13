import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();

    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 px-4 py-2 flex flex-row justify-between items-center">
      <div className="container flex flex-row justify-start items-center gap-5">
        <Link to="/">
        <h1 className="text-white text-2xl">Report Card</h1>
        </Link>
        <h2 className="text-white text-sm">Upload the report card PDF</h2>
      </div>

      <div className="flex flex-row gap-10 justify-around text-white text-2xl mx-4 w-20 word-wrap">
      
      <Link className="text-sm font-semibold text-white  text-nowrap" to="/finalReport">Final Report</Link>
    </div>

      <div className="flex flex-row gap-10 justify-center mx-4 text-green-400 text-2xl">
        {role === 'admin' && (
          <Link className="text-sm font-semibold text-white" to="/instructors">Instructors</Link>
        )}
        <Link className="text-sm font-semibold text-white" to="/check-report">Reports</Link>
      </div>

      <div className="flex flex-row gap-10 justify-around text-white text-2xl mx-2">
      
        <Link className="text-sm font-semibold text-white" to="/">Home</Link>
      </div>

      <button className="text-sm font-semibold text-white mx-2" onClick={handleLogout}>
        Logout
      </button>
    </nav>

  );
};

export default Navbar;