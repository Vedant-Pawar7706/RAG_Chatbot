import logging
from app.core.config import settings

logger = logging.getLogger("rag_chatbot.llm")


class GeminiLLMService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model_name = settings.GEMINI_MODEL_NAME
        self.client = None
        if self.api_key and self.api_key != "your_google_gemini_api_key_here":
            try:
                from google import genai
                from google.genai import types
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options=types.HttpOptions(timeout=15000)
                )
            except Exception as e:
                logger.warning(f"Could not initialize genai.Client with timeout: {e}")

    def generate_response(self, prompt: str) -> str:
        if not self.api_key or self.api_key == "your_google_gemini_api_key_here":
            return "Error: GOOGLE_API_KEY is not configured in backend/.env file."

        # Prioritize fast, high-availability models verified with this API key
        candidate_models = [
            "gemini-flash-lite-latest",
            self.model_name,
            "gemini-3.6-flash",
            "gemini-3.5-flash",
        ]
        # Remove duplicates and empty values while preserving order
        unique_models = []
        for m in candidate_models:
            if m and m not in unique_models:
                unique_models.append(m)

        # Try Google GenAI SDK first with per-model 15s timeout
        try:
            from google import genai
            from google.genai import types
            client = self.client or genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(timeout=15000)
            )
            for model_candidate in unique_models:
                try:
                    logger.info(f"Querying Gemini model: {model_candidate}")
                    response = client.models.generate_content(
                        model=model_candidate,
                        contents=prompt
                    )
                    if response and response.text:
                        logger.info(f"Successfully received response from model: {model_candidate}")
                        return response.text.strip()
                except Exception as e_mod:
                    logger.warning(f"GenAI candidate '{model_candidate}' failed or timed out: {e_mod}")
                    continue
        except Exception as e1:
            logger.warning(f"google.genai SDK failed: {e1}. Trying google.generativeai fallback...")

        # Fallback to legacy google.generativeai if modern SDK fails
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
                    logger.warning(f"Legacy candidate '{model_candidate}' failed: {e_legacy}")
                    continue
        except Exception as e2:
            logger.error(f"google.generativeai fallback failed: {e2}")

        return "Sorry, unable to process query with Gemini API. Please verify your network connection and try again."


llm_service = GeminiLLMService()
