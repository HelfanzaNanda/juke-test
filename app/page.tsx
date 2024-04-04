"use client"

import { useCategory } from "@/hooks/useCategory";
import { useProduct } from "@/hooks/useProduct";
import { Category, Product } from "@/types/product";
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, GetProp, Input, Layout, Menu, Modal, Select, Table, TableProps } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { useState } from "react";


type ColumnsType<T> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;



interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}


const getRandomuserParams = (params: TableParams) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
});

export default function Home() {





    // const [data, setData] = useState<Product[]>();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const { data, create, update, remove, find } = useProduct({ 
        swr : true,
        // limit : tableParams.pagination?.current,
        // offset : tableParams.pagination?.pageSize
    });

    const { data : categories } = useCategory({ 
        swr : true,
    });

    const { confirm } = Modal;


    const [form] = Form.useForm();
    const [modal, setModal] = useState(false);

    const [formType, setFormType] = useState<string | null>(null);

    const handleCreate = () => {
        setFormType('CREATE');
        form.resetFields();
        setModal(true);
    }
    const handleEdit = async (id : number) => {
        setFormType('EDIT');

        const data = await find(id);
        console.log('DATA : ', data);
        
        form.setFieldsValue({...data, categoryId : data.category.id});
        setModal(true);
    }
    const handleDelete = (id : number) => {
        confirm({
            title: 'Are you sure delete this data?',
            // icon: <ExclamationCircleFilled />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                await remove(id);
            },
            onCancel() {},
        });
    }
    const handleDetail = async (id : number) => {
        setFormType('DETAIL');

        const data = await find(id);
        form.setFieldsValue({...data, categoryId : data.category.id});
        setModal(true);

    }

    const handleCancel = async () => {
        setFormType(null);
        form.resetFields();
        setModal(false);

    }

    const handleSubmit = async () => {
        const fields = await form.validateFields();
        const params = {
            ...fields
        }
        const id = form.getFieldValue("id");
        formType == "EDIT" ? await update(id, params) : await create(params);
        setModal(false);
    }

    const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };


const columns: ColumnsType<any> = [
    {
        title: 'Title',
        dataIndex: 'title',
        width: '20%',
    },
    {
        title: 'Price',
        dataIndex: 'price',
    },
    {
        title: 'Description',
        dataIndex: 'description',
    },
    {
        title: 'Category',
        dataIndex: 'category',
        render : (val : Category) => val.name || '-'
    },
    {
        title: 'Action',
        key: 'operation',
        fixed: 'right',
        width: 100,
        render: (item : Product) => {
            return (
                <Dropdown
                    dropdownRender={() => (
                        <Menu className='min-w-[150px] rounded-md bg-white'>
                            {
                                <Menu.Item key={'edit'} icon={<EditOutlined />} onClick={() => handleEdit(item.id!!)}>
                                    Edit
                                </Menu.Item>
                            }
                            {
                                <Menu.Item key={'detail'} icon={<EyeOutlined />} onClick={() => handleDetail(item.id!!)}>
                                    Detail
                                </Menu.Item>
                            }
                            {
                                <Menu.Item key={'delete'} icon={<DeleteOutlined />} onClick={() => handleDelete(item.id!!)}>
                                    Delete
                                </Menu.Item>
                            }
                        </Menu>
                    )}
                placement="bottomLeft"
                trigger={["click"]}
            >
                <Button type="text" icon={<EllipsisOutlined />} />
            </Dropdown>
            )
        },
    }
];

    return (
        <Layout >
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" >
                    <span className="text-white">Helfanza Nanda Alfara</span>
                </div>
            </Header>
            <Content className="my-5 mx-5">
                <div className="flex justify-between mb-3">
                    <span className="font-semibold">Products</span>
                    <Button onClick={() => handleCreate()}>Create</Button>
                </div>
                <Table
                    columns={columns}
                    rowKey={(record) => record.id}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    // loading={loading}
                    onChange={handleTableChange}
                />

                <Modal open={modal} title={`${formType} Product`} 
                    onCancel={() => handleCancel()}
                    footer={[
                        <>
                            <Button onClick={() => handleCancel()} >Cancel</Button>,
                            {
                                formType != "DETAIL" &&
                                <Button onClick={() => handleSubmit()} >Submit</Button>
                            }
                        </>
                    ]}>
                    <Form form={form} disabled={formType == 'DETAIL'}>
                        <Form.Item name={'title'} label={'Title'} rules={[{required : true, message: 'this field is required'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item name={'price'} label={'Price'} rules={[{required : true, message: 'this field is required'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item name={'description'} label={'Desc'} rules={[{required : true, message: 'this field is required'}]}>
                            <Input/>
                        </Form.Item>

                        <Form.Item name={'categoryId'} label={'Category'} rules={[{required : true, message: 'this field is required'}]}>
                            <Select options={categories?.map(cat => ({ value : cat.id, label : cat.name }))}/>
                        </Form.Item>

                        <Form.Item label={"Images"}>
                            <Form.List name="images">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name }) => (
                                            <div className="flex items-start space-x-3">
                                                <Form.Item
                                                    className="w-11/12"
                                                    name={[name]}
                                                    rules={[{ required: true, message: 'this field is required' }]}>
                                                    <Input />
                                                </Form.Item>
                                                {
                                                    formType != "DETAIL" &&
                                                    <MinusCircleOutlined className="mt-2" onClick={() => remove(name)} />
                                                }
                                            </div>
                                        ))}
                                        {
                                            formType != "DETAIL" &&
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add
                                                </Button>
                                            </Form.Item>
                                        }
                                    </>
                                )}
                                </Form.List>
                        </Form.Item>

                    </Form>

                </Modal>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Helfanza Nanda Alfara
            </Footer>
        </Layout>
        
    );
}
