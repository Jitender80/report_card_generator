import React, { useState } from "react";
import axios from "axios";
type Props = {
  onClassIdChange: (id: string) => void;
};
import BASE_URL from "../lib/db"

const Class = ({ onClassIdChange }: any) => {
  const [classData, setClassData] = useState({
    level: 0,
    className: "",
    nameOfCourse: "",
    courseCode: "",
    creditHours: "",
    semester: "",
    academicYear:0 ,
    coordinatorGender: "",
    courseCoordinator: "",
    totalNoOfQuestion: 0,
    StudentsAttended: 0,
    studentsWithdrawn: 0,
    studentAbsent: 0,
    studentPassed:0,
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
    if(response.status === 201){
      console.log(response.data._id);
      alert("Class created successfully");
      onClassIdChange(response.data._id);
    }
    // for testing--
    // onClassIdChange("111");
    
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
    <div className="flex justify-center items-center mb-12 border rounded-md overflow-hidden border-black ">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-2 p-4 border rounded shadow-lg w-full overflow-y-true
        bg-yellow-100
        "
      >
        <label className="flex flex-col" htmlFor="level">
          Level:
          <input
            type="Number"
            name="level"
            value={classData.level}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col" htmlFor="className">
     ClassName
          <input
            type="text"
            name="className"
            value={classData.className}
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
            name="semester"
            value={classData.semester}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Academic Year:
          <select
          name="academicYear"
          value={classData.academicYear}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Academic Year</option>
          {generateYearOptions()}
        </select>
        </label>
        <label className="flex flex-col gap-5 justify-between">
          coordinatorGender:
          <div className="
          flex flex-row gap-5">
          <label>
          <input
            type="radio"
            name="coordinatorGender"
            value="male"
            checked={classData.coordinatorGender === "male"}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          Male
          </label>
          <label>
          <input
            type="radio"
            name="coordinatorGender"
            value="female"
            checked={classData.coordinatorGender === "female"}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          Female
          </label>
            </div>
        </label>
        <label className="flex flex-col">
          Course coordinator:
          <input
            type="text"
            name="courseCoordinator"
            value={classData.courseCoordinator}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          totalNoOfQuestion:
          <input
            type="number"
            name="totalNoOfQuestion"
            value={classData.totalNoOfQuestion}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          totalNoOfStudentsAttendedExam:
          <input
            type="number"
            name="StudentsAttended"
            value={classData.StudentsAttended}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          studentsWithdrawn:
          <input
            type="number"
            name="studentsWithdrawn"
            value={classData.studentsWithdrawn}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          studentAbsent,
          <input
            type="number"
            name="studentAbsent"
            value={classData.studentAbsent}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          studentPassed,
          <input
            type="number"
            name="studentPassed"
            value={classData.studentPassed}
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
