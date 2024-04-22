'use client';
import styles from "@/styles/VehicleFinder.module.scss";
import { Button, ConfigProvider, Input, Space, Table } from "antd";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { useEffect, useRef, useState } from "react";
import { SearchOutlined } from '@ant-design/icons';
import { FilterOutlined } from '@ant-design/icons';
interface DataType {
    key: string,
    plate: string,
    vehicle_type: string,
    park_date: string,
    slot_id: string,
    level_id: number
}
type DataIndex = keyof DataType;
export default function VehicleFinder() {
    const [source, setSource] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const domain = 'http://127.0.0.1:5000/vehicles/all';
                const res = await fetch(domain, { method: 'GET' });
                const temp_data = await res.json();
                const dat = temp_data.map((data: any[]) => {
                    const temp_source = {
                        key: data[0],
                        plate: data[0],
                        vehicle_type: data[1] === true ? 'Car' : 'Motorbike',
                        park_date: data[2],
                        slot_id: data[3],
                        level_id: data[4]
                    }
                    return temp_source;
                })
                setSource(dat);
            }
            catch (err) {
                console.log(err);
            }
        }
        fetchdata();
    }, [])

    const customSort = (a: any, b: any) => {
        const strA = a.slot_id;
        const strB = b.slot_id;
        const splitA = strA.split('-');
        const splitB = strB.split('-');

        // Convert parts to integers
        const intA1 = parseInt(splitA[0], 10);
        const intA2 = parseInt(splitA[1], 10);
        const intA3 = splitA[2];

        const intB1 = parseInt(splitB[0], 10);
        const intB2 = parseInt(splitB[1], 10);
        const intB3 = splitB[2];

        // Compare parts
        if (intA1 !== intB1) {
            return intA1 - intB1;
        }
        if (intA2 !== intB2) {
            return intA2 - intB2;
        }
        // Use localeCompare for string comparison
        return intA3.localeCompare(intB3);
    }
    const customSortDate = (a: any, b: any) => {
        return new Date(a.park_date).getTime() - new Date(b.park_date).getTime();
    }

    const handleSearch =(selectedKeys: any, confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    }
    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
        
      };
      const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
          <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
              ref={searchInput}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                close
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#0958d9' : 'black',fontSize:18 }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
        render: (text) =>
          searchedColumn === dataIndex ? (<>{text}</>) : (text),
      });

    const columns:TableColumnsType<DataType> = [
        {
            title: "Plate number",
            dataIndex: "plate",
            key: "plate",
            ...getColumnSearchProps('plate')
        },
        {
            title: "Vehicle type",
            dataIndex: "vehicle_type",
            key: "vehicle_type",
            filters: [
                { text: 'Car', value: 'Car' },
                { text: 'Motorbike', value: 'Motorbike' }
            ],
            onFilter: (value, record) => record.vehicle_type.indexOf(value as string) === 0,
            sorter: (a: any, b: any) => a.vehicle_type.localeCompare(b.vehicle_type),
            filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? '#0958d9' : "black", fontSize:18 }} />
        },
        {
            title: "Enter date",
            dataIndex: "park_date",
            key: "park_date",
            ...getColumnSearchProps('park_date'),
            sorter: (a: any, b: any) => customSortDate(a,b)
        },
        {
            title: "Slot ID",
            dataIndex: "slot_id",
            key: "slot_id",
            defaultSortOrder: 'ascend',
            sorter: (a: any, b: any) => customSort(a,b)
        },
        {
            title: "Level ID",
            dataIndex: "level_id",
            key: "level_id",
            sorter: (a: any, b: any) => a.level_id - b.level_id
        }
    ]

    return (
        <div className={styles.wrapper}>
            <ConfigProvider theme={{
                "components": {
                    "Table": {
                        "borderColor": "rgb(103, 103, 103)",
                        "headerBg": "#ceffd4",
                        "colorBgContainer":"#f3fff6",
                        "bodySortBg":"#9fffb9",
                        "headerSortActiveBg":"#9fffb9",
                        "headerSortHoverBg":"#9fffb9",
                        "headerSplitColor":"#474747",
                        "rowHoverBg":"#86ffec",
                        "fontSize":16
                    }
                }
            }}>
                <Table dataSource={source} columns={columns} pagination={{ hideOnSinglePage: true, pageSize: 10, responsive: true }} scroll={{ y: 400 }} />
            </ConfigProvider>
        </div>
    )
}