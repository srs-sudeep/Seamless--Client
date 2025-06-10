import React from 'react';
import { Helmet } from 'react-helmet-async';

type HelmetWrapperProps = {
  title?: string;
  description?: string;
  keywords?: string;
  heading?: string;
  subHeading?: string;
  children?: React.ReactNode;
};

const HelmetWrapper: React.FC<HelmetWrapperProps> = ({
  title = 'Seamless',
  description = 'Seamless Management System',
  keywords = 'default, keywords',
  heading,
  subHeading,
  children,
}) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Helmet>
      {(heading || subHeading) && (
        <div className="mx-6 mt-6 mb-4">
          {heading && (
            <h1 className="block md:hidden xl:text-3xl text-lg md:text-2xl font-bold text-foreground truncate relative pb-2">
              {heading}
              <span className="block h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full mt-2" />
            </h1>
          )}
          {subHeading && (
            <div className="mt-1 text-base md:text-lg text-muted-foreground font-medium">
              {subHeading}
            </div>
          )}
        </div>
      )}
      {children}
    </>
  );
};

export { HelmetWrapper };
