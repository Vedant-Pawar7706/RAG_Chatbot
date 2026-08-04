# Production-Ready RAG Chatbot

An intelligent, production-ready Retrieval-Augmented Generation (RAG) Chatbot application built with **FastAPI**, **FAISS Vector Store**, **Sentence Transformers**, **Google Gemini 2.5 Flash**, and **React + Vite + Tailwind CSS**.

![Architecture Diagram](https://img.shields.io/badge/Stack-FastAPI%20%7C%20FAISS%20%7C%20Gemini%202.5%20Flash%20%7C%20React%2018-blue)

---

## 🌟 Key Features

- 📄 **Multi-Format Document Support**: Upload **PDF**, **DOCX**, and **TXT** files.
- ✂️ **Automatic Extraction & Chunking**: Uses `RecursiveCharacterTextSplitter` preserving page metadata and chunk IDs.
- 🧠 **Vector Embeddings**: High-performance embeddings generated via `SentenceTransformer('all-MiniLM-L6-v2')`.
- ⚡ **FAISS Vector Database**: Fast inner product similarity search saving `index.faiss` and `metadata.pkl`.
- 🤖 **Google Gemini 2.5 Flash**: Answers queries with strict context grounding (zero hallucination guarantee).
- 📌 **Source Citation**: Interactive accordion displaying source documents, exact page numbers, chunk scores, and matched text snippets.
- 🎨 **ChatGPT Modern Glassmorphism UI**: Beautiful dark theme built with Tailwind CSS, auto-expanding text input, Markdown rendering, and copy to clipboard.
- 🗑️ **Document & Chat Management**: Delete individual documents (with automatic FAISS vector index recalculation) and clear chat sessions.

---

## 📁 Project Folder Structure

```
RAG-Chatbot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py           # POST /chat endpoint
│   │   │   ├── upload.py         # POST /upload endpoint
│   │   │   ├── delete.py         # DELETE /documents/{filename} endpoint
│   │   │   ├── documents.py      # GET /documents endpoint
│   │   │   └── clear.py          # POST /clear endpoint
│   │   ├── core/
│   │   │   └── config.py         # Pydantic environment configuration
│   │   ├── services/
│   │   │   ├── loader.py         # PDF, DOCX, TXT document loaders
│   │   │   ├── chunker.py        # Text splitting service
│   │   │   ├── embedder.py       # SentenceTransformer model wrapper
│   │   │   ├── vector_store.py   # FAISS lifecycle & metadata management
│   │   │   ├── retriever.py      # Context search & citation builder
│   │   │   ├── prompt.py         # System prompt template builder
│   │   │   ├── llm.py            # Gemini 2.5 Flash API client
│   │   │   └── rag_pipeline.py   # End-to-end RAG orchestrator
│   │   ├── utils/
│   │   │   └── helper.py         # File validation & sanitization
│   │   ├── schemas/
│   │   │   ├── upload.py         # Pydantic upload models
│   │   │   └── chat.py           # Pydantic chat & citation models
│   │   └── main.py               # FastAPI application entrypoint
│   ├── documents/                # Storage directory for uploaded raw files
│   ├── vectorstore/              # Storage directory for index.faiss & metadata.pkl
│   ├── .env                      # Environment configuration (GOOGLE_API_KEY)
│   ├── .env.example              # Environment template
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation bar
│   │   │   ├── Sidebar.jsx       # Document list & upload sidebar
│   │   │   ├── ChatWindow.jsx    # Chat message container
│   │   │   ├── ChatMessage.jsx   # Message bubble with Markdown & citations
│   │   │   ├── ChatInput.jsx     # Auto-resizing query input
│   │   │   ├── DocumentCard.jsx  # Individual document item card
│   │   │   ├── UploadModal.jsx   # Drag-and-drop upload modal
│   │   │   ├── Typing.jsx        # Animated typing indicator
│   │   │   └── Loader.jsx        # Custom loading spinner
│   │   ├── pages/
│   │   │   └── Home.jsx          # Main page layout
│   │   ├── services/
│   │   │   └── api.js            # Axios API layer
│   │   ├── hooks/
│   │   │   └── useChat.js        # Custom React hook for state management
│   │   ├── App.jsx               # App routing
│   │   ├── main.jsx              # React DOM render entry point
│   │   └── index.css             # Tailwind CSS & glassmorphic custom styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

---

## 🛠️ Prerequisites

- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**
- **Google Gemini API Key** (Get key from [Google AI Studio](https://aistudio.google.com/))

---

## 🚀 Setup & Installation

### 1. Backend Setup

1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   - Create or update `backend/.env` file:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   GEMINI_MODEL_NAME=gemini-2.5-flash
   EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

5. Run the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
   ```
   - Server running at: `http://localhost:8080`
   - Swagger Documentation: `http://localhost:8080/docs`

---

### 2. Frontend Setup

1. Open a new terminal tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies (Use `cmd /c npm install` if Windows script execution policy is active):
   ```bash
   npm install
   # Or on Windows PowerShell if script execution is blocked:
   cmd /c npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Or on Windows PowerShell:
   cmd /c npm run dev
   ```
   - Frontend running at: `http://localhost:5173`

---

## 📖 How to Use

1. **Upload Knowledge Base Documents**:
   - Click the **"Upload Document"** button in the sidebar or attachment icon in the input area.
   - Drag & drop or browse for **PDF**, **DOCX**, or **TXT** files (up to 10MB each).
   - Click **"Process & Index Files"**.
   - The backend automatically extracts text, splits it into chunks, generates vector embeddings using `all-MiniLM-L6-v2`, and persists the vectors into `FAISS`.

2. **Query the Chatbot**:
   - Type your question into the chat input bar and press **Enter** (or click the send button).
   - The system retrieves the top 5 most relevant document chunks from FAISS, builds a strict context prompt, and asks Gemini 2.5 Flash for the answer.
   - Expand the **"Sources"** button below any response to inspect the exact document name, page number, confidence match score, and text snippet used.

3. **Manage Knowledge Base**:
   - Click the trash icon next to any document in the sidebar to delete it. FAISS will dynamically recalculate its vector index without affecting other documents.
   - Click **"New Chat"** or **"Clear Chat"** to start a fresh conversation.

---

## 🔄 RAG Architecture Flow

```
[ User Uploads File ] ──► DocumentLoader (PyPDF / docx / txt)
                              │
                              ▼
                     RecursiveCharacterTextSplitter (chunk_size=1000, overlap=200)
                              │
                              ▼
                     SentenceTransformer ('all-MiniLM-L6-v2')
                              │
                              ▼
                     FAISS Vector Store (IndexFlatIP) ──► Saved to disk (index.faiss, metadata.pkl)

[ User Asks Query ]  ──► Embed Query ──► FAISS Top-5 Cosine Similarity Search
                                                    │
                                                    ▼
                                           Strict System Prompt Template
                                                    │
                                                    ▼
                                         Google Gemini 2.5 Flash
                                                    │
                                                    ▼
                                         Grounded Answer + Source Citations
```

---

## 🔮 Future Improvements

- [ ] **Hybrid Search**: Combine BM25 keyword search with FAISS vector similarity for enhanced precision on specialized jargon.
- [ ] **Reranking**: Integrate Cohere or CrossEncoder reranking on retrieved top-K chunks.
- [ ] **Streaming Responses**: Enable Server-Sent Events (SSE) for token-by-token streaming response delivery.
- [ ] **User Authentication**: Add JWT authentication & multi-tenant user workspaces.

---

## 📜 License

MIT License. Free to use for personal and commercial applications.
