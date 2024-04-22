'use client';

import { Button, Checkbox, ConfigProvider, Input, Modal } from "antd";
import { SetStateAction, useState } from "react";

export default function AddButton(props: { text: string, type: string, setSlots: React.Dispatch<SetStateAction<any>>, level: number }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [vehicleType, setVehicleType] = useState(false);
    const [carSlots, setCarSlots] = useState('');
    const [motorbikeSlots, setMotorbikeSlots] = useState('');

    const addData = async () => {
        try {
            const domain = 'http://127.0.0.1:5000/slot/add';
            const data = { plate: value, type: vehicleType };
            fetch(domain, {
                method: 'PUT',
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
    const addLevel = async () => {
        try {
            const domain = 'http://127.0.0.1:5000/levels/add';
            const data = { level_id: value, total_car_slots: carSlots, total_motorbike_slots: motorbikeSlots };
            fetch(domain, {
                method: 'PUT',
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

    const showModal = () => {
        setOpen(true);
    }
    const handleOk = () => {
        if (props.type === "vehicle") {
            if (value === '') {
                return;
            }
            else {
                addData();
            }
        }
        else if (props.type === "level") {
            if (value === '' || carSlots === '' || motorbikeSlots === '') {
                return;
            }
            else {
                addLevel();
            }
        }
        setOpen(false);
    }
    const handleCancel = () => {
        setOpen(false);
    }

    return (
        <ConfigProvider theme={{
            "components": {
                "Button": {
                    "colorPrimary": "#009B06",
                    "colorPrimaryHover": "#1ACD21",
                    "fontSize": 22,
                    "paddingInline": 30,
                    "controlHeight": 60
                },
                "Checkbox": {
                    "fontSize": 20
                }
            }
        }}>
            <Button onClick={showModal} type="primary">{props.text}</Button>
            <Modal title={props.text} open={open} onOk={handleOk} onCancel={handleCancel}>
                {props.type === "vehicle" &&
                    <>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter vehicle plate number" />
                        <Checkbox onChange={(e) => { setVehicleType(e.target.checked) }}>Is the vehicle a car?</Checkbox>
                    </>
                }
                {props.type === "level" &&
                    <div style={{display:'flex',flexDirection:'column',gap:'15px'}}>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter level id" />
                        <Input value={carSlots} onChange={(e) => setCarSlots(e.target.value)} placeholder="Enter total car slots" />
                        <Input value={motorbikeSlots} onChange={(e) => setMotorbikeSlots(e.target.value)} placeholder="Enter total motorbike slots" />
                    </div>
                }
            </Modal>
        </ConfigProvider>
    )
}