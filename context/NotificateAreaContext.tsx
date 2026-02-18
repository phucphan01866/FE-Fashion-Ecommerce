'use client'
import { createContext, useContext, useEffect, useState } from "react";

interface NotificateAreaType {
    notification: string,
    setNotification: (text: string) => void,
    index: number;
}

const NotificateAreaContext = createContext<NotificateAreaType | undefined>(undefined);

export default function NotificateAreaProvider({ children }: { children: React.ReactNode }) {
    const [notification, setNoti] = useState<string>('');
    const [index, setIndex] = useState(0);
    function setNotification(text: string){
        setNoti(text);
        setIndex(prev => prev + 1);
    }
    return (
        <NotificateAreaContext.Provider value={{ index, notification, setNotification }}>
            {children}
        </NotificateAreaContext.Provider>
    )
}

export function useNotificateArea() {
    const context = useContext(NotificateAreaContext);
    if (!context) throw new Error('useNotificateArea must be used within NotificateAreaProvider');
    return context;
}