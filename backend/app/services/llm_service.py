import asyncio
import time
import google.generativeai as genai
from app.config.settings import settings

# Configure the Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class LLMService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.quota_exceeded_until = 0

    async def generate_rationale(
        self,
        role: str,
        scenario: str,
        subject: str,
        strategy: str,
        current_offer: float,
        previous_offer: float = None,
        is_first_round: bool = False
    ) -> str:
        """
        Generate a conversational negotiation message for an agent based on the current offer.
        """
        if not settings.GEMINI_API_KEY or time.time() < self.quota_exceeded_until:
            return self._get_fallback_message(role, current_offer)

        prompt = f"""
        You are acting as an AI agent in a negotiation simulator.
        Role: {role}
        Scenario: {scenario}
        Subject being negotiated: {subject}
        Your negotiation strategy: {strategy}
        """

        if is_first_round:
            prompt += f"""
            This is the very first round. You are making an initial offer of {current_offer}.
            Write a 2-4 sentence professional message presenting this offer and briefly justifying it based on your strategy.
            Do NOT include placeholders. Output ONLY the message text.
            """
        else:
            prompt += f"""
            The other party recently proposed {previous_offer}.
            You are countering with an offer of {current_offer}.
            Write a 2-4 sentence professional message responding to the previous offer and presenting your counter-offer.
            Justify your new offer based on your strategy.
            Do NOT include placeholders. Output ONLY the message text.
            """

        # Retry logic for rate limits
        for attempt in range(2):
            try:
                # Base sleep to pace requests
                await asyncio.sleep(4)
                response = await self.model.generate_content_async(prompt)
                return response.text.strip()
            except Exception as e:
                err_str = str(e)
                print(f"LLM Error on attempt {attempt+1}: {err_str}")
                if "429" in err_str:
                    # Circuit breaker: disable LLM for 60 seconds
                    self.quota_exceeded_until = time.time() + 60
                    break
                else:
                    break
        
        return self._get_fallback_message(role, current_offer)

    def _get_fallback_message(self, role: str, current_offer: float) -> str:
        # Highly realistic fallback if API limit is completely exhausted
        if role == "buyer":
            return f"Thanks for the offer. Based on the scope of the position and the market range for comparable roles, we’d like to discuss a base salary of {current_offer}."
        else:
            return f"We appreciate the interest. We have some flexibility, but your proposal is above the approved range. We can offer {current_offer}."

llm_service = LLMService()
