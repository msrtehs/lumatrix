
import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

export const geminiService = {
  getAI() {
    const apiKey = process.env.API_KEY;
    
    // Log de Depuração Seguro para o Usuário
    if (apiKey && apiKey !== '""' && apiKey !== "undefined" && apiKey.length > 5) {
      console.log(`Lumatrix Debug: Chave detectada (Início: ${apiKey.substring(0, 4)}... Fim: ${apiKey.substring(apiKey.length - 4)})`);
    } else {
      console.warn("Lumatrix Debug: Nenhuma chave válida detectada no process.env.API_KEY");
    }

    if (!apiKey || apiKey === '""' || apiKey === "undefined") {
      return null;
    }
    
    return new GoogleGenAI({ apiKey });
  },

  async getChatResponse(prompt: string, history: { role: 'user' | 'model', text: string }[]) {
    try {
      const ai = this.getAI();
      if (!ai) return "Lumatrix: Erro de configuração. Chave de API não encontrada. Verifique se o Segredo VITE_GEMINI_KEY foi criado no GitHub.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "Você é a Inteligência Lumatrix, consultora imobiliária sênior. Responda com elegância e autoridade.",
          temperature: 0.7,
        }
      });
      return response.text || "Lumatrix: Erro de processamento.";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("API key not valid")) {
        return "Lumatrix: A chave de API no GitHub Secrets é INVÁLIDA para o Google Gemini. Verifique se você copiou a chave correta de ai.google.dev (ela deve começar com 'AIza').";
      }
      return "Lumatrix: Erro na comunicação com a IA. Tente novamente em instantes.";
    }
  },

  async getBuyerInsight(property: Property) {
    try {
      const ai = this.getAI();
      if (!ai) return "Chave de API ausente.";
      const prompt = `Analise como Consultor Lumatrix: Ativo ${property.title}, R$ ${property.price}, Local ${property.location}. Dê um Investment Grade (A-D) e justifique.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "Análise indisponível.";
    } catch (error) {
      return "Análise indisponível no momento.";
    }
  },

  async getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
    try {
      const ai = this.getAI();
      if (!ai) throw new Error();
      const prompt = `Retorne JSON {"lat": number, "lng": number} para: ${address}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
            required: ["lat", "lng"]
          }
        }
      });
      return JSON.parse(response.text || '{"lat": -23.5505, "lng": -46.6333}');
    } catch (error) {
      return { lat: -23.5505, lng: -46.6333 };
    }
  },

  async estimateValue(data: any, ibgeMetrics?: any) {
    try {
      const ai = this.getAI();
      if (!ai) return null;
      const prompt = `Avalie comercialmente: ${data.type}, ${data.area}m² em ${data.city}. Dados IBGE: ${JSON.stringify(ibgeMetrics)}. Retorne JSON com fastSell e maxProfit.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fastSell: { type: Type.OBJECT, properties: { min: {type: Type.NUMBER}, max: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ["min", "max", "justification"] },
              maxProfit: { type: Type.OBJECT, properties: { min: {type: Type.NUMBER}, max: {type: Type.NUMBER}, justification: {type: Type.STRING} }, required: ["min", "max", "justification"] },
              marketContext: { type: Type.STRING }
            },
            required: ["fastSell", "maxProfit", "marketContext"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return null;
    }
  }
};
