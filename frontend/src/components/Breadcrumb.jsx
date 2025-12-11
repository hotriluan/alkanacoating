import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="text-sm text-gray-600 mb-6" data-aos="fade-down">
      {items.map((item, index) => (
        <span key={index}>
          {item.link ? (
            <Link to={item.link} className="hover:text-brand-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800">{item.label}</span>
          )}
          {index < items.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
