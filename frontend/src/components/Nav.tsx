'use client';

import styles from "@/styles/Nav.module.scss";
import clsx from "clsx";

export default function Nav(props: { tab: number, setTab: (tab: number) => void}) {
    return (
        <nav className={styles.navBar}>
            <div className={clsx(props.tab===1 && styles.activeTab)} onClick={()=>props.setTab(1)}>
                Garage management
            </div>
            <div className={clsx(props.tab===2 && styles.activeTab)} onClick={()=>props.setTab(2)}>
                Vehicle Finder
            </div>
            <div className={clsx(props.tab===3 && styles.activeTab)} onClick={()=>props.setTab(3)}>
                Garage editor
            </div>
        </nav>
    )
}