import React from 'react';
import { Typography } from 'antd';
const {
  Title
} = Typography;
export const ForecastViewer: React.FC = () => {
  return <div className="w-full">
      <Title level={2} className="text-amber-900 mb-6">
        Forecast Viewer
      </Title>
      <p>Forecast viewer page content will be implemented here.</p>
    </div>;
};