import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../lib/db';
import { toast } from 'react-toastify';

interface Class {
  _id: string;
  className: string;
  courseCode: string;
  // Add other fields as needed
}

const Reports: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        toast.loading('Fetching classes...');
        const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
        const response = await axios.get(`${BASE_URL}/list-classes/${userId}`);
        setClasses(response.data.classes);
        toast.dismiss();
        toast.success('Classes fetched successfully');
        setLoading(false);
      } catch (err) {
        toast.dismiss();
        setError('Failed to fetch classes');
        setLoading(false);
        toast.error('Failed to fetch classes');
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-center text-gray-500">Loading, please wait...</p>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Classes List</h1>
      <ul>
        {classes.map((classItem) => (
          <li key={classItem._id}>
            {classItem.className} - {classItem.courseCode} | {classItem.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;