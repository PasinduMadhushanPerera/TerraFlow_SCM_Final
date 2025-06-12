import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Progress,
  Statistic,
  Alert,
  Space,
  Tooltip,
  Badge,
  message
} from 'antd';
import {
  RiseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BuildOutlined,
  ReloadOutlined,
  BulbOutlined,
  RocketOutlined,
  AlertOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ProductionRecommendation {
  product_name: string;
  stock_quantity: number;
  minimum_stock: number;
  avg_weekly_sales: number;
  priority: 'Urgent' | 'Medium' | 'Low';
  recommended_production: number;
}

interface PredictionData {
  product: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout: number;
  recommendedAction: string;
  confidence: number;
}

export const ForecastPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ProductionRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchProductionRecommendations();
  }, []);

  const fetchProductionRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/production-recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
        setLastUpdated(new Date());
      } else {
        message.error('Failed to fetch production recommendations');
      }
    } catch (error) {
      message.error('Failed to fetch production recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock prediction data based on recommendations
  const generatePredictions = (): PredictionData[] => {
    return recommendations.map(rec => {
      const weeklySales = rec.avg_weekly_sales || 1;
      const currentStock = rec.stock_quantity;
      const daysUntilStockout = Math.floor((currentStock / weeklySales) * 7);
      const predictedDemand = Math.floor(weeklySales * 4); // 4 weeks forecast
      
      let recommendedAction = 'Monitor';
      let confidence = 85;
      
      if (rec.priority === 'Urgent') {
        recommendedAction = 'Immediate Production Required';
        confidence = 95;
      } else if (rec.priority === 'Medium') {
        recommendedAction = 'Schedule Production Soon';
        confidence = 88;
      } else {
        recommendedAction = 'Maintain Current Levels';
        confidence = 75;
      }

      return {
        product: rec.product_name,
        currentStock: currentStock,
        predictedDemand,
        daysUntilStockout: Math.max(daysUntilStockout, 0),
        recommendedAction,
        confidence
      };
    });
  };

  const predictions = generatePredictions();

  const recommendationColumns: ColumnsType<ProductionRecommendation> = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Current Stock',
      key: 'current_stock',
      render: (_, record) => {
        const percentage = (record.stock_quantity / record.minimum_stock) * 100;
        const color = percentage <= 100 ? 'red' : percentage <= 200 ? 'orange' : 'green';
        
        return (
          <div>
            <Text>{record.stock_quantity}</Text>
            <Progress
              percent={Math.min(percentage, 200)}
              strokeColor={color}
              size="small"
              className="mt-1"
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Min: {record.minimum_stock}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Weekly Sales Avg',
      dataIndex: 'avg_weekly_sales',
      key: 'avg_weekly_sales',
      render: (sales) => (
        <Tooltip title="Average weekly sales based on recent orders">
          <Tag color="blue">
            {Number(sales || 0).toFixed(1)} units/week
          </Tag>
        </Tooltip>
      ),
    },    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: 'Urgent' | 'Medium' | 'Low') => {
        const config = {
          Urgent: { color: 'red', icon: <AlertOutlined /> },
          Medium: { color: 'orange', icon: <WarningOutlined /> },
          Low: { color: 'green', icon: <CheckCircleOutlined /> },
        };
        const { color, icon } = config[priority];
        return (
          <Tag color={color} icon={icon}>
            {priority.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Recommended Production',
      dataIndex: 'recommended_production',
      key: 'recommended_production',
      render: (amount, record) => (
        <div>
          <Text strong style={{ color: record.priority === 'Urgent' ? '#ff4d4f' : '#1890ff' }}>
            {amount} units
          </Text>
          {amount > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Target: {record.minimum_stock * 3} units
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.recommended_production > 0 ? (
            <Button
              type="primary"
              size="small"
              icon={<BuildOutlined />}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Start Production
            </Button>
          ) : (
            <Button size="small" disabled>
              No Action Needed
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const predictionColumns: ColumnsType<PredictionData> = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Current vs Predicted Demand',
      key: 'demand_comparison',
      render: (_, record) => (
        <div>
          <div>Current: {record.currentStock} units</div>
          <div>4-Week Forecast: {record.predictedDemand} units</div>
          <Progress
            percent={(record.currentStock / record.predictedDemand) * 100}
            strokeColor={record.currentStock >= record.predictedDemand ? 'green' : 'red'}
            size="small"
            className="mt-1"
          />
        </div>
      ),
    },
    {
      title: 'Stock-out Risk',
      key: 'stockout_risk',
      render: (_, record) => {
        const days = record.daysUntilStockout;
        let color = 'green';
        let text = 'Low Risk';
        
        if (days <= 7) {
          color = 'red';
          text = 'High Risk';
        } else if (days <= 14) {
          color = 'orange';
          text = 'Medium Risk';
        }
        
        return (
          <div>
            <Tag color={color}>{text}</Tag>
            <div>
              <Text type="secondary">
                {days > 0 ? `${days} days remaining` : 'Out of stock'}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Recommended Action',
      dataIndex: 'recommendedAction',
      key: 'recommendedAction',
      render: (action, record) => (
        <div>
          <Text>{action}</Text>
          <div>
            <Badge
              status={record.confidence >= 90 ? 'success' : record.confidence >= 80 ? 'processing' : 'warning'}
              text={`${record.confidence}% confidence`}
            />
          </div>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const urgentItems = recommendations.filter(r => r.priority === 'Urgent').length;
  const mediumItems = recommendations.filter(r => r.priority === 'Medium').length;
  const totalRecommendedProduction = recommendations.reduce((sum, r) => sum + r.recommended_production, 0);
  const highRiskItems = predictions.filter(p => p.daysUntilStockout <= 7).length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="text-amber-900 mb-0">
          Smart Production Forecast Panel
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchProductionRecommendations}
            loading={loading}
          >
            Refresh Data
          </Button>
          {lastUpdated && (
            <Text type="secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </Space>
      </div>

      {/* Alert for urgent items */}
      {urgentItems > 0 && (
        <Alert
          message={`${urgentItems} product(s) require immediate attention!`}
          description="These products have critically low stock levels and need urgent production scheduling."
          type="error"
          icon={<AlertOutlined />}
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="text">
              View Details
            </Button>
          }
        />
      )}

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Urgent Items"
              value={urgentItems}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Medium Priority"
              value={mediumItems}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="High Risk Items"
              value={highRiskItems}
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Production Needed"
              value={totalRecommendedProduction}
              prefix={<BuildOutlined style={{ color: '#1890ff' }} />}
              suffix="units"
            />
          </Card>
        </Col>
      </Row>

      {/* AI Insights Card */}
      <Card
        title={
          <span>
            <BulbOutlined className="mr-2" />
            AI-Powered Insights
          </span>
        }
        className="mb-6"
        extra={<Badge status="processing" text="Live Analysis" />}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Alert
              message="Production Optimization"
              description={`Based on sales trends, consider increasing production capacity for high-demand items. Current efficiency can be improved by ${((urgentItems / recommendations.length) * 100).toFixed(1)}%.`}
              type="info"
              icon={<RocketOutlined />}
              showIcon
            />
          </Col>
          <Col span={12}>
            <Alert
              message="Inventory Strategy"
              description={`Seasonal demand patterns suggest adjusting safety stock levels. Consider bulk production during low-demand periods to optimize costs.`}
              type="success"
              icon={<RiseOutlined />}
              showIcon
            />
          </Col>
        </Row>
      </Card>

      {/* Production Recommendations Table */}
      <Card
        title={
          <span>
            <BuildOutlined className="mr-2" />
            Production Recommendations
          </span>
        }
        className="mb-6"
      >
        <Table
          columns={recommendationColumns}
          dataSource={recommendations}
          rowKey="product_name"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          rowClassName={(record) => {
            if (record.priority === 'Urgent') return 'bg-red-50';
            if (record.priority === 'Medium') return 'bg-orange-50';
            return '';
          }}
        />
      </Card>

      {/* Demand Forecast Table */}
      <Card
        title={
          <span>
            <RiseOutlined className="mr-2" />
            4-Week Demand Forecast
          </span>
        }
      >
        <Table
          columns={predictionColumns}
          dataSource={predictions}
          rowKey="product"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          rowClassName={(record) => {
            if (record.daysUntilStockout <= 7) return 'bg-red-50';
            if (record.daysUntilStockout <= 14) return 'bg-orange-50';
            return '';
          }}
        />
      </Card>
    </div>
  );
};