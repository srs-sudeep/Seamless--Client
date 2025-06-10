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
          <div className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-background p-6 space-y-4 transition-all duration-300">
            {heading && (
              <h1 className="xl:text-3xl text-lg md:text-2xl font-bold text-foreground truncate relative pb-2">
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
        </div>
      )}
      {children}
    </>
  );
};

export { HelmetWrapper };
