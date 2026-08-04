from typing import List, Dict, Any


def build_system_prompt(query: str, chunks: List[Dict[str, Any]]) -> str:
    if not chunks:
        context_str = "No relevant context found in uploaded documents."
    else:
        context_blocks = []
        for idx, chunk in enumerate(chunks):
            meta = chunk.get("metadata", {})
            source = meta.get("source", "Document")
            page = meta.get("page", 1)
            text = chunk.get("text", "")
            context_blocks.append(f"[Source {idx+1}: {source} (Page {page})]\n{text}")
        context_str = "\n\n---\n\n".join(context_blocks)

    system_instruction = f"""You are an intelligent, highly accurate RAG Assistant.
Answer the user's question using ONLY the provided document context below.
Strict Rules:
1. If the information needed to answer the question is contained in the context, provide a clear, well-structured, comprehensive answer.
2. Cite sources in your text when referencing facts, e.g., [Source 1] or (Filename, Page X).
3. If the answer cannot be determined from the provided context, state clearly: "I cannot find the answer to this question in the provided documents." Do NOT make up or hallucinate any facts outside the context.

Context:
{context_str}

User Question:
{query}

Answer:"""
    return system_instruction
