import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import BASE_URL from "../lib/db";
import Class from "../components/Class";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ItemAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [classFormSubmited, setClassFormSubmitted] = useState<boolean>(false);
  const [isClassSubmitted, setClassSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();
  const [collegeName, setCollegeName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [savedCollegeDetails, setSavedCollegeDetails] = useState(false);

  const handleCollegeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCollegeName(event.target.value);
  };

  const handleUniversityNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUniversityName(event.target.value);
  };

  const handleCollegeSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    toast.loading("Submitting college details");
    const res = await axios.post(`${BASE_URL}/initializeClass`, {
      collegeName,
      universityName,
    });

    if (res.status === 200) {
      toast.dismiss();
      toast.success("College details submitted successfully");
    } else {
      toast.dismiss();
      toast.error("Failed to submit college details");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  const handleClassIdChange = (id: string) => {
    setClassId(id);
    // console.log("class id", classId);
    // if (classId) {
    setClassSubmitted(true);
    // } else {
    //   setClassSubmitted(false);
    //   console.log("class id not set");
    // }
  };
  useEffect(() => {
    console.log("class id", classId);
  }, [classId]);
  const handleCollegeDetailsSave = () => {
    setSavedCollegeDetails(true);
  };
  const handleUpload = async () => {
    toast.loading("Uploading file");
    if (selectedFile) {
      // Handle the file upload logic here
      console.log("Uploading file____>:", selectedFile);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post(`${BASE_URL}/upload`, formData);

      if (res.status === 200) {
        toast.dismiss();
        navigate("/studentTable");
        toast.success("File uploaded successfully");
      }

      // console.log("🚀 ~ handleUpload ~ res:", res);
      // navigate("/studentTable")
    } else {
      toast.dismiss();
      toast.error("No file selected");
      console.log("No file selected");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-0 ">
      {!isClassSubmitted && !savedCollegeDetails && (
        <form
          onSubmit={handleCollegeSubmit}
          className="border  border-gray-600 p-2 rounded-lg w-11/12 flex flex-row gap-4
    justify-around
    items-center
  
          "
        >
          <div className="flex flex-row items-center gap-5 w-96">
            <label htmlFor="collegeName">College Name:</label>
            <input
              className="border border-gray-300 p-2 rounded-lg"
              type="text"
              id="collegeName"
              value={collegeName}
              onChange={handleCollegeNameChange}
            />
          </div>
          <div className="flex flex-row items-center gap-5">
            <label htmlFor="universityName">University Name:</label>
            <input
              className="border border-gray-300 p-2 rounded-lg"
              type="text"
              id="universityName"
              value={universityName}
              onChange={handleUniversityNameChange}
            />
          </div>
          <div className="flex flex-row items-center gap-5">
            <Button
              variant="outline"
              color="primary"
              onClick={handleCollegeDetailsSave}
              className="mt-[-1px]"
            >
              Save
            </Button>
          </div>
        </form>
      )}

      {!isClassSubmitted && savedCollegeDetails && (
        <div className="mb-5 mt-4 w-full max-w-xl ">
          <Class onClassIdChange={handleClassIdChange} />
        </div>
      )}
      {isClassSubmitted && (
        <div>
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
            id="file-upload"
            placeholder="Upload the report card PDF"
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
      )}
    </div>
  );
};

export default ItemAnalysis;
