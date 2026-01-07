
import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

export const geminiService = {
  // Helper para obter a instância da IA decodificando a chave se necessário
  getAI() {
    let key = process.env.API_KEY || "";
    
    // Se a chave estiver em Base64 (não começa com o prefixo padrão do Google 'AIza'), decodifica
    if (key && !key.startsWith("AIza")) {
      try {
        // atob converte Base64 de volta para a string original
        key = atob(key.trim());
        console.debug("Lumatrix: API_KEY decodificada com sucesso.");
      } catch (e) {
        console.error("Lumatrix: Erro ao tentar decodificar a API_KEY. Verifique se o formato Base64 está correto.", e);
      }
    }

    if (!key) {
      throw new Error("API key is missing. Certifique-se de que VITE_GEMINI_KEY está no seu arquivo .env");
    }

    return new GoogleGenAI({ apiKey: key });
  },

  async getChatResponse(prompt: string, history: { role: 'user' | 'model', text: string }[]) {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "Você é a Inteligência Lumatrix, consultora sênior. Responda com elegância e precisão técnica.",
          temperature: 0.6,
        }
      });
      return response.text || "Lumatrix: Erro de resposta.";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("API key is missing")) {
        return "Lumatrix: Erro de autenticação. A chave VITE_GEMINI_KEY não foi encontrada ou é inválida.";
      }
      return "Lumatrix: Ocorreu um erro na comunicação com meu núcleo de processamento.";
    }
  },

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
      return "Análise de investimento indisponível (Erro de Autenticação).";
    }
  },

  async getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
    try {
      const ai = this.getAI();
      const prompt = `Converta este endereço em coordenadas Latitude e Longitude exatas para uso no Google Maps.
      Endereço: ${address}
      Retorne APENAS um JSON: {"lat": number, "lng": number}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      return JSON.parse(response.text || '{"lat": -23.5505, "lng": -46.6333}');
    } catch (error) {
      return { lat: -23.5505, lng: -46.6333 };
    }
  },

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
      console.error("Estimate Error:", error);
      return null;
    }
  }
};
