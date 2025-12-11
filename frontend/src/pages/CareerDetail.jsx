import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CareerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cv_file: null,
    cover_letter: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchJobDetails();
  }, [slug]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/recruitments/${slug}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.cv_file) {
      newErrors.cv_file = 'Vui lòng upload CV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          cv_file: 'File CV không được vượt quá 5MB'
        }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          cv_file: 'Chỉ chấp nhận file PDF, DOC, DOCX'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        cv_file: file
      }));
      setErrors(prev => ({
        ...prev,
        cv_file: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('recruitment_id', job.id);
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('cv_file', formData.cv_file);
      submitData.append('cover_letter', formData.cover_letter);

      await api.post('/applications', submitData);

      setSuccessMessage('Ứng tuyển thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setShowApplicationForm(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cv_file: null,
        cover_letter: ''
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({
        submit: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy vị trí tuyển dụng</h2>
          <Link to="/tuyen-dung" className="text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(job.deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/tuyen-dung" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách việc làm
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Job Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                
                <div className="flex flex-wrap gap-4 text-gray-600">
                  {job.location && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description */}
              {job.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả công việc</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu ứng viên</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Deadline */}
              {job.deadline && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Hạn nộp hồ sơ</div>
                  <div className="font-semibold text-gray-900">{formatDate(job.deadline)}</div>
                  {daysRemaining !== null && daysRemaining >= 0 && (
                    <div className={`text-sm mt-2 ${daysRemaining <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      Còn {daysRemaining} ngày
                    </div>
                  )}
                </div>
              )}

              {/* Apply Button */}
              {!showApplicationForm ? (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
                >
                  Ứng tuyển ngay
                </button>
              ) : (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Form ứng tuyển</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500`}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500`}
                        placeholder="email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500`}
                        placeholder="0901234567"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* CV Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload CV *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={`w-full text-sm ${errors.cv_file ? 'border-red-500' : ''}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (tối đa 5MB)</p>
                      {errors.cv_file && <p className="text-red-500 text-xs mt-1">{errors.cv_file}</p>}
                      {formData.cv_file && (
                        <p className="text-green-600 text-xs mt-1">✓ {formData.cv_file.name}</p>
                      )}
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thư giới thiệu (tùy chọn)
                      </label>
                      <textarea
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Viết vài dòng giới thiệu về bản thân..."
                      />
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {errors.submit}
                      </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApplicationForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Share */}
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-2">Chia sẻ công việc này</div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-sm py-2 px-3 rounded-md transition-colors">
                    Zalo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;
