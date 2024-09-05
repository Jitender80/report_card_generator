import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../lib/db";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentClassId } from "../../redux/slice/classSlice";

type Props = {
  onClassIdChange: (id: string) => void;
};

const  Class = ({ onClassIdChange }: Props) => {
  const dispatch = useDispatch();
  const currentClassId = useSelector((state) => state.class.currentClassId);

  const [classData, setClassData] = useState({
    level: 0,
    nameOfCourse: "",
    courseCode: "",
    creditHours: "",
    courseCoordinator: "",
    semester: "",
    academicYear: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClassData({ ...classData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { level, nameOfCourse, courseCode, creditHours, semester , academicYear} = classData;
    if (!level || !nameOfCourse || !courseCode || !creditHours || !semester || academicYear ===0 ) {
      toast.error("Please fill all fields before submitting!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }
    toast.loading("Creating class...");

    const userId = localStorage.getItem("user");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/createClass/${userId}`,
        classData
      );

      dispatch(setCurrentClassId(response.data.data));

      if (response.status === 201) {
        toast.dismiss();
        onClassIdChange(response.data._id);
        toast.success("Class created successfully");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class. Please try again later.");
    } finally {
      toast.dismiss();
    }
  };

  const generateYearOptions = () => {
    const startYear = 2015;
    const numberOfYears = 20;
    const options = [];

    for (let i = 0; i < numberOfYears; i++) {
      const year1 = startYear + i;
      const year2 = year1 + 1;
      options.push(
        <option key={year1} value={`${year1}-${year2.toString().slice(-2)}`}>
          {year1}-{year2.toString().slice(-2)}
        </option>
      );
    }

    return options;
  };

  return (
    <div className="flex justify-center items-center  mb-12 border-2  border-black  m-2  mx-5 
    rounded-md overflow-hidden  flex-1 w-full ">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-8 p-4 justify-center items-center border rounded shadow-lg w-full bg-yellow-200"
      >
        <label className="flex flex-col" htmlFor="level">
          Level:
          <input
            type="Number"
            name="level"
            value={classData.level}
            onChange={handleChange}
            className="p-2 border  border-black  m-2  mx-5 rounded-md "
          />
        </label>

        <label className="flex flex-col">
          Name of Course:
          <input
            type="text"
            name="nameOfCourse"
            value={classData.nameOfCourse}
            onChange={handleChange}
            className="p-4 border  border-black  m-2  mx-5 rounded-md"
          />
        </label>

        <label className="flex flex-col">
          Course Code:
          <input
            type="text"
            name="courseCode"
            value={classData.courseCode}
            onChange={handleChange}
            className="p-4 border  border-black  m-2  mx-5 rounded-md"
          />
        </label>

        <label className="flex flex-col">
          Credit Hours:
          <input
            type="text"
            name="creditHours"
            value={classData.creditHours}
            onChange={handleChange}
            className="p-4 border  border-black  m-2  mx-5 rounded-md"
          />
        </label>

        <label className="flex flex-col">
          Semester:
          <input
type="text"
            name="semester"
            value={classData.semester}
            onChange={handleChange}
            className="p-4 border  border-black  m-2  mx-5 rounded-md"
          />
        </label>

        <label className="flex flex-col">
          Academic Year:
          <select
          type="number"
            name="academicYear"
            value={classData.academicYear}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Select Academic Year</option>
            {generateYearOptions()}
          </select>
        </label>

        <label className="flex flex-col">
          Course coordinator:
          <input
            type="text"
            name="courseCoordinator"
            value={classData.courseCoordinator}
            onChange={handleChange}
            className="p-4 border  border-black  m-2  mx-5 rounded-md"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 col-span-2"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Class;
