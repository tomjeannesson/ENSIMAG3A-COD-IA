function generateWorldMap(containerWidth, containerHeight, margin, data, id) {
  // Calcul des dimensions
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  // Nettoyer le conteneur avant de générer la carte
  d3.select(`#${id}`).selectAll("*").remove()

  // Création du conteneur SVG responsive
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Définir la projection (Natural Earth)
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 6.5)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(projection)

  // Préparer les données
  const dataMap = new Map(data.map((d) => [d.country, d.count]))

  // Définir une échelle de couleur en fonction du nombre d'athlètes
  const maxValue = d3.max(data, (d) => d.count) || 1
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, maxValue])

  // Ajouter un arrière-plan pour les océans
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#e6f2ff")

  // Charger les données GeoJSON personnalisées
  d3.json("custom.geo.json").then((geojson) => {
    // Dessiner la carte
    svg
      .selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        // Vérifiez le nom de la propriété du code pays dans votre fichier personnalisé
        // Cela peut varier selon la source de votre GeoJSON
        const count =
          dataMap.get(
            d.properties.iso_a3 ||
              d.properties.ISO_A3 ||
              d.properties.countryCode
          ) || 0
        return count > 0 ? colorScale(count) : "#f0f0f0"
      })
      .attr("stroke", "#a0a0a0")
      .attr("stroke-width", 0.5)
      .attr("class", "country")
      .on("mouseover", function (event, d) {
        // Highlight the country
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 2)

        // Utilisez le bon nom de propriété pour le nom du pays
        const count =
          dataMap.get(
            d.properties.iso_a3 ||
              d.properties.ISO_A3 ||
              d.properties.countryCode
          ) || 0

        tooltip
          .style("visibility", "visible")
          .html(
            `
            <div style="text-align: center;">
                <strong>${
                  d.properties.name || d.properties.NAME || "Unknown"
                }</strong><br>
                Participants: ${count}
            </div>
            `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        // Remove highlight
        d3.select(this).attr("stroke", "#a0a0a0").attr("stroke-width", 0.5)

        tooltip.style("visibility", "hidden")
      })

    // Le reste du code de la légende reste le même
    const legendWidth = 200
    const legendHeight = 10

    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth])

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".0f"))

    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - legendWidth - 20}, ${height - 50})`
      )

    // Gradient de couleur pour la légende
    const defs = svg.append("defs")

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")

    linearGradient
      .selectAll("stop")
      .data(
        colorScale.ticks().map((t, i, n) => ({
          offset: `${(100 * i) / n.length}%`,
          color: colorScale(t),
        }))
      )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)

    // Rectangle de légende avec gradient
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")

    // Axe de la légende
    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .call((g) => g.selectAll(".domain").remove())
      .call((g) =>
        g.selectAll("text").attr("font-size", "10px").attr("fill", "#333")
      )

    // Libellé de la légende
    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Nombre de participants")
  })

  // Ajouter un tooltip
  const tooltip = d3
    .select(`#${id}`)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(255,255,255,0.9)")
    .style("color", "#333")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
    .style("border", "1px solid #ddd")
    .style("font-size", "14px")
}
