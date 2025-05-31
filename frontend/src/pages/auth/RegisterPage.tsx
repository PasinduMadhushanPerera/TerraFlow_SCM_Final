import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Select, Upload, Typography, Modal, Checkbox, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
const {
  Title,
  Text,
  Link,
  Paragraph
} = Typography;
const {
  Option
} = Select;
export const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [userRole, setUserRole] = useState<string>('customer');
  const [loading, setLoading] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const {
    register
  } = useAuth();
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    if (!termsAccepted) {
      setTermsModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      const success = await register({
        ...values,
        role: userRole
      });
      if (success) {
        message.success('Registration successful! Please login to continue.');
        navigate('/login');
      } else {
        message.error('Registration failed. Please try again.');
      }
    } catch (error) {
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setTermsModalVisible(false);
    form.submit();
  };
  const renderCustomerFields = () => <>
      <Form.Item name="fullName" label="Full Name" rules={[{
      required: true,
      message: 'Please input your full name!'
    }]}>
        <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
      </Form.Item>
      <Form.Item name="mobile" label="Mobile Number" rules={[{
      required: true,
      message: 'Please input your mobile number!'
    }]}>
        <Input prefix={<PhoneOutlined />} placeholder="Enter your mobile number" />
      </Form.Item>
      <Form.Item name="address" label="Address" rules={[{
      required: true,
      message: 'Please input your address!'
    }]}>
        <Input.TextArea prefix={<HomeOutlined />} placeholder="Enter your address" rows={3} />
      </Form.Item>
    </>;
  const renderSupplierFields = () => <>
      <Form.Item name="fullName" label="Full Name" rules={[{
      required: true,
      message: 'Please input your full name!'
    }]}>
        <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
      </Form.Item>
      <Form.Item name="businessName" label="Business Name" rules={[{
      required: true,
      message: 'Please input your business name!'
    }]}>
        <Input placeholder="Enter your business name" />
      </Form.Item>
      <Form.Item name="contactNo" label="Contact Number" rules={[{
      required: true,
      message: 'Please input your contact number!'
    }]}>
        <Input prefix={<PhoneOutlined />} placeholder="Enter your contact number" />
      </Form.Item>
      <Form.Item name="businessAddress" label="Business Address" rules={[{
      required: true,
      message: 'Please input your business address!'
    }]}>
        <Input.TextArea placeholder="Enter your business address" rows={3} />
      </Form.Item>
      <Form.Item name="businessDocument" label="Business Registration Document" rules={[{
      required: true,
      message: 'Please upload your business registration document!'
    }]}>
        <Upload beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>Upload Document</Button>
        </Upload>
      </Form.Item>
    </>;
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl rounded-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-amber-800 mb-2">
            Join TerraFlow
          </Title>
          <Text className="text-gray-600">
            Create your account to get started
          </Text>
        </div>
        <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="role" label="Account Type" rules={[{
          required: true,
          message: 'Please select your account type!'
        }]}>
            <Select placeholder="Select account type" onChange={setUserRole} defaultValue="customer">
              <Option value="customer">Customer</Option>
              <Option value="supplier">Supplier</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              {userRole === 'customer' ? renderCustomerFields() : renderSupplierFields()}
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{
              required: true,
              message: 'Please input your email!'
            }, {
              type: 'email',
              message: 'Please enter a valid email!'
            }]}>
                <Input prefix={<MailOutlined />} placeholder="Enter your email" />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{
              required: true,
              message: 'Please input your password!'
            }, {
              min: 6,
              message: 'Password must be at least 6 characters!'
            }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirm Password" dependencies={['password']} rules={[{
              required: true,
              message: 'Please confirm your password!'
            }, ({
              getFieldValue
            }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              }
            })]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 bg-amber-700 hover:bg-amber-800 rounded-lg text-lg font-medium">
              Register
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-700 font-medium">
              Sign in here
            </Link>
          </Text>
        </div>
      </Card>
      <Modal title="Terms and Conditions" open={termsModalVisible} onCancel={() => setTermsModalVisible(false)} footer={[<Button key="cancel" onClick={() => setTermsModalVisible(false)}>
            Cancel
          </Button>, <Button key="accept" type="primary" onClick={handleTermsAccept} className="bg-amber-700 hover:bg-amber-800">
            Accept and Register
          </Button>]} width={600}>
        <div className="max-h-96 overflow-y-auto">
          <Paragraph>
            <strong>TerraFlow Terms and Conditions</strong>
          </Paragraph>
          <Paragraph>
            By registering for a TerraFlow account, you agree to the following
            terms and conditions:
          </Paragraph>
          <Paragraph>
            1. <strong>Account Usage:</strong> You agree to use your account
            responsibly and not share your login credentials with others.
          </Paragraph>
          <Paragraph>
            2. <strong>Data Privacy:</strong> We respect your privacy and will
            protect your personal information in accordance with our Privacy
            Policy.
          </Paragraph>
          <Paragraph>
            3. <strong>Service Availability:</strong> We strive to maintain
            service availability but cannot guarantee 100% uptime.
          </Paragraph>
          <Paragraph>
            4. <strong>User Conduct:</strong> Users must conduct themselves
            professionally and respectfully when using our platform.
          </Paragraph>
          <Paragraph>
            5. <strong>Termination:</strong> We reserve the right to terminate
            accounts that violate these terms.
          </Paragraph>
          <Checkbox checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-4">
            I agree to the terms and conditions
          </Checkbox>
        </div>
      </Modal>
    </div>;
};