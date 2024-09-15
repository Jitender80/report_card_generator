import React, { useState,useEffect} from "react";
import { Button } from "../ui/button";
import axios from "axios";
import BASE_URL from "../lib/db"
import Class from "../components/Class";
import { useNavigate, useNavigation } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate(); 

  return(
    <div className="flex flex-col justify-center items-center h-screen">
    <div >
      <ul className="list-disc pl-5 flex gap-5 jus">
        <li className="bg-blue-500 text-white p-6  text-2xl border border-black rounded-md"  
        onClick={()=> navigate("/itemAnalysis")}
        >Item Analysis (KR20)</li>
        <li className="bg-blue-500 text-white p-6  text-2xl border border-black rounded-md">Learning Outcome  Menasurement</li>

        <li 
        onClick={()=> navigate("/finalReport")}
        className="bg-blue-500 text-white p-6  text-2xl border border-black rounded-md">Statistical Analysis</li>
      </ul>
    
    </div>
  </div>
  )
}
export default Home;