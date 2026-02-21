import React from 'react';

const Skeleton = ({ type = 'text', className = '' }) => {
  const baseClass = 'animate-pulse bg-cosmic-light/50 rounded';

  const types = {
    text: `${baseClass} h-4`,
    title: `${baseClass} h-8`,
    avatar: `${baseClass} w-12 h-12 rounded-full`,
    image: `${baseClass} w-full h-48`,
    card: `${baseClass} w-full h-64`,
    button: `${baseClass} w-24 h-10`,
  };

  return <div className={`${types[type]} ${className}`} />;
};

export const SkeletonLoader = ({ count = 1, type = 'text' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} type={type} />
      ))}
    </>
  );
};

export default Skeleton;
