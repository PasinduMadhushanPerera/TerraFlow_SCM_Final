import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Button, Layout } from 'antd';
import { HomeOutlined, ShoppingOutlined, InfoCircleOutlined, ContactsOutlined, LoginOutlined } from '@ant-design/icons';
const {
  Header
} = Layout;
export const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = [{
    key: 'home',
    icon: <HomeOutlined />,
    label: <Link to="/">Home</Link>
  }, {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: <Link to="/products">Products</Link>
  }, {
    key: 'about',
    icon: <InfoCircleOutlined />,
    label: <Link to="/about">About Us</Link>
  }, {
    key: 'contact',
    icon: <ContactsOutlined />,
    label: <Link to="/contact">Contact</Link>
  }];
  return <Header className="bg-white shadow-md px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-amber-800 mr-8">
          TerraFlow
        </Link>
        <Menu mode="horizontal" items={menuItems} className="border-none bg-transparent" style={{
        minWidth: 0,
        flex: 'auto'
      }} />
      </div>
      <div className="flex gap-3">
        <Button type="default" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button type="primary" onClick={() => navigate('/register')} className="bg-amber-700 hover:bg-amber-800">
          Register
        </Button>
      </div>
    </Header>;
};