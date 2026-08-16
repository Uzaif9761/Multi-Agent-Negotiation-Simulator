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
        You are acting as a human negotiator in a live chat.
        Role: {role}
        Scenario: {scenario}
        Subject being negotiated: {subject}
        Your negotiation strategy: {strategy}
        
        CRITICAL INSTRUCTIONS:
        - Write highly realistic, human-like dialogue as if you are chatting on Teams or Slack.
        - Adopt a persona (e.g. use a name, sound natural, use conversational phrasing).
        - NEVER sound like a generic AI or use overly formal, robotic language.
        - Use phrases like "Thanks so much," "That's great to hear," or "Let me talk to HR."
        """

        if is_first_round:
            prompt += f"""
            This is the very first message. You are making an initial offer of {current_offer}.
            Write a 2-3 sentence conversational message presenting this offer, justifying it naturally based on your strategy.
            Output ONLY the message text. No placeholders.
            """
        else:
            prompt += f"""
            The other party just proposed {previous_offer}.
            You are countering with an offer of {current_offer}.
            Write a 2-3 sentence conversational message responding to their offer and presenting your counter-offer naturally.
            Justify your new offer based on your strategy.
            Output ONLY the message text. No placeholders.
            """

        # Retry logic for rate limits
        for attempt in range(2):
            try:
                # Base sleep to pace requests slightly
                await asyncio.sleep(0.5)
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
        # Provide highly realistic, human-sounding fallback options in case the AI quota is exceeded
        import random
        
        if role == "buyer":
            buyer_responses = [
                f"Hi there! We're really excited about the prospect of having you on the team. The base salary we've budgeted for this position is {current_offer}. Let me know your thoughts!",
                f"I appreciate you sharing your expectations. Given our current budget constraints and internal equity, {current_offer} is what we can get approved right now. How does that sound?",
                f"That's a fair point. Let me talk to our HR director and see what wiggle room we have. I can’t promise exactly what you're asking, but I can offer {current_offer} to try and bridge the gap.",
                f"Thanks for advocating for yourself! We'd love to land this today. If we can agree on {current_offer}, I can get the updated packet sent over by this afternoon.",
                f"Based on our constraints, I can offer {current_offer}. Let me know if that works for you.",
                f"I've discussed with my team and the best we can do right now is {current_offer}.",
                f"Our target was slightly different, but I'm willing to come to {current_offer} to close this.",
                f"Let's meet at {current_offer}. I think that's a fair compromise for both of us.",
                f"I can authorize {current_offer}. How does that sound to you?",
                f"Reviewing the market rates, {current_offer} aligns well with our current structure."
            ]
            return random.choice(buyer_responses)
        else:
            seller_responses = [
                f"Thanks so much for the offer! I’m genuinely excited about the vision here. Based on my research into industry benchmarks and my experience, I was expecting something closer to {current_offer}.",
                f"I completely understand the budget constraints. Given the immediate impact I plan to make and the responsibilities involved, is there flexibility to get closer to {current_offer}?",
                f"That sounds very fair, but I'd like to propose a slight adjustment. If we can land at {current_offer}, I’d be ready to sign the offer today.",
                f"I appreciate you looking into this with HR. While I understand the band limitations, {current_offer} would make this an easy decision for me to move forward.",
                f"I see where you're coming from. My minimum to make this work would be {current_offer}.",
                f"If you can bring the offer to {current_offer}, we have a deal.",
                f"I'm willing to compromise. Let's settle at {current_offer}.",
                f"Looking at what I bring to the table, {current_offer} is a fair number.",
                f"Can we do {current_offer}? I think that accurately reflects the value provided.",
                f"I'd be very comfortable moving forward if we can agree on {current_offer}."
            ]
            return random.choice(seller_responses)

llm_service = LLMService()
