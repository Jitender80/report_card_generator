import React, { useState,useEffect} from "react";
import { Button } from "../ui/button";
import axios from "axios";
import BASE_URL from "../lib/db"
import Class from "../components/Class";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {

  return(
    <div className="flex flex-col justify-center items-center h-screen">
    <div className="bg-blue-500 text-white p-6 border border-black rounded-md">
      <ul className="list-disc pl-5">
        <li>Item Analysis (KR20)</li>
        <li>Learning Outcome</li>
        <li>Measurement</li>
        <li>Statistical Analysis</li>
      </ul>
    
    </div>
  </div>
  )
}
export default Home;