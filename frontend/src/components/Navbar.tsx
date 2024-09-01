import React from "react";
import { Link } from "react-router-dom";
const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-700 px-4 py-2 flex flex-row justify-between items-center">
      <div className="container mx-auto">
        <h1 className="text-white text-2xl">Report Card</h1>
        <h2 className="text-white text-sm">Upload the report card PDF</h2>

      </div>
      <div className=" flex flex-row gap-10 justify-around text-white text-2xl">
        {/* <h2 >Materials</h2>
        <h2>Sessions</h2>
        <h2>Result</h2> */}
        <Link to="/">home</Link>
      </div>
    </nav>
  );
};

export default Navbar;