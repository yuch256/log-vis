import React, {useEffect, useRef} from 'react'
import * as d3 from 'd3'

// pagerank气泡图
const BubbleChart = ({data, className}) => {
  const container = useRef(null)

  if (!data) data = [{
    name: "AgglomerativeCluster",
    value: 393,
  }, {
    name: '0.00100',
    value: 22,
  }]

  const format = d3.format(",d")

  const color = d3.scaleOrdinal(data.map(d => d.value), d3.schemeCategory10)

  useEffect(() => {
    const width = container.current?.scrollWidth
    const height = container.current?.scrollHeight || 500

    const pack = data => d3.pack()
      .size([width - 2, height - 2])
      .padding(3)
      (d3.hierarchy({children: data})
        .sum(d => d.value))
    
    const root = pack(data)
    console.log(root)
    
    const svg = d3.select('#bubble-svg')
      .attr("viewBox", [0, 0, width, height])
      .attr("font-size", 16)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

    leaf.append("circle")
      // .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      .attr("r", d => d.r)
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color(d.data.value));

    // leaf.append("clipPath")
    //   .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    //   .append("use")
    //   .attr("xlink:href", d => d.leafUid.href);

    leaf.append("text")
      .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
      .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);
    
    // leaf.append("title")
    //   .text(d => `${d.data.title === undefined ? "" : `${d.data.title}`}${format(d.value)}`);
  }, [])

  return <div ref={container} className={`${className} wh100p`}>
    <svg id="bubble-svg" />
  </div>
}

export default BubbleChart
