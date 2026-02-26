"use client";

import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { productService, TypeProduct } from "@/service/product.service";
import { usePublic } from "@/context/PublicContext";
import Link from "next/link";
import { desc, i, metadata } from "framer-motion/client";
import { Divider } from "../user/general/general";
import { SpinLoadingSkeleton } from "../general/skeletons/LoadingSkeleton";
import { useDebounce } from "@/hooks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_ENDPOINT = `${API_URL}/gemini/chat`;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  pre_content?: string;
  content: string;
  created_at?: string;
  metadata: AssistantMetadata | null;
}

interface AssistantMetadata {
  outfits?: {
    name?: string;
    description: string;
    why?: string;
    items: string[];                    // variant_id
    size_suggestions?: string[];        // theo đúng thứ tự items
  }[];
  items?: Accessory[];
  size_suggestions?: { variant_id: string; suggested_size: string }[];
  followUp?: { question: string; quickReplies: string[] };
  selected?: selectedProd;
  [key: string]: any;
}

interface FetchedProduct {
  product: TypeProduct | null;
  loading: boolean;
  error: string | null;
}

interface Accessory {
  category_id: string,
  category_name?: string | null,
  color?: string | null,
  created_at: string,
  image_url?: string | null,
  name: string,
  price: number,
  product_id: string,
  sold_qty?: number,
  stock_qty?: number,
  variant_id: string,
}

interface selectedProd {
  product_id: string,
  variant_id: string,
  name?: string,
  color?: string,
  price?: number,
}

