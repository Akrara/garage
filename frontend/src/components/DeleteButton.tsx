'use client';

import { Button, ConfigProvider, Input, Modal } from "antd";
import { SetStateAction, useState } from "react";

export default function DeleteButton(props: { text: string, type: string, setSlots: React.Dispatch<SetStateAction<any>>, level: number }) {
    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [remaining, setRemaining] = useState<any[]>([]);
    const deleteData = async () => {
        try {
            const domain = 'http://127.0.0.1:5000/slot/delete';
            const data = { plate: value };
            fetch(domain, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then((res) => {
                const fetchdata = async () => {
                    try {
                        const domain = 'http://127.0.0.1:5000/list';
                        const querystring = domain.concat('?level-id=', props.level.toString());
                        const res = await fetch(querystring, { method: 'GET' });
                        const temp_data = await res.json();
                        props.setSlots(temp_data);
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                fetchdata();
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    const deleteLevel = async () => {
        try {
            setRemaining([]);
            const domain = 'http://127.0.0.1:5000/levels/delete';
            const data = { level_id: value };
            fetch(domain, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then((res) => {
                const fetchdata = async () => {
                    try {
                        const domain = 'http://127.0.0.1:5000/levels/all';
                        const res = await fetch(domain, { method: 'GET' });
                        const temp_data = await res.json();
                        const dat = temp_data.map((data: any[]) => {
                            const temp_source = {
                                key: data[0],
                                level_id: data[0],
                                total_car_slots: data[1],
                                total_motorbike_slots: data[2]
                            }
                            return temp_source;
                        })
                        props.setSlots(dat);
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                fetchdata();
            });
        }
        catch (err) {
            console.log(err);
        }
    }

    const checkRemaining = async () => {
        const test = 'http://127.0.0.1:5000/level/remains';
        const querystring = test.concat('?level-id=', value);
        const test_res = await fetch(querystring, { method: 'GET' });
        const temp_data = await test_res.json();
        console.log(temp_data);
        if (temp_data.length > 0) {
            for (let i = 0; i < temp_data.length; i++) {
                setRemaining(prev=>[...prev, temp_data[i][0]]);
            }
            setOpenConfirm(true);
        }
        else {
            deleteLevel();
        }
    }

    const showModal = () => {
        setOpen(true);
    }
    const handleOk = () => {

        if (props.type === "vehicle") {
            if (value === '') {
                return;
            }
            else {
                deleteData();;
            }
        }
        else if (props.type === "level") {
            if (value === '') {
                return;
            }
            else {
                checkRemaining();
            }
        }
        setOpen(false);
    }
    const handleCancel = () => {
        setOpen(false);
    }
    const handleOkConfirm = () => {
        setOpenConfirm(false);
        setOpen(false);
        deleteLevel();
    }
    const handleCancelConfirm = () => {
        setRemaining([]);
        setOpenConfirm(false);
        setOpen(false);
    }

    return (
        <ConfigProvider theme={{
            "components": {
                "Button": {
                    "colorPrimary": "#FA0101",
                    "colorPrimaryHover": "#FF5C5C",
                    "fontSize": 22,
                    "paddingInline": 30,
                    "controlHeight": 60
                }
            }
        }}>
            <Button onClick={showModal} type="primary">{props.text}</Button>
            <Modal title={props.text} open={open} onOk={handleOk} onCancel={handleCancel}>
                {props.type === "vehicle" &&
                    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter vehicle plate number" />
                }
                {props.type === "level" &&
                    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter level id" />
                }
            </Modal>
            <ConfigProvider theme={{
                "components": {
                    "Modal": {
                        "titleColor": "rgb(255, 0, 0)",
                        "fontSize": 18,
                        "titleFontSize": 24
                    }
                }
            }}>
                <Modal title={"Warning"} open={openConfirm} onOk={handleOkConfirm} onCancel={handleCancelConfirm}>
                    Warning, there are still vehicles registered in this level. Removing this level will also remove all vehicles in this level. Are you sure you want to proceed?
                    Vehicles remaining: <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>{remaining.map(plate=> <div key={plate}>{plate}</div>)}</div>
                </Modal>
            </ConfigProvider>
        </ConfigProvider>
    )
}