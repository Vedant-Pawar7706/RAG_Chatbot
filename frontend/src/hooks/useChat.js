import { useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  clearKnowledgeBase,
  sendChatMessage,
  getHealthStatus,
} from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        '👋 Welcome to **RAG AI Assistant**! Upload your PDF, DOCX, or TXT documents to build a custom knowledge base, then ask any question grounded strictly in your files.',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [documents, setDocuments] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check health and load existing documents
  const loadInitialData = useCallback(async () => {
    try {
      const health = await getHealthStatus();
      setIsServerOnline(true);
      setTotalChunks(health.total_chunks || 0);

      const docsData = await getDocuments();
      setDocuments(docsData.documents || []);
      setTotalChunks(docsData.total_chunks || 0);
    } catch (err) {
      console.warn('Backend server check warning:', err.message);
      setIsServerOnline(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const clearNotifications = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleSendMessage = async (queryText) => {
    if (!queryText || !queryText.trim() || isLoading) return;

    clearNotifications();
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(queryText.trim());
      const botMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No response generated.',
        citations: response.citations || [],
        retrievedCount: response.retrieved_chunks_count || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Failed to get answer from server.'}`,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file) => {
    clearNotifications();
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setSuccessMessage(`Successfully uploaded and indexed "${res.filename}" (${res.chunks_indexed} chunks)`);
      await loadInitialData();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (filename) => {
    clearNotifications();
    try {
      const res = await deleteDocument(filename);
      setSuccessMessage(`Document "${filename}" removed.`);
      await loadInitialData();
    } catch (err) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  const handleClearKnowledgeBase = async () => {
    clearNotifications();
    setIsClearing(true);
    try {
      await clearKnowledgeBase();
      setSuccessMessage('Knowledge base cleared successfully.');
      setDocuments([]);
      setTotalChunks(0);
    } catch (err) {
      setError(err.message || 'Failed to clear knowledge base.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearChatHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist you with your documents?',
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return {
    messages,
    documents,
    totalChunks,
    isLoading,
    isUploading,
    isClearing,
    isServerOnline,
    error,
    successMessage,
    clearNotifications,
    sendMessage: handleSendMessage,
    uploadFile: handleUploadFile,
    deleteDocument: handleDeleteDocument,
    clearKnowledgeBase: handleClearKnowledgeBase,
    clearChatHistory: handleClearChatHistory,
    refreshData: loadInitialData,
  };
}
