"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { Send, SmartToy, Person } from "@mui/icons-material";
import { useAuthStore } from "@/app/store/authStore";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUIStore } from "@/app/store/uiStore";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatProps {
  codeDiff: string;
  fileName?: string;
}

export default function Chat({ codeDiff, fileName }: ChatProps) {
  const { data: session } = useSession();
  const { accessToken: patToken } = useAuthStore();
  const { themeMode } = useUIStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userQuestion = inputValue.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // Prepare assistant message ID for later use
    const assistantMessageId = (Date.now() + 1).toString();

    try {
      // Prepare headers with authentication
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add PAT token if available
      if (patToken) {
        headers["Authorization"] = `Bearer ${patToken}`;
      }

      const response = await fetch("/api/review", {
        method: "POST",
        headers,
        body: JSON.stringify({
          codeDiff,
          userQuestion,
          fileName: fileName || "Unknown file",
          conversationHistory: messages, // Send current conversation history for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                // Create assistant message on first content chunk
                if (isFirstChunk) {
                  setIsLoading(false);
                  const assistantMessage: ChatMessage = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, assistantMessage]);
                  isFirstChunk = false;
                }

                accumulatedContent += content;

                // Update the assistant message with accumulated content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } catch (err) {
      setError("Failed to get AI response. Please try again.");
      console.error("Error sending message:", err);

      // Remove the assistant message on error (only if it was created)
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );
    } finally {
      // Only set loading to false if we haven't already done so during streaming
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SmartToy />
          AI Code Reviewer
        </Typography>
        {fileName && (
          <Typography variant="caption" color="text.secondary">
            Analyzing: {fileName}
          </Typography>
        )}
      </Box>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              p: 3,
            }}
          >
            <SmartToy sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ask me about this code!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              I can help you understand the changes, suggest improvements,
              identify potential issues, and answer questions about the code.
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem sx={{ alignItems: "flex-start" }}>
                  <Avatar
                    src={
                      message.role === "user" && session?.user?.image
                        ? session.user.image
                        : undefined
                    }
                    sx={{
                      bgcolor:
                        message.role === "user"
                          ? "primary.main"
                          : "secondary.main",
                      mr: 2,
                      mt: 0.5,
                    }}
                  >
                    {message.role === "user" ? <Person /> : <SmartToy />}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      message.role === "assistant" ? (
                        <Box
                          sx={{
                            "& p": { margin: "8px 0" },
                            "& pre": {
                              backgroundColor:
                                themeMode === "dark" ? "grey.800" : "grey.100",
                              color:
                                themeMode === "dark" ? "grey.100" : "grey.900",
                              padding: "8px",
                              borderRadius: "4px",
                              overflow: "auto",
                              fontSize: "0.875rem",
                              fontFamily:
                                "Monaco, Consolas, 'Courier New', monospace",
                            },
                            "& code": {
                              backgroundColor:
                                themeMode === "dark" ? "grey.800" : "grey.100",
                              color:
                                themeMode === "dark" ? "grey.100" : "grey.900",
                              padding: "2px 4px",
                              borderRadius: "2px",
                              fontSize: "0.875rem",
                              fontFamily:
                                "Monaco, Consolas, 'Courier New', monospace",
                            },
                            "& ul, & ol": { paddingLeft: "20px" },
                            "& li": { margin: "4px 0" },
                            "& h1, & h2, & h3, & h4, & h5, & h6": {
                              margin: "12px 0 8px 0",
                              fontWeight: "bold",
                            },
                            "& blockquote": {
                              borderLeft:
                                themeMode === "dark"
                                  ? "4px solid #555"
                                  : "4px solid #ddd",
                              paddingLeft: "16px",
                              margin: "8px 0",
                              fontStyle: "italic",
                            },
                            "& table": {
                              borderCollapse: "collapse",
                              width: "100%",
                              margin: "8px 0",
                            },
                            "& th, & td": {
                              border:
                                themeMode === "dark"
                                  ? "1px solid #555"
                                  : "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                            },
                            "& th": {
                              backgroundColor:
                                themeMode === "dark" ? "grey.800" : "grey.100",
                              fontWeight: "bold",
                            },
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {message.content}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}

            {isLoading && (
              <ListItem sx={{ alignItems: "flex-start" }}>
                <Avatar sx={{ bgcolor: "secondary.main", mr: 2, mt: 0.5 }}>
                  <SmartToy />
                </Avatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "medium" }}
                      >
                        AI Assistant
                      </Typography>
                      <CircularProgress size={16} />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask about the code changes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{ alignSelf: "flex-end" }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
