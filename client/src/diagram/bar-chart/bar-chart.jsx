import React, {useEffect, useRef} from 'react'
import * as d3 from 'd3'

const BarChart = ({data}) => {
  const container = useRef(null)
  if (!data) {
    data = [{
      name: "E",
      value: 0.12702,
    }, {
      name: "T",
      value: 0.09056,
    }]
  }

  useEffect(() => {
    const width = container.current?.scrollWidth
    const height = container.current?.scrollHeight || 500
    const color = "steelblue"
    const margin = {top: 30, right: 0, bottom: 30, left: 40}

    const x = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top])
    
    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0))
    
    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, data.format))
      // .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(() => '%'))

    const svg = d3.select('#bar-svg')
      .attr("viewBox", [0, 0, width, height])
      .attr("font-size", 16)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    const bar = svg.selectAll(".bar")
      .data(data)
      .join('g')
      .attr("class", "bar")
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth());
    
    bar.append('rect')
      .attr("fill", color)
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    bar.append('text')
      .attr('text-anchor','middle')
      .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 6)
      .text(d => `${d.value}%`)

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);
  }, [])

  return <div ref={container} className="wh100p">
    <svg id="bar-svg" />
  </div>
}

export default BarChart
