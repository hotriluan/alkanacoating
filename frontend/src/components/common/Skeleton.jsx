import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div
      className={`bg-gray-200 rounded-md animate-pulse ${className}`}
    ></div>
  );
};

export default Skeleton;
