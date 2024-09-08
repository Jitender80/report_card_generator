import axios from 'axios'
import React, { useEffect, useState } from 'react'
import BASE_URL from '../lib/db'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useDispatch, useSelector } from "react-redux";
import { setCurrentClassId } from '../../redux/slice/classSlice';

import { toast } from 'react-toastify';
const CheckReports = () => {
  const [reports, setReports] = useState<any>([])
  const [searchParams] = useSearchParams()
  const usermail = localStorage.getItem("usermail")
  const searchmain = searchParams.get('email')
  const role = localStorage.getItem("role")
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // console.log(parsedUser)
  useEffect(() => {
    const getReports = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getReportsByRoleAndEmail?email=${searchmain ? searchmain : usermail}&role=teacher`);
        console.log(response?.data?.reports);

        // Sort reports by year (latest first) and then by semester (most recent first)
        const sortedReports = response.data.reports.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year; // Sort by year (latest first)
          }
          return b.semester.localeCompare(a.semester); // Sort by semester (most recent first)
        });

        setReports(sortedReports);
      } catch (error) {
        console.log(error);
      }
    };
    getReports();
  }, [searchmain, usermail]);

  const handleReportRoute = (id) => {

    toast.loading("opening Report.....")

    dispatch(setCurrentClassId(id));

    navigate('/studentTable')
    toast.dismiss()
    toast.success("Report opened successfully")

  }
  const handleDelete = async (classId: string) => {
    try {
      toast.loading('Deleting class...');
      await axios.delete(`${BASE_URL}/delete-class/${classId}`);
      setReports(reports.filter(classItem => classItem._id !== classId));
      toast.dismiss();
      toast.success('Class deleted successfully');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to delete class');
    }
  };
  return (
    <>
      <h4 className='py-2'>
        {
          role === "admin" ? "Admin mail :" : "Intructor mail :"
        }
        <span>: {usermail}</span>
      </h4>
      <h4 className='py-2'>
        {
          role === "admin" && <span>Intructor main :  {searchmain}</span>
        }

      </h4>

      <div className="max-w-7xl mx-auto rounded-md border border-gray-300 overflow-y-scroll h-screen py-60 pt-8 shadow-md">
        {
          reports && (
            <table className="w-full">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-center">Sn</th>
                  <th className="px-6 py-3 text-center">Course Code</th>
                  <th className="px-6 py-3 text-center">Class Name</th>
                  <th className="px-6 py-3 text-center">Level</th>
                  <th className="px-6 py-3 text-center">Total Students</th>
                  <th className="px-6 py-3 text-center">Semester</th>
                  <th className="px-6 py-3 text-center">Academic Year</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {reports.map((report: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-100 " : ""}
                    onClick={() => handleReportRoute(report._id)}
                  >
                    <td className="px-6 py-4 text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-center">{report?.courseCode}</td>
                    <td className="px-6 py-4 text-center">{report?.className}</td>
                    <td className="px-6 py-4 text-center">{report?.level}</td>
                    <td className="px-6 py-4 text-center">{report?.students.length}</td>
                    <td className="px-6 py-4 text-center">{report?.semester}</td>
                    <td className="px-6 py-4 text-center">{report?.academicYear}</td>
                    <td  className='px-2 flex gap-5 flex-row-reverse'>

                    <button
                      className="bg-blue-500 text-white px-6 py-2 rounded flex items-center justify-center mt-2"
                      onClick={() => handleReportRoute(report._id)}
                      >
                     View
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded flex items-center justify-center mt-2"
                      onClick={() => handleDelete(report._id)}
                      >
                      Delete
                    </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }

      </div>
    </>

  )
}
export default CheckReports
