import React from 'react';
import { Helmet } from 'react-helmet-async';

type HelmetWrapperProps = {
  title?: string;
  description?: string;
  keywords?: string;
  children?: React.ReactNode;
};

const HelmetWrapper: React.FC<HelmetWrapperProps> = ({
  title = 'Seamless',
  description = 'Seamless Management System',
  keywords = 'default, keywords',
  children,
}) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Helmet>
      {children}
    </>
  );
};

export { HelmetWrapper };
