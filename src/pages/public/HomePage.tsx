import React from 'react';
import { Button, Card, Row, Col, Typography, Carousel, Space } from 'antd';
import { ArrowRightOutlined, ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const {
  Title,
  Paragraph,
  Text
} = Typography;
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const features = [{
    title: 'Premium Clay Products',
    description: 'High-quality clay materials sourced from the finest deposits',
    icon: '🏺'
  }, {
    title: 'Reliable Supply Chain',
    description: 'Consistent delivery and inventory management',
    icon: '🚚'
  }, {
    title: 'Expert Support',
    description: 'Professional guidance for all your clay product needs',
    icon: '👥'
  }];
  const testimonials = [{
    name: 'Sarah Johnson',
    company: 'Pottery Studio Pro',
    text: 'TerraFlow has been our trusted partner for over 3 years. Their quality is unmatched!',
    rating: 5
  }, {
    name: 'Mike Chen',
    company: 'Ceramic Arts Inc',
    text: 'The supply chain management system makes ordering so much easier.',
    rating: 5
  }];
  return <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Title level={1} className="text-amber-900 mb-6 text-5xl font-bold">
            Welcome to TerraFlow
          </Title>
          <Paragraph className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your premier destination for high-quality clay products and
            comprehensive supply chain management solutions.
          </Paragraph>
          <Space size="large">
            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => navigate('/products')} className="bg-amber-700 hover:bg-amber-800 h-12 px-8 text-lg">
              Browse Products
            </Button>
            <Button size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/register')} className="h-12 px-8 text-lg">
              Get Started
            </Button>
          </Space>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="text-center text-amber-900 mb-12">
            Why Choose TerraFlow?
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => <Col xs={24} md={8} key={index}>
                <Card className="text-center h-full shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <Title level={4} className="text-amber-800 mb-3">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-600">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>)}
          </Row>
        </div>
      </div>
      {/* Testimonials Section */}
      <div className="py-16 px-6 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="text-center text-amber-900 mb-12">
            What Our Customers Say
          </Title>
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => <Col xs={24} md={12} key={index}>
                <Card className="h-full shadow-lg">
                  <div className="mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <StarOutlined key={i} className="text-yellow-500 text-lg" />)}
                  </div>
                  <Paragraph className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </Paragraph>
                  <div>
                    <Text strong className="text-amber-800">
                      {testimonial.name}
                    </Text>
                    <br />
                    <Text className="text-gray-600">{testimonial.company}</Text>
                  </div>
                </Card>
              </Col>)}
          </Row>
        </div>
      </div>
      {/* CTA Section */}
      <div className="py-16 px-6 bg-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={2} className="text-white mb-6">
            Ready to Transform Your Supply Chain?
          </Title>
          <Paragraph className="text-xl text-amber-100 mb-8">
            Join thousands of satisfied customers who trust TerraFlow for their
            clay product needs.
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/register')} className="bg-white text-amber-800 hover:bg-amber-50 h-12 px-8 text-lg font-medium">
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </div>;
};