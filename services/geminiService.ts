type ChatMessage = { role: string; parts: Array<{ text: string }> };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getStylingAdvice = async (prompt: string, history: ChatMessage[] = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/consult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`Consult API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.text || '';
  } catch (error) {
    console.error('Gemini Error:', error);
    return "I'm having a little trouble connecting to my style guide. Could you please try asking again in a moment, darling?";
  }
};
