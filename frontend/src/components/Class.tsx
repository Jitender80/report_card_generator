import React, { useState } from "react";
import axios from "axios";
type Props = {
  onClassIdChange: (id: string) => void;
};
// import { BASE_URL } from "../app.jsx";
const BASE_URL = "https://fictional-space-sniffle-94pgrxqq9qwfxg54-3000.app.github.dev";
const Class = ({ onClassIdChange }: any) => {
  const [classData, setClassData] = useState({
    level: "",
    nameOfCourse: "",
    courseCode: "",
    creditHours: "",
    semester: "",
    academicYear: "",
    coordinatorGender: "",
    courseCoordinator: "",
    totalNoOfQuestion: "",
    totalNoOfStudentsAttendedExam: "",
    studentsWithdrawn: "",
    studentAbsent: "",
  });
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClassData({ ...classData, [name]: value });
    // setting the class id in the parent component
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(classData);
    // onClassIdChange("loading");
    // TODO: make a post request to create a class
    const response = await axios.post(`${BASE_URL}/createClass`, classData);
    console.log(response.data);
    // onClassIdChange(response.data._id);
    // for testing--
    // onClassIdChange("111");
  };
  return (
    <div className="flex justify-center items-center  ">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 p-4 border rounded shadow-lg w-full"
      >
        <label className="flex flex-col" htmlFor="level">
          Level:
          <input
            type="text"
            name="level"
            value={classData.level}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Name of Course:
          <input
            type="text"
            name="nameOfCourse"
            value={classData.nameOfCourse}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Course Code:
          <input
            type="text"
            name="courseCode"
            value={classData.courseCode}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          creditHours:
          <input
            type="text"
            name="creditHours"
            value={classData.creditHours}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        {/* <label className="flex flex-col">
          Semester:
          <input
            type="text"
            name="semester"
            value={classData.semester}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label> */}
        <label className="flex flex-col">
          Semester:
          <input
            type="text"
            name="academicYear"
            value={classData.academicYear}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          coordinatorGender:
          <input
            type="text"
            name="coordinatorGender"
            value={classData.coordinatorGender}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          totalNoOfQuestion:
          <input
            type="text"
            name="totalNoOfQuestion"
            value={classData.totalNoOfQuestion}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          totalNoOfStudentsAttendedExam:
          <input
            type="text"
            name="totalNoOfStudentsAttendedExam"
            value={classData.totalNoOfStudentsAttendedExam}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          studentsWithdrawn:
          <input
            type="text"
            name="studentsWithdrawn"
            value={classData.studentsWithdrawn}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          studentAbsent,
          <input
            type="text"
            name="studentAbsent"
            value={classData.studentAbsent}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 col-span-2"
        >
          submit
        </button>
      </form>
    </div>
  );
};

export default Class;
