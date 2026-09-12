import { useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  clearKnowledgeBase,
  sendChatMessage,
  getHealthStatus,
} from '../services/api';

const createDefaultMessage = () => ({
  id: `welcome-${Date.now()}`,
  role: 'assistant',
  content:
    '👋 Welcome to **DocMind AI**! Upload your PDF, DOCX, or TXT documents to build a custom knowledge base, then ask any question grounded strictly in your files.',
  citations: [],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

const createInitialSession = () => ({
  id: `session-${Date.now()}`,
  title: 'Document Analysis',
  createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  messages: [createDefaultMessage()],
});

export function useChat() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('docmind_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse saved chat sessions:', e);
    }
    return [createInitialSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  const [persona, setPersona] = useState('analyst');
  const [documents, setDocuments] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('docmind_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [sessions]);

  // Current session object
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

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
    const interval = setInterval(() => {
      loadInitialData();
    }, isServerOnline ? 20000 : 4000);
    return () => clearInterval(interval);
  }, [loadInitialData, isServerOnline]);

  const clearNotifications = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // --- Session Management ---
  const handleCreateNewSession = (customTitle) => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: customTitle || `Chat Thread ${sessions.length + 1}`,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      messages: [createDefaultMessage()],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const handleSwitchSession = (sessionId) => {
    if (sessions.some((s) => s.id === sessionId)) {
      setCurrentSessionId(sessionId);
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (sessions.length <= 1) {
      // Reset single remaining session
      const fresh = [createInitialSession()];
      setSessions(fresh);
      setCurrentSessionId(fresh[0].id);
      return;
    }
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const handleRenameSession = (sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() } : s))
    );
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

    // Update active session messages
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          // Auto-title session if it's using the default title
          const shouldUpdateTitle = s.messages.length <= 1 && s.title.startsWith('Document Analysis');
          const autoTitle = shouldUpdateTitle
            ? queryText.trim().slice(0, 26) + (queryText.length > 26 ? '...' : '')
            : s.title;
          return {
            ...s,
            title: autoTitle,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const response = await sendChatMessage(queryText.trim(), persona);
      const botMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No response generated.',
        citations: response.citations || [],
        retrievedCount: response.retrieved_chunks_count || 0,
        persona: persona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: [...s.messages, botMsg] } : s
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to send message.');
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Failed to get answer from server.'}`,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
        )
      );
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
      await deleteDocument(filename);
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
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [
                {
                  id: `welcome-${Date.now()}`,
                  role: 'assistant',
                  content: 'Conversation cleared. Ask any question grounded in your documents.',
                  citations: [],
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : s
      )
    );
  };

  // Export session data with multi-format and scope support
  const exportSession = (format = 'markdown', targetSessionId = null, scope = 'current') => {
    // Determine which sessions to include
    let targetSessions = [];
    if (scope === 'all') {
      targetSessions = sessions;
    } else {
      const targetId = targetSessionId || currentSessionId;
      const found = sessions.find((s) => s.id === targetId) || currentSession;
      targetSessions = found ? [found] : [];
    }

    if (!targetSessions.length) return '';

    const exportTimestamp = new Date().toLocaleString();

    // 1. JSON Format
    if (format === 'json') {
      const payload = {
        application: 'DocMind AI',
        exported_at: exportTimestamp,
        persona: persona,
        scope: scope,
        total_sessions: targetSessions.length,
        sessions: targetSessions.map((s) => ({
          id: s.id,
          title: s.title,
          created_at: s.createdAt,
          messages_count: s.messages.length,
          messages: s.messages.map((m) => ({
            id: m.id,
            role: m.role,
            persona: m.persona || (m.role === 'assistant' ? persona : null),
            timestamp: m.timestamp,
            content: m.content,
            citations: m.citations || [],
          })),
        })),
      };
      return JSON.stringify(payload, null, 2);
    }

    // 2. Plain Text Format
    if (format === 'text') {
      const divider = '================================================================================';
      const subDivider = '--------------------------------------------------------------------------------';
      const lines = [
        divider,
        `DOCMIND AI - CHAT CONVERSATION TRANSCRIPT`,
        `Exported On: ${exportTimestamp}`,
        `Active Persona: ${persona.toUpperCase()}`,
        `Threads Included: ${targetSessions.length}`,
        divider,
        '',
      ];

      targetSessions.forEach((s, sIdx) => {
        lines.push(`THREAD [${sIdx + 1}/${targetSessions.length}]: ${s.title}`);
        lines.push(`Created: ${s.createdAt || 'N/A'} | ID: ${s.id}`);
        lines.push(subDivider);
        lines.push('');

        s.messages.forEach((m) => {
          const speaker = m.role === 'user' ? 'USER' : `DOCMIND AI (${m.persona || persona})`;
          lines.push(`[${m.timestamp}] ${speaker}:`);
          lines.push(m.content);
          if (m.citations && m.citations.length > 0) {
            lines.push('');
            lines.push('  Sources:');
            m.citations.forEach((c, idx) => {
              lines.push(`  - [Source ${idx + 1}] ${c.source}${c.page ? ` (Page ${c.page})` : ''} - Match: ${(c.score * 100).toFixed(1)}%`);
            });
          }
          lines.push('');
        });

        lines.push(subDivider);
        lines.push('');
      });

      return lines.join('\n');
    }

    // 3. CSV Format (RFC 4180)
    if (format === 'csv') {
      const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      const lines = [
        ['Session ID', 'Session Title', 'Timestamp', 'Role', 'Persona', 'Message', 'Citations']
          .map(escapeCsv)
          .join(','),
      ];

      targetSessions.forEach((s) => {
        s.messages.forEach((m) => {
          const citationsStr = (m.citations || [])
            .map((c) => `${c.source}${c.page ? ` (p.${c.page})` : ''} [${(c.score * 100).toFixed(0)}%]`)
            .join('; ');
          lines.push(
            [
              s.id,
              s.title,
              m.timestamp,
              m.role,
              m.persona || (m.role === 'assistant' ? persona : ''),
              m.content,
              citationsStr,
            ]
              .map(escapeCsv)
              .join(',')
          );
        });
      });

      return lines.join('\r\n');
    }

    // 4. HTML Standalone Document (Print / Save as PDF ready)
    if (format === 'html') {
      const sessionsHtml = targetSessions
        .map(
          (s) => `
        <section class="thread-section">
          <div class="thread-header">
            <h2>${escapeHtml(s.title)}</h2>
            <span class="meta">${escapeHtml(s.createdAt || '')} &bull; ${s.messages.length} messages</span>
          </div>
          <div class="messages-flow">
            ${s.messages
              .map(
                (m) => `
              <div class="msg-card ${m.role === 'user' ? 'user-msg' : 'bot-msg'}">
                <div class="msg-header">
                  <strong>${m.role === 'user' ? '👤 User' : '🤖 DocMind AI'}</strong>
                  <span class="timestamp">${escapeHtml(m.timestamp)}</span>
                </div>
                <div class="msg-body">${escapeHtml(m.content).replace(/\n/g, '<br/>')}</div>
                ${
                  m.citations && m.citations.length > 0
                    ? `
                  <div class="citations-box">
                    <span class="cite-title">📚 Citations:</span>
                    <ul>
                      ${m.citations
                        .map(
                          (c) => `
                        <li>
                          <strong>${escapeHtml(c.source)}</strong>
                          ${c.page ? `<span>(Page ${c.page})</span>` : ''}
                          <span class="score">${(c.score * 100).toFixed(1)}% match</span>
                        </li>
                      `
                        )
                        .join('')}
                    </ul>
                  </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
        )
        .join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DocMind AI Chat Export - ${escapeHtml(targetSessions[0]?.title || 'Conversation')}</title>
  <style>
    :root {
      --bg: #061912;
      --card-bg: rgba(6, 44, 30, 0.7);
      --border: rgba(16, 185, 129, 0.25);
      --text: #ecfdf5;
      --text-muted: #6ee7b7;
      --accent: #10b981;
      --user-bg: #047857;
    }
    @media print {
      body { background: #fff !important; color: #111 !important; font-size: 11pt; }
      .msg-card { border: 1px solid #ccc !important; background: #fafafa !important; color: #111 !important; break-inside: avoid; }
      .user-msg { background: #f0fdf4 !important; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; line-height: 1.5; }
    .export-container { max-width: 860px; margin: 0 auto; }
    .banner { border-bottom: 2px solid var(--border); padding-bottom: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .banner h1 { font-size: 1.6rem; color: #a7f3d0; font-weight: 800; }
    .banner .sub { font-size: 0.85rem; color: var(--text-muted); }
    .thread-section { margin-bottom: 2.5rem; }
    .thread-header { margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border); }
    .thread-header h2 { font-size: 1.25rem; color: #ecfdf5; }
    .thread-header .meta { font-size: 0.8rem; color: var(--text-muted); }
    .messages-flow { display: flex; flex-direction: column; gap: 1rem; }
    .msg-card { padding: 1rem 1.25rem; border-radius: 1rem; border: 1px solid var(--border); background: var(--card-bg); }
    .user-msg { background: var(--user-bg); border-color: rgba(52, 211, 153, 0.4); }
    .msg-header { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.85; }
    .msg-body { font-size: 0.92rem; white-space: pre-wrap; word-break: break-word; }
    .citations-box { margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; }
    .cite-title { font-weight: bold; color: #a7f3d0; }
    .citations-box ul { list-style: none; padding-left: 0.5rem; margin-top: 0.25rem; }
    .citations-box li { margin-bottom: 0.2rem; }
    .citations-box .score { background: rgba(16,185,129,0.2); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.3rem; }
    .footer { text-align: center; margin-top: 3rem; font-size: 0.75rem; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="export-container">
    <header class="banner">
      <div>
        <h1>DocMind AI Analysis Report</h1>
        <div class="sub">Grounding Documents &bull; Google Gemini Intelligence</div>
      </div>
      <div class="sub" style="text-align: right;">
        <div>Exported: ${escapeHtml(exportTimestamp)}</div>
        <div>Persona: ${escapeHtml(persona.toUpperCase())}</div>
      </div>
    </header>

    ${sessionsHtml}

    <footer class="footer">
      Generated with DocMind AI &bull; Retrieval-Augmented Generation (RAG) System
    </footer>
  </div>
</body>
</html>`;
    }

    // 5. Default Markdown Format (.md)
    const lines = [
      `# DocMind AI Analysis Report: ${targetSessions.map((s) => s.title).join(' | ')}`,
      `**Exported On:** ${exportTimestamp} | **Active Persona:** ${persona.toUpperCase()} | **Threads:** ${targetSessions.length}`,
      `\n---\n`,
    ];

    targetSessions.forEach((s, sIdx) => {
      if (targetSessions.length > 1) {
        lines.push(`## Thread ${sIdx + 1}: ${s.title}`);
        lines.push(`*Created: ${s.createdAt || 'N/A'}*\n`);
      }

      s.messages.forEach((m) => {
        const speaker = m.role === 'user' ? '### 👤 User' : `### 🤖 DocMind AI ${m.persona ? `(${m.persona})` : ''}`;
        lines.push(`${speaker} *(${m.timestamp})*\n`);
        lines.push(`${m.content}\n`);
        if (m.citations && m.citations.length > 0) {
          lines.push(`**Sources Referenced:**`);
          m.citations.forEach((c, idx) => {
            lines.push(
              `- **[Source ${idx + 1}]** \`${c.source}\` ${c.page ? `*(Page ${c.page})*` : ''} — Match: **${(c.score * 100).toFixed(1)}%**`
            );
          });
          lines.push('');
        }
        lines.push(`---\n`);
      });
    });

    return lines.join('\n');
  };

  // Helper to escape HTML safely
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    messages,
    sessions,
    currentSessionId,
    currentSession,
    persona,
    setPersona,
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
    createNewSession: handleCreateNewSession,
    switchSession: handleSwitchSession,
    deleteSession: handleDeleteSession,
    renameSession: handleRenameSession,
    exportSession,
  };
}
