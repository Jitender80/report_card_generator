import React, { useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { BASE_URL } from "../App";
import Class from "../components/Class";
import StudentTable from "./Dashboard";
import { Router, useNavigate } from "react-router-dom";
const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [classFormSubmited, setClassFormSubmitted] = useState<boolean>(false);

  // const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  const handleClassIdChange = (id: string) => {
    setClassId(id);
  };


  const handleUpload = () => {
    if (selectedFile) {
      // Handle the file upload logic here
      console.log("Uploading file:", selectedFile);

      const res = axios.post(`${BASE_URL}/upload`, selectedFile);


      console.log("🚀 ~ handleUpload ~ res:", res);
      // navigate("/studentTable")
    } else {
      console.log("No file selected");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen overflow-auto ">
        <div className="mb-1">
          <Class onClassIdChange={handleClassIdChange} />
        </div>

        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 12l-4-4m0 0l-4 4m4-4v12"
            ></path>
          </svg>
          <span className="text-xl font-semibold">
            Upload the report card PDF
          </span>
        </div>
        <input
          type="file"
          className="mt-4 p-2 border border-gray-300 rounded-lg"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          color="primary"
          onClick={handleUpload}
          className="mt-4"
        >
          Upload
        </Button>
      </div>

   
    </>
  );
};

export default Home;
