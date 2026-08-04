import logging
from app.core.config import settings

logger = logging.getLogger("rag_chatbot.llm")


class GeminiLLMService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model_name = settings.GEMINI_MODEL_NAME

    def generate_response(self, prompt: str) -> str:
        if not self.api_key or self.api_key == "your_google_gemini_api_key_here":
            return "Error: GOOGLE_API_KEY is not configured in backend/.env file."

        candidate_models = [
            self.model_name,
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
        ]
        # Remove duplicates while preserving order
        unique_models = []
        for m in candidate_models:
            if m and m not in unique_models:
                unique_models.append(m)

        # Try Google GenAI SDK first
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            for model_candidate in unique_models:
                try:
                    response = client.models.generate_content(
                        model=model_candidate,
                        contents=prompt
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception as e_mod:
                    logger.debug(f"GenAI model candidate '{model_candidate}' failed: {e_mod}")
                    continue
        except Exception as e1:
            logger.warning(f"google.genai SDK failed: {e1}. Trying google.generativeai fallback...")

        # Fallback to legacy google.generativeai
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=self.api_key)
            for model_candidate in unique_models:
                try:
                    model = genai_legacy.GenerativeModel(model_candidate)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        return response.text.strip()
                except Exception as e_legacy:
                    logger.debug(f"Legacy model candidate '{model_candidate}' failed: {e_legacy}")
                    continue
        except Exception as e2:
            logger.error(f"google.generativeai fallback failed: {e2}")

        return "Sorry, unable to process query with Gemini API. Please verify your GOOGLE_API_KEY and network connection."


llm_service = GeminiLLMService()
