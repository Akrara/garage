'use client';

import { ConfigProvider, Table } from "antd";
import { useEffect, useState } from "react";
import AddButton from "./AddButton";
import DeleteButton from "./DeleteButton";
import styles from "@/styles/GarageEditor.module.scss";

export default function GarageEditor() {
    const [source, setSource] = useState([]);
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const domain = 'http://127.0.0.1:5000/levels/all';
                const res = await fetch(domain, { method: 'GET' });
                const temp_data = await res.json();
                const dat = temp_data.map((data:any[]) => {
                    const temp_source ={
                        key: data[0],
                        level_id: data[0],
                        total_car_slots: data[1],
                        total_motorbike_slots: data[2]
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
    const columns = [
        {
            title: "Level ID",
            dataIndex: "level_id",
            key: "level_id"
        },
        {
            title: "Total parking slots for car",
            dataIndex: "total_car_slots",
            key: "total_car_slots"
        },
        {
            title: "Total parking slots for motorbike",
            dataIndex: "total_motorbike_slots",
            key: "total_motorbike_slots"
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
                <Table dataSource={source} columns={columns} pagination={{hideOnSinglePage:true, pageSize:10, responsive:true}} scroll={{y:400}}/>
            </ConfigProvider>
            <AddButton text="Add level" type="level" setSlots={setSource} level={1}/>
            <DeleteButton text="Delete level" type="level" setSlots={setSource} level={1}/>
        </div>
    )
}