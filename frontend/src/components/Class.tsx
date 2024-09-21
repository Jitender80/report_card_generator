import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../lib/db";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentClassId } from "../../redux/slice/classSlice";

type Props = {
  onClassIdChange: (id: string) => void;
};
const courseData = [
  { courseCode: '111 VDS-2', nameOfCourse: 'Behavioral Science & Medical Ethics', creditHours: '2 (2+0)', level: 3, semester: 'First Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '121 RDS-1', nameOfCourse: 'Dental Biomaterials I', creditHours: '1 (1+0)', level: 3, semester: 'First Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '123 RDS-2', nameOfCourse: 'Dental Anatomy I', creditHours: '2 (1+1)', level: 3, semester: 'First Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '161 SDS-3', nameOfCourse: 'General Anatomy & Embryology', creditHours: '3 (2+1)', level: 3, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '163 SDS-2', nameOfCourse: 'Basic Histology', creditHours: '2 (1+1)', level: 3, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '164 SDS-3', nameOfCourse: 'General Physiology I', creditHours: '3 (2+1)', level: 3, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '166 SDS-2', nameOfCourse: 'General & Organic Chemistry', creditHours: '2 (2+0)', level: 3, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '122 RDS-3', nameOfCourse: 'Dental Biomaterials II', creditHours: '3 (2+1)', level: 4, semester: 'Second Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '124 RDS-2', nameOfCourse: 'Dental Anatomy II', creditHours: '2 (1+1)', level: 4, semester: 'Second Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '162 SDS-3', nameOfCourse: 'Head & Neck Anatomy', creditHours: '3 (2+1)', level: 4, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '165 SDS-3', nameOfCourse: 'General Physiology II', creditHours: '3 (2+1)', level: 4, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '167 SDS-3', nameOfCourse: 'Biochemistry', creditHours: '3 (2+1)', level: 4, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '168 SDS-2', nameOfCourse: 'Medical Physics', creditHours: '2 (1+1)', level: 4, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '221 RDS-3', nameOfCourse: 'Operative Dentistry (Preclinical I)', creditHours: '3 (1+2)', level: 5, semester: 'First Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '231 PDS-4', nameOfCourse: 'Removable Prosthodontics (Preclinical I)', creditHours: '4 (2+2)', level: 5, semester: 'First Semester', department: 'Department of Prosthodontics' },
  { courseCode: '251 MDS-3', nameOfCourse: 'Oral Biology I', creditHours: '3 (2+1)', level: 5, semester: 'First Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '261 SDS-2', nameOfCourse: 'Microbiology & Immunology', creditHours: '2 (1+1)', level: 5, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '263 SDS-3', nameOfCourse: 'General Pathology', creditHours: '3 (2+1)', level: 5, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '264 SDS-3', nameOfCourse: 'Pharmacology', creditHours: '3 (2+1)', level: 5, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '211 VDS-1', nameOfCourse: 'Preventive Dentistry', creditHours: '1 (1+0)', level: 6, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '222 RDS-3', nameOfCourse: 'Operative Dentistry (Preclinical II)', creditHours: '3 (1+2)', level: 6, semester: 'Second Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '232 PDS-2', nameOfCourse: 'Removable Prosthodontics (Preclinical II)', creditHours: '2 (1+1)', level: 6, semester: 'Second Semester', department: 'Department of Prosthodontics' },
  { courseCode: '252 MDS-3', nameOfCourse: 'Oral Biology II', creditHours: '3 (2+1)', level: 6, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '241 OMS-2', nameOfCourse: 'Local Anesthesia in Dentistry', creditHours: '2 (2+0)', level: 6, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '253 MDS-2', nameOfCourse: 'Oral Radiology (Preclinical)', creditHours: '2 (1+1)', level: 6, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '262 SDS-2', nameOfCourse: 'Oral Microbiology', creditHours: '2 (2+0)', level: 6, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '321 RDS-3', nameOfCourse: 'Operative Dentistry (Clinical I)', creditHours: '3 (2+1)', level: 7, semester: 'First Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '331 PDS-2', nameOfCourse: 'Fixed Prosthodontics (Preclinical I)', creditHours: '2 (1+1)', level: 7, semester: 'First Semester', department: 'Department of Prosthodontics' },
  { courseCode: '332 PDS-3', nameOfCourse: 'Removable Prosthodontics (Clinical I)', creditHours: '3 (2+1)', level: 7, semester: 'First Semester', department: 'Department of Prosthodontics' },
  { courseCode: '341 OMS-2', nameOfCourse: 'Oral & Maxillofacial Surgery I', creditHours: '2 (1+1)', level: 7, semester: 'First Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '342 OMS-3', nameOfCourse: 'Oral Pathology I', creditHours: '3 (2+1)', level: 7, semester: 'First Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '353 MDS-2', nameOfCourse: 'Oral Radiology (Clinical)', creditHours: '2 (1+1)', level: 7, semester: 'First Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '361 SDS-3', nameOfCourse: 'General Surgery, Ophthalmology, ENT, GA', creditHours: '3 (3+0)', level: 7, semester: 'First Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '311 VDS', nameOfCourse: 'Periodontal Prophylaxis', creditHours: '2 (1+1)', level: 8, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '322 RDS-2', nameOfCourse: 'Endodontics (Preclinical)', creditHours: '2 (1+1)', level: 8, semester: 'Second Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '333 PDS-3', nameOfCourse: 'Removable Prosthodontics (Clinical II)', creditHours: '3 (2+1)', level: 8, semester: 'Second Semester', department: 'Department of Prosthodontics' },
  { courseCode: '334 PDS-2', nameOfCourse: 'Fixed Prosthodontics (Preclinical II)', creditHours: '2 (1+1)', level: 8, semester: 'Second Semester', department: 'Department of Prosthodontics' },
  { courseCode: '352 MDS-2', nameOfCourse: 'Oral Diagnosis I', creditHours: '2 (1+1)', level: 8, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '345 OMS-2', nameOfCourse: 'Oral & Maxillofacial Surgery II', creditHours: '2 (1+1)', level: 8, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '343 OMS-3', nameOfCourse: 'Oral Pathology II', creditHours: '3 (2+1)', level: 8, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '362 SDS-2', nameOfCourse: 'General Medicine & Skin Diseases', creditHours: '2 (2+0)', level: 8, semester: 'Second Semester', department: 'Department of Basic Dental Sciences' },
  { courseCode: '411 VDS-2', nameOfCourse: 'Pediatric Dentistry (Preclinical)', creditHours: '2 (1+1)', level: 9, semester: 'First semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '412 VDS-2', nameOfCourse: 'Periodontology I', creditHours: '2 (1+1)', level: 9, semester: 'First semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '421 RDS-2', nameOfCourse: 'Operative Dentistry (Clinical II)', creditHours: '2 (1+1)', level: 9, semester: 'First semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '431 PDS-3', nameOfCourse: 'Removable Prosthodontics (Clinical III)', creditHours: '3 (2+1)', level: 9, semester: 'First semester', department: 'Department of Prosthodontics' },
  { courseCode: '432 PDS-3', nameOfCourse: 'Fixed Prosthodontics (Clinical I)', creditHours: '3 (2+1)', level: 9, semester: 'First semester', department: 'Department of Prosthodontics' },
  { courseCode: '453 MDS-2', nameOfCourse: 'Oral Diagnosis II', creditHours: '2 (1+1)', level: 9, semester: 'First semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '422 OMS-3', nameOfCourse: 'Oral & Maxillofacial Surgery III', creditHours: '3 (2+1)', level: 9, semester: 'First semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '413 VDS-2', nameOfCourse: 'Periodontology II', creditHours: '2 (1+1)', level: 10, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '414 VDS-2', nameOfCourse: 'Pediatric Dentistry (Clinical)', creditHours: '2 (1+1)', level: 10, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '415 VDS-3', nameOfCourse: 'Orthodontics I', creditHours: '3 (2+1)', level: 10, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '422 RDS-3', nameOfCourse: 'Endodontics (Clinical)', creditHours: '3 (2+1)', level: 10, semester: 'Second Semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '433 PDS-3', nameOfCourse: 'Fixed Prosthodontics (Clinical II)', creditHours: '3 (2+1)', level: 10, semester: 'Second Semester', department: 'Department of Prosthodontics' },
  { courseCode: '443 OMS-3', nameOfCourse: 'Oral & Maxillofacial Surgery IV', creditHours: '3 (2+1)', level: 10, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '454 MDS-2', nameOfCourse: 'Oral Medicine', creditHours: '2 (1+1)', level: 10, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
  { courseCode: '511 VDS-2', nameOfCourse: 'Dental Public Health & Community Dentistry I', creditHours: '2 (1+1)', level: 11, semester: 'First semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '513 VDS-3', nameOfCourse: 'Orthodontics II', creditHours: '3 (2+1)', level: 11, semester: 'First semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '521 RDS-5', nameOfCourse: 'Comprehensive Care Clinic I', creditHours: '5 (1+4)', level: 11, semester: 'First semester', department: 'Department of Restorative Dentistry' },
  { courseCode: '532 PDS-2', nameOfCourse: 'Maxillofacial Prosthodontics', creditHours: '2 (1+1)', level: 11, semester: 'First semester', department: 'Department of Prosthodontics' },
  { courseCode: '512 VDS-2', nameOfCourse: 'Dental Public Health & Community Dentistry II', creditHours: '2 (1+1)', level: 12, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '514 VDS-3', nameOfCourse: 'Comprehensive Pediatric Dentistry Clinic', creditHours: '3 (1+2)', level: 12, semester: 'Second Semester', department: 'Department of Preventive Dentistry' },
  { courseCode: '533 PDS-5', nameOfCourse: 'Comprehensive Care Clinic II', creditHours: '5 (1+4)', level: 12, semester: 'Second Semester', department: 'Department of Prosthodontics' },
  { courseCode: '541 OMS-2', nameOfCourse: 'Principles of Care of Complicated Oral Surgical Cases', creditHours: '2 (1+1)', level: 12, semester: 'Second Semester', department: 'Department of Oral and Maxillofacial Surgery and Diagnostic Sciences' },
];

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
    department: "", 
    gender: "male"
  });

  const [filteredCourseCodes, setFilteredCourseCodes] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData({
      ...classData,
      [name]: value
    });

    if (name === 'courseCode') {
      // Filter course codes for autocomplete
      const filtered = courseData.filter(course => course.courseCode.toLowerCase().includes(value.toLowerCase()));
      setFilteredCourseCodes(filtered);

      // Fetch course data if a valid course code is selected
      const selectedCourse = courseData.find(course => course.courseCode === value);
      if (selectedCourse) {
        setClassData({
          ...classData,
          level: selectedCourse.level,
          nameOfCourse: selectedCourse.nameOfCourse,
          courseCode: selectedCourse.courseCode,
          creditHours: selectedCourse.creditHours,
          semester: selectedCourse.semester,
          department: selectedCourse.department
        });
      }
    }
  };
  const handleSelectCourseCode = (courseCode) => {
    const selectedCourse = courseData.find(course => course.courseCode === courseCode);
    if (selectedCourse) {
      setClassData({
        ...classData,
        level: selectedCourse.level,
        nameOfCourse: selectedCourse.nameOfCourse,
        courseCode: selectedCourse.courseCode,
        creditHours: selectedCourse.creditHours,
        semester: selectedCourse.semester,
        department: selectedCourse.department
      });
      setFilteredCourseCodes([]);
    }
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

      if(response.status === 401) {

        toast.error("This Course with this code already exists in the database", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
          hideProgressBar: true
        });
      
        // Delay the execution of the subsequent code by 2 seconds (2000 milliseconds)
        setTimeout(() => {
          // Perform the action you want to execute after the toast is shown
          // For example, you can redirect the user or reset a form
          // console.log("Toast has been shown for 2 seconds. Performing subsequent action...");
          // Add your subsequent action here
        }, 2000);

        return;
      }

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

    
    <div className="flex justify-center items-center mb-12 border-2 border-black m-2 mx-5 rounded-md overflow-hidden flex-1 w-full h-screen">
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 py-20 justify-center h-full items-center border rounded shadow-lg w-full bg-yellow-200"
    >
        <label className="flex flex-col" htmlFor="level">
          Level:
          <input
            type="Number"
            name="level"
            value={classData.level}
            onChange={handleChange}
            className="p-2 border  border-black  m-2  mx-5 rounded-md"
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

        <label className="flex flex-col" htmlFor="courseCode">
          Course Code:
          <input
            type="text"
            name="courseCode"
            value={classData.courseCode}
            onChange={handleChange}
            className="p-4 border border-black m-2 mx-5 rounded-md"
          />
          {filteredCourseCodes.length > 0 && (
            <ul className="border border-black rounded-md bg-gray-100 mx-5 relative z-10 max-h-40 top-0 left-0 overflow-y-auto">
              {filteredCourseCodes.map((course, index) => (
                <li
                  key={index}
                  className="p-2 cursor-pointer hover:bg-gray-400"
                  onClick={() => handleSelectCourseCode(course.courseCode)}
                >
                  {course.courseCode}
                </li>
              ))}
            </ul>
          )}
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
       
            <select id="semester"      name="semester"   value={classData.semester}     onChange={handleChange}  className="p-4 border  border-black  m-2  mx-5 rounded-md" >
        <option value="">--Select Semester--</option>
        <option value="First Semester">First semester</option>
        <option value="Second Semester">Second semester</option>
        <option value="Third Semester">Third semester</option>
        <option value="Fourth Semester">Fourth semester</option>
        <option value="Fifth Semester">Fifth semester</option>
        <option value="Sixth Semester">Sixth semester</option>
        <option value="Seventh Semester">Seventh semester</option>
        <option value="Eighth Semester">Eighth semester</option>
      </select>
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
        <div className="flex flex-col">
          Gender:
          <div className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={classData.gender === 'male'}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="male" className="mr-4">Male</label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={classData.gender === 'female'}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="female">Female</label>
          </div>
        </div>

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
