
import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

export const geminiService = {
  // Get the AI instance using the API key directly from process.env.API_KEY as per guidelines
  getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing.");
    }
    // Correct initialization: new GoogleGenAI({ apiKey: process.env.API_KEY })
    return new GoogleGenAI({ apiKey });
  },

  // Handles multi-turn chat responses
  async getChatResponse(prompt: string, history: { role: 'user' | 'model', text: string }[]) {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro for complex advisory tasks
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "Você é a Inteligência Lumatrix, consultora sênior. Responda com elegância e precisão técnica.",
          temperature: 0.6,
        }
      });
      // Use .text property directly
      return response.text || "Lumatrix: Erro de resposta.";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      return "Lumatrix: Ocorreu um erro na comunicação com meu núcleo de processamento.";
    }
  },

  // Provides quick analysis for a property
  async getBuyerInsight(property: Property) {
    try {
      const ai = this.getAI();
      const prompt = `Analise como Consultor de Investimentos Lumatrix:
      Ativo: ${property.title} | Preço: R$ ${property.price} | Área: ${property.area}m²
      Local: ${property.address.neighborhood}, ${property.address.city}
      
      Dê um 'Investment Grade' (A+ até D) e justifique se vale a pena para o comprador. 
      Seja crítico e honesto. Curto e direto.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "Análise indisponível.";
    } catch (error) {
      console.error("Insight Error:", error);
      return "Análise de investimento indisponível.";
    }
  },

  // Geocoding helper with JSON response schema
  async getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
    try {
      const ai = this.getAI();
      const prompt = `Converta este endereço em coordenadas Latitude e Longitude exatas para uso no Google Maps.
      Endereço: ${address}
      Retorne APENAS um JSON: {"lat": number, "lng": number}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            },
            required: ["lat", "lng"]
          }
        }
      });
      
      return JSON.parse(response.text || '{"lat": -23.5505, "lng": -46.6333}');
    } catch (error) {
      return { lat: -23.5505, lng: -46.6333 };
    }
  },

  // Complex valuation engine using Pro model and response schema
  async estimateValue(data: any, ibgeMetrics?: any) {
    try {
      const ai = this.getAI();
      const prompt = `Avalie o valor deste ativo: ${data.type}, ${data.area}m² em ${data.city}. 
      Use estes dados IBGE: ${JSON.stringify(ibgeMetrics)}.
      Retorne um JSON com fastSell, maxProfit e marketContext.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fastSell: { 
                type: Type.OBJECT, 
                properties: { 
                  min: {type: Type.NUMBER}, 
                  max: {type: Type.NUMBER}, 
                  justification: {type: Type.STRING} 
                }, 
                required: ["min", "max", "justification"] 
              },
              maxProfit: { 
                type: Type.OBJECT, 
                properties: { 
                  min: {type: Type.NUMBER}, 
                  max: {type: Type.NUMBER}, 
                  justification: {type: Type.STRING} 
                }, 
                required: ["min", "max", "justification"] 
              },
              marketContext: { type: Type.STRING }
            },
            required: ["fastSell", "maxProfit", "marketContext"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Estimate Error:", error);
      return null;
    }
  }
};
