
export const ibgeService = {
  async getCityMetrics(ibgeCode: string) {
    try {
      const [pibRes, popRes, housingRes] = await Promise.all([
        fetch(`https://servicodados.ibge.gov.br/api/v1/pesquisas/37/resultados/${ibgeCode}`),
        fetch(`https://servicodados.ibge.gov.br/api/v1/pesquisas/29/resultados/${ibgeCode}`),
        fetch(`https://servicodados.ibge.gov.br/api/v3/agregados/4712/periodos/2022/variaveis/4090?localidades=N6[${ibgeCode}]`)
      ]);

      const pibData = await pibRes.json();
      const popData = await popRes.json();
      const housingData = await housingRes.json();

      const pibValue = pibData[0]?.res[0]?.res['2021'] || 0;
      const popValue = parseInt(popData[0]?.res[0]?.res['2024'] || popData[0]?.res[0]?.res['2021'] || "0");
      
      // Criar um índice de demanda baseado na população (ex: 0.1% da população ativamente buscando)
      const demandIndex = Math.max(Math.floor(popValue * 0.001), 5);

      return {
        pibPerCapita: pibValue,
        populacaoEstimada: popValue,
        demandIndex: demandIndex,
        censoMoradia: housingData[0]?.res[0]?.localidade?.nome ? "Alta" : "Moderada",
        font: "IBGE 2024"
      };
    } catch (error) {
      console.error("Erro IBGE:", error);
      return null;
    }
  }
};
