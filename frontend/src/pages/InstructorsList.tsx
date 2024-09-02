import axios from 'axios'
import React, { useEffect, useState } from 'react'
import BASE_URL from '../lib/db'
import { useNavigate } from 'react-router-dom'

 const InstructorsList =() => {
    const navigate = useNavigate()
    const role = localStorage.getItem("role")
    if(role !== "admin") {
        return (
            <div className='h-screen w-full flex items-center justify-center'>
                <h3 className='text-3xl font-semibold text-red-500'>You are not authorize to access this</h3>
            </div>
        )
    }
    const [instuctors, setinstuctors] = useState<any>([])
    const usermail = localStorage.getItem("usermail")
    useEffect(() => {
        const getinstructors = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/getInstructors`)
                console.log(response?.data)
                setinstuctors(response?.data)
            } catch (error) {
                console.log(error)
            }
        }
        getinstructors()
    },[])
  return (
    <>
    <h4 className='py-2'>Intructor mail : {usermail}</h4>
    
   <div className="max-w-7xl mx-auto rounded-md border border-gray-300 overflow-hidden shadow-md">
    {
        instuctors && (
            <table className="w-full">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Sr No</th>
                <th className="px-6 py-3 text-left">Instructor Mail</th>
                <th className="px-6 py-3 text-left">reports Count</th>
             
              </tr>
            </thead>
            <tbody className="bg-white">
              {instuctors.map((instructor: any, index: number) => (
                <tr onClick={(e:any)=>{
                    if(instructor?.reports.length > 0){
                        navigate('/check-report?email='+instructor?.email)
                    }else{
                        return
                    }
                } } key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4 text-left">{index + 1}</td>
                  <td className="px-6 py-4 text-left">{instructor?.email}</td>
                  <td className="px-6 py-4 text-left">{instructor?.reports.length}</td>
                
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
export default InstructorsList
