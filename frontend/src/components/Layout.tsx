import React from "react";
import Navbar from "./Navbar";


const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
    <Navbar />
    <main className="flex-grow container mx-auto p-4 overflow-hidden">
      {children}
    </main>

    
  </div>
);

};

export default Layout;