'use client';

import styles from "@/styles/GarageManagement.module.scss";
import VehicleCard from "./VehicleCard";
import { ConfigProvider, Select } from "antd";
import { useEffect, useState } from "react";
import AddButton from "./AddButton";
import DeleteButton from "./DeleteButton";

interface options {
    value: number,
    label: string
}
export default function GarageManagement() {
    /* fetch data here
    data includes: number of car parking spots available, 
    number of motorbike parking spots available, current level, cars and motorbikes parked in the current level
    */
    const [level, setLevel] = useState(0);
    const [slots, setSlots] = useState([]);
    let [levels, setLevels] = useState<options[]>([]);

    useEffect(() => {
        const fetchdata = async () => {
            if (level === 0) {
                return;
            }
            try {
                const domain = 'http://127.0.0.1:5000/list';
                const querystring = domain.concat('?level-id=', level.toString());
                const res = await fetch(querystring, { method: 'GET' });
                const temp_data = await res.json();
                setSlots(temp_data);
            }
            catch (err) {
                console.log(err);
            }
        }
        fetchdata();
    }, [level]);
    useEffect(() => {
        const fetchlevel = async () => {
            try {
                const domain = 'http://127.0.0.1:5000/levels';
                const res = await fetch(domain, { method: 'GET' });
                const temp_data = await res.json();
                console.log(temp_data)
                const temp_levels = temp_data.map((level: [any]) => {
                    return { value: level[0], label: `level ${level[0]}` };
                });
                setLevels(temp_levels);
            }
            catch (err) {
                console.log(err);
            }
        }
        fetchlevel();
    }, []);

    const carData = slots.filter((slot) => slot[3] === true);
    const motorbikeData = slots.filter((slot) => slot[3] === false);
    const carSlots = carData.map((slot) => {
        if (slot[2] !== null) {
            return <VehicleCard key={slot[0]} plot={slot[0]} vehicle="car" date={slot[4]} plate={slot[2]} />
        }
        else {
            return <VehicleCard key={slot[0]} plot={slot[0]} vehicle="car" />
        }

    });
    const motorbikeSlots = motorbikeData.map((slot) => {
        if (slot[2] !== null) {
            return <VehicleCard key={slot[0]} plot={slot[0]} vehicle="motorbike" date={slot[4]} plate={slot[2]} />
        }
        else {
            return <VehicleCard key={slot[0]} plot={slot[0]} vehicle="motorbike" />
        }
    });
    const freeCarSlots = carData.filter((slot) => slot[2] === null).length;
    const freeMotorbikeSlots = motorbikeData.filter((slot) => slot[2] === null).length;

    return (
        <div className={styles.wrapper}>
            <div className={styles.garageVisual}>
                <div >
                    <div>Car parking spots available: {freeCarSlots}</div>
                    <div className={styles.vehicleSlots}>
                        {carSlots}
                    </div>
                </div>
                <div >
                    <div>Motorbike parking spots available: {freeMotorbikeSlots}</div>
                    <div className={styles.vehicleSlots}>
                        {motorbikeSlots}
                    </div>
                </div>
            </div>

            <div className={styles.controller}>
                <div>
                    Current level
                    <ConfigProvider theme={{
                        "components": {
                            "Select": {
                                "colorBorder": "rgb(46, 46, 46)"
                            }
                        }
                    }}>
                        <Select options={levels} onChange={(e) => setLevel(e)} />
                    </ConfigProvider>
                </div>
                <AddButton text="Add a new vehicle" type="vehicle" setSlots={setSlots} level={level} />
                <DeleteButton text="Remove a vehicle" type="vehicle" setSlots={setSlots} level={level} />
            </div>
        </div>)
}