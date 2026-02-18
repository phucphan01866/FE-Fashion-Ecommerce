// 'use client'

// import { useContext, createContext, useState, useEffect } from "react";
// import { useNotificateArea } from "../NotificateAreaContext";


// interface OrderContextType {
    
// }

// const OrderContext = createContext<OrderContextType | undefined>(undefined);

// export function OrderProvider({ children }: { children: React.ReactNode }) {
//     const [state, setState] = useState();
//     const { setNotification } = useNotificateArea();
//     async function fetchOrderData() {
//         try {

//         } catch (error) {

//         }
//     }

//     useEffect(() => {
//         fetchOrderData();
//     }, []);

//     return (
//         <OrderContext.Provider value={{ state, setState }}>
//             {children}
//         </OrderContext.Provider>
//     );
// }

// export const useOrder = () => {
//     const context = useContext(OrderContext);
//     if (!context) {
//         throw new Error('useOrder must be used within OrderProvider');
//     }
//     return context;
// };