
import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';
import FormField from '../../ui/FormField';

const IntegrationsPage: React.FC = () => {
  return (
    <PageWrapper page={Page.Integrations}>
      <div className="neo-container rounded-xl p-6">
        <p className="text-sm mb-6">
          Connect third-party services to extend the functionality of your application.
          <strong className="block mt-1">Note: These features require a backend server and are currently for demonstration purposes only.</strong>
        </p>
        
        <div className="space-y-6">
          {/* SMS Gateway */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
            <h4 className="text-lg font-bold mb-2">SMS Gateway</h4>
            <p className="text-xs mb-4">Configure an SMS provider to send fee reminders and other notifications.</p>
            <FormField label="Provider API Key" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}>
              <input type="password" placeholder="Enter API Key" className="neo-button w-full rounded-xl p-3" disabled />
            </FormField>
          </div>

          {/* Payment Gateway */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
            <h4 className="text-lg font-bold mb-2">Payment Gateway</h4>
            <p className="text-xs mb-4">Allow parents to pay fees online through a payment gateway.</p>
            <FormField label="Gateway Secret Key" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
              <input type="password" placeholder="Enter Secret Key" className="neo-button w-full rounded-xl p-3" disabled />
            </FormField>
          </div>

          <div className="flex justify-end mt-4">
            <button className="neo-button-primary rounded-xl px-6 py-2 text-base font-semibold opacity-50 cursor-not-allowed">
              Save Integrations
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default IntegrationsPage;