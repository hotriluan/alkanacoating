import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
      ['code-block']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image',
    'code-block'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Nhập nội dung...'}
        style={{ height: '400px', marginBottom: '50px' }}
      />
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💡 <strong>Hướng dẫn:</strong> Sử dụng toolbar để format text. 
        Hỗ trợ: Tiêu đề, In đậm/nghiêng, Danh sách, Căn lề, Link, Hình ảnh.
      </div>
      
      <style>{`
        .rich-text-editor .ql-container {
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .rich-text-editor .ql-editor {
          min-height: 400px;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 0.83em 0;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.17em;
          font-weight: 600;
          margin: 1em 0;
        }
        .rich-text-editor .ql-editor p {
          margin: 0.5em 0;
        }
        .rich-text-editor .ql-editor ul, 
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5em;
        }
        .rich-text-editor .ql-editor strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
