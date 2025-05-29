import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const Cart: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Shopping Cart
      </Title>
      <p>Shopping cart page content will be implemented here.</p>
    </div>;
};