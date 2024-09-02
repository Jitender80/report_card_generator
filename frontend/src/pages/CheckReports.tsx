import axios from 'axios'
import React, { useEffect, useState } from 'react'
import BASE_URL from '../lib/db'
import { useSearchParams } from 'react-router-dom'

 const CheckReports =() => {
    const [reports, setReports] = useState<any>([])
    const [searchParams] = useSearchParams()
    const usermail = localStorage.getItem("usermail")
    const searchmain = searchParams.get('email')
    const role = localStorage.getItem("role")
  
    // console.log(parsedUser)
    useEffect(() => {

        const getReports = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/getReportsByRoleAndEmail?email=${searchmain ? searchmain : usermail}&role=teacher`)
                console.log(response?.data?.reports)
                setReports(response?.data?.reports)
            } catch (error) {
                console.log(error)
            }
        }
        getReports()
      
    },[])
  return (
    <>
    <h4 className='py-2'>
        {
            role === "admin" ?  "Admin mail :" :  "Intructor main :" 
        }
        <span>: {usermail}</span>
    </h4>
    <h4 className='py-2'>
        {
            role === "admin" &&    <span>Intructor main :  {searchmain}</span>
        }
      
    </h4>
    
   <div className="max-w-7xl mx-auto rounded-md border border-gray-300 overflow-hidden shadow-md">
    {
        reports && (
            <table className="w-full">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Sr No</th>
                <th className="px-6 py-3 text-left">Course Code</th>
                <th className="px-6 py-3 text-left">Class Name</th>
                <th className="px-6 py-3 text-left">Level</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {reports.map((report: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4 text-left">{index + 1}</td>
                  <td className="px-6 py-4 text-left">{report?.courseCode}</td>
                  <td className="px-6 py-4 text-left">{report?.className}</td>
                  <td className="px-6 py-4 text-left">{report?.level}</td>
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
