"use client";

import React, { useRef, useEffect, useCallback } from "react";

import { useCurrentModeMessages, useMessagingActions, useMessagingState } from "@/libs/messaging/store";

import { MessageBubble } from "./message-bubble";
import { useWebSocket } from "@/hooks/messaging/useWebSocket";

export const ChatBody: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useCurrentModeMessages();
  const { appendMessage } = useMessagingActions().message;


  // Receive Telegram Support Messages
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('Received WebSocket message:', message);
    appendMessage({
      id: crypto.randomUUID(),
      text: message.text || message,
      type: 'support',
      timestamp: Date.now(),
      status: 'received'
    });
  }, [appendMessage]);

  // Initialize WebSocket connection
  useWebSocket({ handleMessage: handleWebSocketMessage });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatBody = messagesEndRef.current.parentElement;

      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);

        return () => clearTimeout(timeoutId);
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-body" style={{ maxHeight: "100%" }}>
      {messages.map((message) => (
        <MessageBubble key={message.id} contentTestId={`message-item`} data-testid="message-item" message={message} />
      ))}


      <div ref={messagesEndRef} data-testid="messages-end" />
    </div>
  );
};
