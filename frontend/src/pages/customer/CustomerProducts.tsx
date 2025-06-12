import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const CustomerProducts: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Customer Products
      </Title>
      <p>Customer products page content will be implemented here.</p>
    </div>;
};