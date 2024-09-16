// frontend/src/FinalReport.js
import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../lib/db';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

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
export default function FinalReport() {
  const [data, setData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const [reportId, setReportId] = useState('');

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/previewReportCard/${reportId}`);
      setPreviewHtml(response.data);
      toast.success('Preview generated successfully');
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const [classData, setClassData] = useState({
    academicYear: '',
    semester: '',
  });
  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${BASE_URL}/generateReportCardPDF`);

    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }
  const handleReportData = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const semester = classData.semester;
    const year = classData.academicYear;

    if (semester == '' || year == '') {
      return toast.error('Please fill all fields');
    }

    try {
      toast.info('Generating report card...');
      const response = await axios.post(`${BASE_URL}/finalReportCard`, {  academicYear : year, semester});
      setReportId(response.data.data._id);
      console.log("🚀 ~ handleReportData ~ response:", response.data)

      setSubmitted(true);
      toast.dismiss();
      toast.success('Report card generated successfully');
    } catch (error) {
      console.error('Error generating report card:', error);
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClassData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  if(!submitted){
    return(
      <div className="w-full max-w-lg bg-white p-5 rounded shadow-md mb-5">
        <form onSubmit={handleReportData} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              value={classData.semester}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
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
          </div>
          <div>
          <label className="flex flex-col">
          Academic Year:
          <select
            type="string"
            name="academicYear"
            value={classData.academicYear}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Select Academic Year</option>
            {generateYearOptions()}
          </select>
        </label>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded font-semibold mt-3">
            Preview Report Card
          </button>
        </form>
      </div>
    )

  }

  console.log('reportId', reportId);


  return (
    <div className="bg-blue-100 w-full h-full flex-1 overflow-y-scroll flex flex-col justify-center items-center p-5">
    <h1 className="text-3xl font-bold mb-5">Final Report</h1>
    <div className="mb-5">
      <Button onClick={()=>  window.open(`${BASE_URL}/generateReportCardPDF`)} className="bg-blue-500 text-white px-4 py-2 rounded font-semibold">
        Download Report
      </Button>
    </div>

    <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-5 rounded shadow-md mb-5  flex justify-center items-center">
      {/* Add form fields to input data and templates */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded font-semibold mt-3">
        Preview Report Card
      </button>
    </form>

    {!previewHtml && <div className="text-lg font-semibold mt-5">Loading...</div>}

    <div className="px-5 py-5 bg-blue-200 mt-5 w-full  rounded shadow-md">
      <div  className="preview-container" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  </div>
  );
}

