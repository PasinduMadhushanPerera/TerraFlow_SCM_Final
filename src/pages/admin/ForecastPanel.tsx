import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const ForecastPanel: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Forecast Panel
      </Title>
      <p>Forecast panel page content will be implemented here.</p>
    </div>;
};