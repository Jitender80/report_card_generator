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
    <div className='bg-blue-100 w-full h-full overflow-y-scroll '>
      <h1>Final Report</h1>
      <div>
        <Button onClick={handleDownload}>
          Download Report
        </Button>
        {previewHtml && (
        <div className="preview-modal">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Add form fields to input data and templates */}
        <button type="submit">Preview Report Card</button>
      </form>
      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  );
}

