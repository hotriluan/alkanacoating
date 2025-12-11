import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/analytics');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || { message: 'An unexpected error occurred.' });
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="ml-4 text-gray-600">Đang tải dữ liệu từ Google Analytics...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-300 text-red-800 p-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">{error.error || 'Lỗi'}</h3>
          <p>{error.message || 'Không thể kết nối đến Google Analytics.'}</p>
          <a href="/admin/settings" className="mt-4 inline-block bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600">
            Đi đến trang Cài đặt
          </a>
        </div>
      );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">🤷</p>
                <p>Không có dữ liệu nào trong 28 ngày qua.</p>
            </div>
        );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan người dùng trong 28 ngày qua</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Người dùng hoạt động" />
            <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" name="Người dùng mới" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Phân tích Website</h1>
      {renderContent()}
      {/* Google Looker Studio Embed */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Báo cáo chi tiết từ Looker Studio</h2>
        <iframe width="100%" height="2125" src="https://lookerstudio.google.com/embed/reporting/2526922b-ec76-4625-8ae3-75a20ef08254/page/p_ev5o6t54bd" frameborder="0" style={{border: '0'}} allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
    </div>
  );
};

export default Analytics;
