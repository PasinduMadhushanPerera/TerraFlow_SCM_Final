import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message,
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Popconfirm,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  InboxOutlined,
  AlertOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  unit: string;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  unit: string;
  minimum_stock: number;
}

export const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ProductFormData) => {
    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
        : 'http://localhost:5000/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setEditingProduct(null);
        form.resetFields();
        fetchProducts();
      } else {
        message.error(data.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Error saving product');
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Product deleted successfully');
        fetchProducts();
      } else {
        message.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Error deleting product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) return 'critical';
    if (current <= minimum * 2) return 'low';
    return 'good';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ff4d4f';
      case 'low': return '#faad14';
      default: return '#52c41a';
    }
  };

  const getStockTag = (current: number, minimum: number) => {
    const status = getStockStatus(current, minimum);
    switch (status) {
      case 'critical':
        return <Tag color="red" icon={<AlertOutlined />}>Critical</Tag>;
      case 'low':
        return <Tag color="orange" icon={<WarningOutlined />}>Low Stock</Tag>;
      default:
        return <Tag color="green">Good Stock</Tag>;
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.category}
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record: Product) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <Text strong>{record.stock_quantity}</Text> {record.unit}
          </div>
          <Progress
            percent={(record.stock_quantity / (record.minimum_stock * 3)) * 100}
            size="small"
            strokeColor={getStockColor(getStockStatus(record.stock_quantity, record.minimum_stock))}
            format={() => ''}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            Min: {record.minimum_stock} {record.unit}
          </div>
        </div>
      ),
      sorter: (a: Product, b: Product) => a.stock_quantity - b.stock_quantity,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: Product) => getStockTag(record.stock_quantity, record.minimum_stock),
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'Low Stock', value: 'low' },
        { text: 'Good Stock', value: 'good' },
      ],
      onFilter: (value: any, record: Product) => 
        getStockStatus(record.stock_quantity, record.minimum_stock) === value,
    },
    {
      title: 'Inventory Value',
      key: 'value',
      render: (_, record: Product) => `$${(record.price * record.stock_quantity).toFixed(2)}`,
      sorter: (a: Product, b: Product) => 
        (a.price * a.stock_quantity) - (b.price * b.stock_quantity),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Product) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
    lowStockItems: products.filter(p => p.stock_quantity <= p.minimum_stock * 2).length,
    criticalItems: products.filter(p => p.stock_quantity <= p.minimum_stock).length,
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);

  return (
    <div className="w-full">
      <div className="mb-6">
        <Title level={2} className="text-amber-900 mb-2">
          Inventory Management
        </Title>
        <p className="text-gray-600 mb-4">
          Manage product listings, monitor stock levels, and track inventory value.
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Inventory Value"
              value={stats.totalValue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={stats.lowStockItems}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Critical Items"
              value={stats.criticalItems}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Critical Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert
          message="Critical Stock Alert"
          description={
            <div>
              <p>The following products are at or below minimum stock levels:</p>
              <ul>
                {lowStockProducts.slice(0, 5).map(product => (
                  <li key={product.id}>
                    <strong>{product.name}</strong>: {product.stock_quantity} {product.unit} 
                    (Min: {product.minimum_stock} {product.unit})
                  </li>
                ))}
              </ul>
              {lowStockProducts.length > 5 && <p>...and {lowStockProducts.length - 5} more items</p>}
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Actions */}
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>Inventory Overview</Text>
          </Col>
          <Col>
            <Space>
              <Button onClick={fetchProducts} loading={loading}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Product
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please input product name!' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category!' }]}
              >
                <Select placeholder="Select category">
                  <Option value="raw_materials">Raw Materials</Option>
                  <Option value="finished_products">Finished Products</Option>
                  <Option value="tools">Tools & Equipment</Option>
                  <Option value="packaging">Packaging</Option>
                  <Option value="chemicals">Chemicals</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Price ($)"
                name="price"
                rules={[{ required: true, message: 'Please input price!' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Stock Quantity"
                name="stock_quantity"
                rules={[{ required: true, message: 'Please input stock quantity!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please select unit!' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="pieces">Pieces</Option>
                  <Option value="kg">Kilograms</Option>
                  <Option value="tons">Tons</Option>
                  <Option value="liters">Liters</Option>
                  <Option value="meters">Meters</Option>
                  <Option value="boxes">Boxes</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Minimum Stock Level"
            name="minimum_stock"
            rules={[{ required: true, message: 'Please input minimum stock level!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Minimum stock threshold"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};