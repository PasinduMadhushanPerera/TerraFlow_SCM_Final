import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Checkbox, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
const {
  Title,
  Text,
  Link
} = Typography;
export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        message.success('Login successful!');
        // Redirect based on user role will be handled by AuthContext
        navigate('/');
      } else {
        message.error('Invalid username or password');
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-amber-800 mb-2">
            Welcome Back
          </Title>
          <Text className="text-gray-600">
            Sign in to your TerraFlow account
          </Text>
        </div>
        <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" label="Username" rules={[{
          required: true,
          message: 'Please input your username!'
        }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter your username" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{
          required: true,
          message: 'Please input your password!'
        }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" className="rounded-lg" />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="#" className="text-amber-700">
                Forgot password?
              </Link>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 bg-amber-700 hover:bg-amber-800 rounded-lg text-lg font-medium">
              {loading ? <Spin size="small" /> : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-amber-700 font-medium">
              Register here
            </Link>
          </Text>
        </div>
        <div className="mt-8 p-4 bg-amber-50 rounded-lg">
          <Text className="text-sm text-gray-600 block mb-2">
            Demo Accounts:
          </Text>
          <Text className="text-xs text-gray-500 block">
            Admin: admin / admin123
          </Text>
          <Text className="text-xs text-gray-500 block">
            Customer: customer / customer123
          </Text>
          <Text className="text-xs text-gray-500 block">
            Supplier: supplier / supplier123
          </Text>
        </div>
      </Card>
    </div>;
};