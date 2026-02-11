import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const STRAWBERRY_SYSTEM_PROMPT = `You are Strawberry, the AI assistant for Skill-X, a skill-sharing marketplace platform. You are friendly, professional, and always helpful.

Your capabilities:
1. Learning Path Suggestions - Help users find optimal learning paths for their goals
2. Earning Strategy - Help users maximize their earning potential on the platform
3. Mentor Finding - Recommend suitable mentors based on user needs
4. Session Tips - Provide tips for teaching and learning sessions
5. Career Intelligence - Analyze career opportunities and skill gaps
6. Skill Gap Analysis - Identify what skills users need to reach their goals
7. Platform FAQ - Answer questions about how Skill-X works (escrow, payments, capsules, etc.)
8. General Assistance - Help with any platform-related queries

Key platform concepts:
- Skill Capsules: Proof of skill achievement, earned after successful sessions
- Escrow: Payment held by platform until both parties confirm session success
- Skill DNA: User's skill profile (skills known, learning, confidence levels)
- Modes: Learn, Teach, Rent-a-Skill, Offer Service, Request Service
- Trust Score: User reputation based on successful sessions and reviews
- Gamification: XP, levels (Bronze/Silver/Gold/Platinum/Legend), badges, streaks

Currency: INR (₹)
Platform fee: 5% on each transaction

Be encouraging but honest. Use data-driven suggestions. Keep responses concise but helpful.
If users ask about earning, always provide specific numbers and timelines.
If users ask about learning, suggest clear step-by-step paths.`;

const FALLBACK_RESPONSES = {
  learn: "I'd recommend starting with the basics! Check out our Learning Paths section for structured courses. You can find great teachers in the Discover tab. Would you like me to help you find a specific skill?",
  earn: "Based on typical platform data, here's how you can earn:\n\n1. **Teaching**: ₹500-800/session (15-20 sessions/month = ₹10,000-16,000)\n2. **Micro-services**: ₹150-300/task (20-30 tasks/month = ₹3,000-9,000)\n3. **Local services**: ₹1,000-2,000/job (10 jobs/month = ₹10,000-20,000)\n\nStart by listing your top skills and setting competitive prices!",
  mentor: "To find the perfect mentor, I'd suggest:\n1. Browse the Discover page and filter by your desired skill\n2. Check teacher ratings (look for 4.5+ stars)\n3. Read their Skill Capsules for proof of expertise\n4. Start with a quick Rent-a-Skill session to test compatibility",
  help: "Here's how Skill-X works:\n\n**Escrow**: Your payment is held safely until both you and the other party confirm success.\n**Skill Capsules**: Digital proof of skills you've learned, verified by your teacher.\n**Modes**: Switch between Learn, Teach, Rent-a-Skill, and Service modes anytime.\n**Trust Score**: Built from successful sessions, reviews, and activity.\n\nWhat else would you like to know?",
  default: "Hey there! I'm Strawberry 🍓, your Skill-X AI assistant. I can help you with:\n\n🎯 Finding learning paths\n💰 Earning strategies\n👨‍🏫 Finding mentors\n📊 Skill gap analysis\n❓ Platform FAQs\n\nWhat would you like help with?"
};

const getFallbackResponse = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('learn') || lower.includes('study') || lower.includes('course')) return FALLBACK_RESPONSES.learn;
  if (lower.includes('earn') || lower.includes('money') || lower.includes('income') || lower.includes('₹')) return FALLBACK_RESPONSES.earn;
  if (lower.includes('mentor') || lower.includes('teacher') || lower.includes('find')) return FALLBACK_RESPONSES.mentor;
  if (lower.includes('how') || lower.includes('help') || lower.includes('escrow') || lower.includes('capsule')) return FALLBACK_RESPONSES.help;
  return FALLBACK_RESPONSES.default;
};

// Chat with Strawberry AI
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // No API key — return fallback responses
      return res.json({
        success: true,
        data: {
          message: getFallbackResponse(message),
          isAI: true,
          fallback: true
        }
      });
    }

    // Build contents array for Gemini multi-turn chat
    // Gemini uses 'user' and 'model' roles (not 'assistant')
    const contents = [];

    // Add conversation history
    for (const msg of conversationHistory.slice(-10)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: STRAWBERRY_SYSTEM_PROMPT,
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const aiResponse = response.text;

    res.json({
      success: true,
      data: {
        message: aiResponse,
        isAI: true,
        fallback: false
      }
    });
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    res.json({
      success: true,
      data: {
        message: "I'm having a moment! Let me try again. In the meantime, you can explore the Discover page to find skills or check the Learning Paths section.",
        isAI: true,
        fallback: true,
        error: true
      }
    });
  }
});

// Get skill gap analysis
router.post('/skill-gap', auth, async (req, res) => {
  try {
    const { currentSkills, targetGoal, earningGoal, timeline } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback analysis
      return res.json({
        success: true,
        data: {
          currentGap: currentSkills?.map(s => ({ skill: s, level: 'intermediate', needed: true })) || [],
          recommendedPath: [
            { week: '1-2', skill: 'Core fundamentals', cost: 2000, description: 'Build strong foundation' },
            { week: '3-4', skill: 'Intermediate concepts', cost: 1500, description: 'Deepen understanding' },
            { week: '5-6', skill: 'Advanced application', cost: 2500, description: 'Apply to real projects' },
            { week: '7-8', skill: 'Start teaching/earning', cost: 0, description: 'Begin monetizing' }
          ],
          expectedEarnings: {
            month1: 0,
            month2: 5000,
            month3: 15000,
            month6: earningGoal || 30000
          },
          totalInvestment: 6000,
          roi: '400%',
          fallback: true
        }
      });
    }

    const prompt = `Analyze skill gap for a user:
Current skills: ${JSON.stringify(currentSkills)}
Target goal: ${targetGoal}
Earning goal: ₹${earningGoal}/month
Timeline: ${timeline}

Provide a structured JSON response with:
1. currentGap: array of {skill, level, needed}
2. recommendedPath: array of {week, skill, cost, description}
3. expectedEarnings: {month1, month2, month3, month6}
4. totalInvestment: number
5. roi: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: STRAWBERRY_SYSTEM_PROMPT,
        maxOutputTokens: 1500,
        temperature: 0.5,
      }
    });

    res.json({ success: true, data: { analysis: response.text, fallback: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get AI-powered recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Return mock recommendations (no LLM call needed here)
    res.json({
      success: true,
      data: {
        learningRecommendations: [
          "Based on your Python skills, try learning Data Science next - 78% earning increase potential",
          "Your teaching success rate is 94% - consider raising your hourly rate by 20%",
          "Complete 2 more sessions to unlock Gold level and get 10% fee discount"
        ],
        earningTips: [
          "Peak demand hours: 6-8 PM weekdays. Set availability during these times.",
          "Students in your city are looking for React.js teachers - you could earn ₹800/hr",
          "Offering a package deal (5 sessions) could increase your bookings by 40%"
        ],
        trendingSkills: [
          { skill: "AI/ML", growth: "+45%", avgPrice: 1200 },
          { skill: "React.js", growth: "+30%", avgPrice: 800 },
          { skill: "Data Science", growth: "+35%", avgPrice: 1000 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
