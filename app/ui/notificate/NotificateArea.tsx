'use client'
import '@/app/ui/notificate/NotificateArea.css'
import { useNotificateArea } from '@/context/NotificateAreaContext';

export default function NotificateArea() {
    const {notification, index} = useNotificateArea();
    if (notification != "") return (
        <div key={index} className="NotificateArea fixed bottom-24 right-8 px-6 py-4 rounded-xl shadow-md">{notification}</div>
    );
}