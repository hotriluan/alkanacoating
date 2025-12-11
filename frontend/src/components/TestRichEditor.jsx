import React, { useState } from 'react';
import RichTextEditor from '../admin/components/RichTextEditor';

const TestRichEditor = () => {
  const [content, setContent] = useState('<p>Đây là nội dung test ban đầu với <strong>bold text</strong> và <em>italic text</em></p>');

  const handleChange = (value) => {
    setContent(value);
    console.log('Content changed:', value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Rich Text Editor</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nội dung bài viết:
        </label>
        <RichTextEditor
          value={content}
          onChange={handleChange}
          placeholder="Nhập nội dung của bạn..."
          height="300px"
        />
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">HTML Output:</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
          {content}
        </pre>
      </div>

      <div className="bg-white p-4 rounded border mt-4">
        <h3 className="text-lg font-semibold mb-2">Preview:</h3>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default TestRichEditor;