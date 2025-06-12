import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const DeliveryHistory: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Delivery History
      </Title>
      <p>Delivery history page content will be implemented here.</p>
    </div>;
};