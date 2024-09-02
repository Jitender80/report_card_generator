import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../lib/db';

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
        const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
        const response = await axios.get(`${BASE_URL}/list-classes/${userId}`);
        setClasses(response.data.classes);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch classes');
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
            {classItem.className} - {classItem.courseCode}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;