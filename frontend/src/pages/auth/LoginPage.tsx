import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    const { email, password } = values;

    setLoading(true);
    try {
      const success = await login(email, password);
      
      if (success) {
        message.success('Login successful!');
        
        // Get user from localStorage to determine role
        const userData = localStorage.getItem('terraflow_user');
        if (userData) {
          const user = JSON.parse(userData);
          const role = user.role;
          
          // Navigate based on role
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'customer') {
            navigate('/customer');
          } else if (role === 'supplier') {
            navigate('/supplier');
          } else {
            navigate('/');
          }
        }
      } else {
        message.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md p-6 rounded-xl shadow-lg border-0">
        <div className="text-center mb-8">
          <Title level={2} className="text-indigo-600 mb-2">TerraFlow SCM</Title>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Enter your email address"
              className="h-12 rounded-lg"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Enter your password"
              className="h-12 rounded-lg"
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 border-0 text-white font-semibold"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Button 
              type="link" 
              onClick={() => navigate('/register')}
              className="p-0 text-indigo-600 hover:text-indigo-700"
            >
              Register here
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};
