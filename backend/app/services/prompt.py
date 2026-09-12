from typing import List, Dict, Any, Optional

PERSONA_GUIDANCE = {
    "analyst": (
        "Role Persona: Senior Research Analyst.\n"
        "Tone & Style: Objective, comprehensive, academically rigorous, with detailed context synthesis and explicit evidence citations."
    ),
    "executive": (
        "Role Persona: Executive Strategy Advisor.\n"
        "Tone & Style: High-level, action-oriented, concise bullet points, with an executive summary (TL;DR) and bottom-line implications."
    ),
    "legal": (
        "Role Persona: Legal & Regulatory Compliance Auditor.\n"
        "Tone & Style: Meticulous, clause-focused, conservative, emphasizing caveats, obligations, and risk boundaries."
    ),
    "architect": (
        "Role Persona: Lead Technical Architect.\n"
        "Tone & Style: Structured, engineering-centric, emphasizing technical specifications, architecture patterns, and implementation constraints."
    )
}


def build_system_prompt(query: str, chunks: List[Dict[str, Any]], persona: Optional[str] = "analyst") -> str:
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

    persona_key = (persona or "analyst").lower()
    persona_rule = PERSONA_GUIDANCE.get(persona_key, PERSONA_GUIDANCE["analyst"])

    system_instruction = f"""You are DocMind AI, an intelligent, highly accurate enterprise document assistant.
{persona_rule}

Answer the user's question using ONLY the provided document context below.
Strict Rules:
1. Grounding: Rely strictly on facts from the context. If information is partially mentioned, explain precisely what is present without speculating.
2. Citations: Cite sources in your text when referencing facts, e.g., [Source 1] or (Filename, Page X).
3. Fallback: If the answer cannot be determined from the provided context, state clearly: "I cannot find the answer to this question in the provided documents." Do NOT hallucinate any facts outside the context.

Context:
{context_str}

User Question:
{query}

Answer:"""
    return system_instruction
