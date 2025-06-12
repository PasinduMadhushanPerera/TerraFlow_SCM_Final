import React, { useState } from 'react';
import { Card, Row, Col, Typography, Select, Input, Button, Tag, Space } from 'antd';
import { SearchOutlined, FilterOutlined, ShoppingCartOutlined } from '@ant-design/icons';
const {
  Title,
  Text,
  Paragraph
} = Typography;
const {
  Option
} = Select;
export const ProductCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const products = [{
    id: 1,
    name: 'Premium Red Clay',
    category: 'Raw Materials',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'High-quality red clay perfect for pottery and ceramics',
    inStock: true
  }, {
    id: 2,
    name: 'Stoneware Clay',
    category: 'Raw Materials',
    price: 52.99,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    description: 'Durable stoneware clay for professional use',
    inStock: true
  }, {
    id: 3,
    name: 'Porcelain Clay',
    category: 'Raw Materials',
    price: 68.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Fine porcelain clay for delicate work',
    inStock: false
  }, {
    id: 4,
    name: 'Clay Pottery Set',
    category: 'Finished Products',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    description: 'Complete pottery set with bowls and vases',
    inStock: true
  }, {
    id: 5,
    name: 'Ceramic Tiles',
    category: 'Finished Products',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Handcrafted ceramic tiles for decoration',
    inStock: true
  }, {
    id: 6,
    name: 'Sculpting Clay',
    category: 'Raw Materials',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    description: 'Soft clay perfect for sculpting projects',
    inStock: true
  }];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = priceFilter === 'all' || priceFilter === 'low' && product.price < 50 || priceFilter === 'medium' && product.price >= 50 && product.price < 100 || priceFilter === 'high' && product.price >= 100;
    return matchesSearch && matchesCategory && matchesPrice;
  });
  return <div className="w-full py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="text-amber-900 mb-4">
            Product Catalog
          </Title>
          <Paragraph className="text-xl text-gray-600">
            Discover our premium collection of clay products
          </Paragraph>
        </div>
        {/* Filters */}
        <Card className="mb-8">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input placeholder="Search products..." prefix={<SearchOutlined />} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} size="large" />
            </Col>
            <Col xs={24} sm={6}>
              <Select placeholder="Category" value={categoryFilter} onChange={setCategoryFilter} size="large" className="w-full">
                <Option value="all">All Categories</Option>
                <Option value="Raw Materials">Raw Materials</Option>
                <Option value="Finished Products">Finished Products</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Select placeholder="Price Range" value={priceFilter} onChange={setPriceFilter} size="large" className="w-full">
                <Option value="all">All Prices</Option>
                <Option value="low">Under $50</Option>
                <Option value="medium">$50 - $100</Option>
                <Option value="high">Over $100</Option>
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Button icon={<FilterOutlined />} size="large" className="w-full">
                Filter
              </Button>
            </Col>
          </Row>
        </Card>
        {/* Products Grid */}
        <Row gutter={[24, 24]}>
          {filteredProducts.map(product => <Col xs={24} sm={12} lg={8} key={product.id}>
              <Card hoverable cover={<img alt={product.name} src={product.image} className="h-48 object-cover" />} actions={[<Button type="primary" icon={<ShoppingCartOutlined />} disabled={!product.inStock} className="bg-amber-700 hover:bg-amber-800">
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>]} className="h-full">
                <div className="flex justify-between items-start mb-2">
                  <Title level={4} className="text-amber-800 mb-1">
                    {product.name}
                  </Title>
                  <Tag color={product.inStock ? 'green' : 'red'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Tag>
                </div>
                <Tag color="blue" className="mb-2">
                  {product.category}
                </Tag>
                <Paragraph className="text-gray-600 mb-3">
                  {product.description}
                </Paragraph>
                <Text strong className="text-2xl text-amber-700">
                  ${product.price}
                </Text>
              </Card>
            </Col>)}
        </Row>
        {filteredProducts.length === 0 && <div className="text-center py-16">
            <Title level={3} className="text-gray-500">
              No products found
            </Title>
            <Paragraph className="text-gray-400">
              Try adjusting your search criteria
            </Paragraph>
          </div>}
      </div>
    </div>;
};