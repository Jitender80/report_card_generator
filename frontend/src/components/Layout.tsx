import React from "react";
import Navbar from "./Navbar";


const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
    <Navbar />
    <main className="flex-grow w-screen h-full  mx-auto p-4 overflow-y-scroll">
      {children}
    </main>

    
  </div>
);

};

export default Layout;