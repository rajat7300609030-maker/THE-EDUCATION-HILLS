
import React, { ReactNode } from 'react';
import { PAGE_DATA } from '../../constants/pageData';
import { Page } from '../../types';

interface PageWrapperProps {
  page: Page;
  children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ page, children }) => {
  const pageInfo = PAGE_DATA[page];

  return (
    <div>
      <div className="neo-container rounded-3xl p-6 mb-8 flex items-center space-x-4">
        {pageInfo.icon}
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">{pageInfo.title}</h2>
          <p className="text-gray-600 text-sm">{pageInfo.description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default PageWrapper;
