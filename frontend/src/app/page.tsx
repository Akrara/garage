'use client';
import GarageEditor from "@/components/GarageEditor";
import styles from "./page.module.css";
import GarageManagement from "@/components/GarageManagement";
import Nav from "@/components/Nav";
import { useState } from "react";
import VehicleFinder from "@/components/vehicleFinder";

export default function Home() {
  const [tab, setTab] = useState(1);
  
  return (
    <main className={styles.main}>
      <Nav tab={tab} setTab={setTab} />
      {tab === 1 && <GarageManagement />}
      {tab === 2 && <VehicleFinder />}
      {tab === 3 && <GarageEditor />}
    </main>
  );
}
