// Charger le fichier JSON
fetch('raw_jump_data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }
    return response.json(); // Analyser les données JSON
  })
  .then(data => {
    // Accéder au tableau 'leaderboard'
    const leaderboard = data?.WC?.M?.["2024"]?.leaderboard;

    if (Array.isArray(leaderboard)) {
      // Compter les occurrences de 'top_air_trick'
      const topAirTrickCounts = {};
      leaderboard.forEach(entry => {
        const topTrick = entry.top_air_trick;
        if (topTrick) {
          topAirTrickCounts[topTrick] = (topAirTrickCounts[topTrick] || 0) + 1;
        }
      });

      // Préparer les données pour D3.js
      const dataReady = Object.entries(topAirTrickCounts).map(([key, value]) => ({ key, value }));

      // Dimensions et rayon du diagramme
      const width = 600; // Largeur augmentée pour la légende
      const height = 450;
      const margin = 40;
      const radius = Math.min(width, height) / 2 - margin;

      // Créer le conteneur SVG
      const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${radius + margin},${height / 2})`);

      // Échelle de couleurs
      const color = d3.scaleOrdinal()
        .domain(dataReady.map(d => d.key))
        .range(d3.schemeSet2);

      // Générer le diagramme circulaire
      const pie = d3.pie()
        .value(d => d.value);
      const data_ready = pie(dataReady);

      // Générateur d'arcs
      const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      // Dessiner le diagramme
      svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

      // Ajouter la légende
      const legend = svg.append("g")
        .attr("transform", `translate(${radius + margin},${-height / 2 + margin})`);

      legend.selectAll("rect")
        .data(dataReady)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.key));

      legend.selectAll("text")
        .data(dataReady)
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", ".35em")
        .text(d => `${d.key}: ${d.value}`);
    } else {
      console.error("Le 'leaderboard' n'est pas un tableau ou est indéfini.");
    }
  })
  .catch(error => {
    console.error('Erreur lors de la récupération du fichier JSON :', error);
  });
