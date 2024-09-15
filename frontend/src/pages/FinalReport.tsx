// frontend/src/FinalReport.js
import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../lib/db';
import { Button } from '../ui/button';

export default function FinalReport() {
  const [data, setData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/previewReportCard`);
      setPreviewHtml(response.data);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };
  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${BASE_URL}/generateReportCardPDF`);

    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }

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

    <div className="px-10 py-5 bg-blue-200 mt-5 w-full max-w-4xl rounded shadow-md">
      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  </div>
  );
}

