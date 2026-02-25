'use client';

import { useAuth } from "@/context/AuthContext";
import ChatBox from "../chat-component/chatbox_react_component_next";

// export function ChatBoxArea() {
//     const {user} = useAuth();
//     if (user) {
//         return <ChatBox />;
//     } else {
//         return null;
//     }
// }
export function ChatBoxArea() {
    return <ChatBox />;
}