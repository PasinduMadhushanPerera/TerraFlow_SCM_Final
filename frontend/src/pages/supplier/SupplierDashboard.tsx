import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const SupplierDashboard: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Supplier Dashboard
      </Title>
      <p>Supplier dashboard content will be implemented here.</p>
    </div>;
};