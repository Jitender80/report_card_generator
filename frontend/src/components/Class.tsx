import React, { useState } from "react";
import axios from "axios";
type Props = {
  onClassIdChange: (id: string) => void;
};
import { BASE_URL } from "../app";
const Class = ({ onClassIdChange }: any) => {
  const [classData, setClassData] = useState({
    name: "",
    section: "",
    tutor: "",
    year: "",
    session: "",
    student: "",
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
    const response = await axios.post(`${BASE_URL}/createClass`, classData);
    console.log(response.data);
    onClassIdChange(response.data._id);
  };
  return (
    <div className="flex justify-center items-center  ">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col  p-4 border rounded shadow-lg w-full"
      >
        <label className="flex flex-col">
          Name:
          <input
            type="text"
            name="name"
            value={classData.name}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Section:
          <input
            type="text"
            name="section"
            value={classData.section}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Tutor:
          <input
            type="text"
            name="tutor"
            value={classData.tutor}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Year:
          <input
            type="text"
            name="year"
            value={classData.year}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        {/* <label className="flex flex-col">
          Year:
          <input
            type="text"
            name="year"
            value={classData.year}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label> */}
        <label className="flex flex-col">
          Session:
          <input
            type="text"
            name="session"
            value={classData.session}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
        <label className="flex flex-col">
          Students:
          <input
            type="text"
            name="student"
            value={classData.student}
            onChange={handleChange}
            className=" p-2 border rounded"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          submit
        </button>
      </form>
    </div>
  );
};

export default Class;