export default function ChatBox({
  endpoint = `${API_ENDPOINT}`,
  title = "Tư vấn Luna",
  placeholder = "VD: Tư vấn cho tôi bộ quần áo công sở, tôi thích màu trắng.",
  userId,
}: {
  endpoint?: string;
  title?: string;
  placeholder?: string;
  userId?: string | number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const pageSize = 20;

  // const [fetchedProductList, setFetchedProductList] = useState<TypeProduct[]>([]);
  const [fetchedProductList, setFetchedProductList] = useState<Map<string, FetchedProduct>>(new Map());

  useEffect(() => {
    if (open && messages.length === 0) {
      const firstMsg: ChatMessage = {
        id: "initial",
        role: "assistant",
        content: "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?",
        metadata: null,
      }
      setMessages(prev => [...prev, firstMsg]);
    } else if (open && sessionId) {
      scrollToBottom();
    }
  }, [open, loading, sessionId]);

  const expandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandRef.current && !expandRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) { document.addEventListener('mousedown', handleClickOutside) };
    return () => { document.removeEventListener('mousedown', handleClickOutside) };
  }, [open]);

  // const startChatSession = async () => {
  //   try {
  //     let savedSessionId = localStorage.getItem("ai_chat_session_id");
  //     if (localStorage.getItem("ai_chat_session_id") === undefined || localStorage.getItem("ai_chat_session_id") === "undefined") {
  //       localStorage.removeItem("ai_chat_session_id");
  //       savedSessionId = null;
  //     }
  //     // localStorage.removeItem("ai_chat_session_id");
  //     console.log("Sử dụng sessionId: ", savedSessionId);

  //     const token = Cookies.get("accessToken");
  //     const res = await fetch(`${endpoint}/start`, {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         session_id: savedSessionId || undefined,
  //         loadMessages: true,
  //         messagesLimit: pageSize,
  //       }),
  //     });

  //     const data = await res.json();
  //     console.log("before restored: ", data);

  //     if (data.success) {
  //       console.log("Data response từ BE: ", data);
  //       setSessionId(data.sessionId);
  //       localStorage.setItem("ai_chat_session_id", data.sessionId);
  //       setHasMore(data.hasMore || false);
  //       setNextCursor(data.nextCursor || null);

  //       // Khôi phục lịch sử tin nhắn cũ (restore)
  //       if (data.messages && data.messages.length > 0) {
  //         const restored: ChatMessage[] = data.messages.map((m: any) => {
  //           const metadata = (m.metadata && m.metadata.size_suggestions && !m.metadata.outfits) ? {
  //             ...m.metadata,
  //             outfits: [{
  //               items: m.metadata.size_suggestions.map((s: any) => (s.variant_id)),
  //               size_suggestions: m.metadata.size_suggestions.map((s: any) => s.suggested_size),
  //             }]
  //           } : (m.metadata && m.metadata.selected) ? {
  //             ...m.metadata,
  //             items: [m.metadata.selected],
  //           } : m.metadata;
  //           const pre_content = (m.metadata && m.metadata.size_suggestions && !m.metadata.outfits) ? (() => {
  //             const messageLines = m.content.split(". ");
  //             return messageLines[0].split(": ")[0] + ":";
  //           })() :
  //             (m.metadata && m.metadata.selected) ? m.content
  //               : undefined;
  //           const content = (m.metadata && m.metadata.size_suggestions && !m.metadata.outfits) ? (() => {
  //             const messageLines = m.content.split(". ");
  //             return messageLines[messageLines.length - 1];
  //           })() :
  //             (m.metadata && m.metadata.selected) ? m.metadata.selected.description :
  //               m.content;
  //           return {
  //             id: crypto.randomUUID(),
  //             role: m.role,
  //             pre_content: pre_content || null,
  //             content: content,
  //             created_at: m.created_at,
  //             metadata: metadata || null,
  //           }
  //         });
  //         setMessages(restored);
  //         console.log("restored mgs: ", restored);
  //         // Fetch sản phẩm cho tin nhắn cũ
  //         const allIds = new Set<string>();
  //         restored.forEach((msg, index) => {
  //           msg.metadata?.outfits?.forEach(o => o.items.forEach(id => allIds.add(id)));
  //           msg.metadata?.size_suggestions?.forEach(s => allIds.add(s.variant_id));
  //         });
  //         if (allIds.size > 0) {
  //           fetchProductList(Array.from(allIds), "restore")
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     console.log("error resote: ", err);
  //     setMessages([
  //       {
  //         id: crypto.randomUUID(),
  //         role: "assistant",
  //         content: "Oops! Mình đang bận thử đồ, bạn thử lại sau ít phút nha!",
  //         metadata: null,
  //       },
  //     ]);
  //   } finally {
  //     // setLoadingMore(false);
  //     setLoading(false);
  //   }
  // };

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReachedBottomOnce = useRef(false);
  const isScrollToBottomRequested = useRef(false);
  const isLoadingMore = useRef(false);

  // Chủ động scroll xuống cuối
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (isScrollToBottomRequested.current === true) {
      scrollToBottom();
      isScrollToBottomRequested.current = false;
    }
  }, [fetchedProductList, messages]);

  // Lấy product từ list các tin nhắn cũ
  const fetchProductList = async (variantIds: string[], reason: string) => {
    const missing = variantIds.filter(id => !fetchedProductList.has(id));
    if (missing.length !== 0) {
      // Đánh dấu loading
      const newMap = new Map(fetchedProductList);
      missing.forEach(id => newMap.set(id, { product: null, loading: true, error: null }));
      setFetchedProductList(newMap);

      // Fetch song song
      const results = await Promise.allSettled(
        missing.map(id => productService.user.getProductFromVariant(id))
      );

      results.forEach((result, i) => {
        const id = missing[i];
        if (result.status === "fulfilled") {
          newMap.set(id, { product: result.value, loading: false, error: null });
        } else {
          newMap.set(id, { product: null, loading: false, error: "Load failed" });
        }
      });
      setFetchedProductList(new Map(newMap));
    };

    if (reason === "newmessage" || reason === "restore") {
      isScrollToBottomRequested.current = true;
    }
    if (reason === "loadmore") {
      isLoadingMore.current = false;
    }
  };

  // Gửi tin nhắn
  const handleSend = async (customInput?: string | null) => {
    const sendInput = customInput || input;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: sendInput.trim(),
      metadata: null,
    };
    setLoading(true);
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = customInput || input;
    setInput("");
    const body = JSON.stringify({
      message: currentInput,
      // session_id: sessionId || undefined,\
      session_id: null,
      userId,
    })
    setQuickReplies([]);

    // console.log("data sent: ", body);
    const token = Cookies.get("accessToken");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        credentials: "include",
        body
      });

      // Xử lý response sau khi nhận

      const data = await res.json();
      console.log("data : ", data);
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text,
        metadata: {},
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.log("lỗi là: ", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Lỗi kết nối! Bạn thử lại sau vài giây nha!",
          metadata: null,
        },
      ]);
    }
    finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) {
      return;
    };
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1500;
    if (isAtBottom && !hasReachedBottomOnce.current) {
      hasReachedBottomOnce.current = true;
    }

    const minScrollTop = 1200; //min mỗi message ~ 60px -> khoảng 20 message
    // console.log("In handleScroll: ", hasReachedBottomOnce.current, scrollTop < (minScrollTop), hasMore, !isLoadingMore.current);
  };

  // const debouncedHandleScroll = useDebounce(handleScroll, 150);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, nextCursor, sessionId]);
  return (
    <div ref={expandRef} className="fixed bottom-6 right-6 z-50">
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen(!open)}
        className="p-4 bg-orange-400 rounded-full shadow-xl hover:bg-orange-500 transition-all hover:scale-110"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      {/* Khung chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-20 right-0 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
              <h3 className="font-bold text-lg">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-orange-600 p-1.5 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tin nhắn */}
            <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-hidden p-4 space-y-4 bg-gray-50">
              {hasMore && (<SpinLoadingSkeleton customSpinnerCSS="!w-8 !h-8 !border-3" />)}
              {messages.map((m, index) => {
                // console.log("mst number: ", index);
                return (
                  <div id={`message-${m.id}`} key={`msg-` + m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-sm">{m.content}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={placeholder}
                  rows={2}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="p-3 bg-orange-500 rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all group"
                >
                  <Send className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-250 ease-in-out" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}

function OutfitBlock({
  outfit,
  fetchedProductList
}: {
  outfit: NonNullable<AssistantMetadata["outfits"]>[0];
  fetchedProductList: Map<string, FetchedProduct>;
}) {
  return (
    <div className="rounded-xl outline-2 outline-gray-200 p-2 flex flex-col gap-4">
      {/* {outfit.name && <p className="font-bold text-orange-600 mb-3">{outfit.name}</p>} */}
      <div className="">
        {outfit.items.map((variantId, i) => {
          const entry = fetchedProductList.get(variantId);
          const product = entry?.product;
          const variant = product?.variants?.find(v => v.id === variantId);
          const size = outfit.size_suggestions?.[i];

          if (!product || !variant) {
            return <div key={variantId} className="text-xs text-gray-400">Đang tải...</div>;
          }

          const imgUrl = typeof variant.images?.[0] === "string"
            ? variant.images[0] : variant.images?.[0] || "/placeholder.jpg";

          return (
            <div key={variantId} className="flex flex-col items-center">
              <OutfitItem id={product.id} imgUrl={imgUrl} name={product.name} size={size} color_name={variant.color_name} />
              {i < outfit.items.length - 1 && <span className="text-2xl text-gray-800">+</span>}
            </div>
          );
        })}
      </div>
      {outfit.description && (
        <>
          <Divider />
          <p className="fontA5 text-gray-500">{outfit.why}</p>
        </>
      )}
    </div>
  );
}

function OutfitItem({ id, imgUrl, name, size, color_name, type = "outfit" }: { id: string, imgUrl?: string, name: string, size?: string, color_name?: string, type?: "outfit" | "accessory" }) {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-xl hover:bg-gray-200 hover:shadow-sm transition-all ease-in-out">
      <Link href={`/product/${id}`} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
        <Image src={imgUrl || "/"} alt={name} width={64} height={64} className="object-cover" />
      </Link>
      <div className="flex-1 flex flex-col gap-1">
        <Link href={`/product/${id}`} className="font-medium text-sm">{name}{type === "accessory" && color_name && (` (Màu ${color_name.toLocaleLowerCase()})`)}</Link>
        {type === "outfit" && (
          <p className="fontA6 text-gray-600 ">
            {size ? (`Size: ${size}`) : ""}
            {size && color_name && " • "}
            {color_name && (`Màu: ${color_name}`)}
          </p>
        )}
      </div>
    </div>
  )
}