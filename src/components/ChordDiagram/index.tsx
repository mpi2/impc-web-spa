"use client";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

interface Props {
  data: Array<Array<number>>;
  labels: Array<{ name: string; count: number }>;
  width?: number;
  height?: number;
  topTerms?: Array<string>;
}

function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function (value) {
    return { value: value, angle: value * k + d.startAngle, index: d.index };
  });
}

const ChordDiagram = ({
  data,
  labels,
  width = 960,
  height = 960,
  topTerms = [],
}: Props) => {
  const ref = useRef();
  const outerRadius = Math.min(width, height) * 0.5 - 200;
  const innerRadius = outerRadius - 30;

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    function fade(opacity) {
      return function (d, i) {
        const { index } = i;
        // hide other chords on mose over
        svgElement
          .selectAll("path.chord")
          .filter(
            (chord) =>
              chord.source.index !== index && chord.target.index !== index,
          )
          .transition()
          .style("stroke-opacity", opacity)
          .style("fill-opacity", opacity);
      };
    }
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const ribbon = d3.ribbon().radius(innerRadius);

    const color = d3
      .scaleOrdinal()
      .domain(d3.range(4))
      .range([
        "rgb(239, 123, 11)",
        "rgb(9, 120, 161)",
        "rgb(119, 119, 119)",
        "rgb(238, 238, 180)",
        "rgb(36, 139, 75)",
        "rgb(191, 75, 50)",
        "rgb(255, 201, 67)",
        "rgb(191, 151, 50)",
        "rgb(239, 123, 11)",
        "rgb(247, 157, 70)",
        "rgb(247, 181, 117)",
        "rgb(191, 75, 50)",
        "rgb(151, 51, 51)",
        "rgb(144, 195, 212)",
      ]);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .datum(chord(data));

    const group = g
      .append("g")
      .attr("class", "groups")
      .selectAll("g")
      .data((chords) => chords.groups)
      .enter()
      .append("g")
      .attr("class", "group")
      .on("mouseover", fade(0.02))
      .on("mouseout", fade(0.8));

    group
      .append("path")
      .style("fill", (d) => color(d.index))
      .style("stroke", (d) => d3.rgb(color(d.index)).darker())
      .attr("d", arc);

    const groupTick = group
      .selectAll(".group-tick")
      .data((d) => groupTicks(d, 1e3))
      .enter()
      .append("g")
      .attr("class", "group-tick")
      .attr(
        "transform",
        (d) =>
          `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`,
      );

    groupTick.append("line").attr("x2", 6);

    groupTick
      .filter((d) => d.value % 5e3 === 0)
      .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", (d) =>
        d.angle > Math.PI ? "rotate(180) translate(-16)" : null,
      )
      .style("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
      .text((d) => labels[d.index].name.replace("phenotype", ""));

    g.append("g")
      .attr("class", "ribbons")
      .selectAll("path")
      .data((chords) => chords)
      .enter()
      .append("path")
      .attr("d", ribbon)
      .attr("class", "chord")
      .style("fill", (d) => color(d.target.index))
      .style("stroke", (d) => d3.rgb(color(d.target.index)).darker())
      .style("visibility", (d) => {
        if (topTerms && topTerms.length > 0) {
          if (
            topTerms.indexOf(labels[d.source.index].name) < 0 &&
            topTerms.indexOf(labels[d.target.index].name) < 0
          ) {
            return "hidden";
          } else {
            return "visible";
          }
        } else {
          return "visible";
        }
      })
      .append("title")
      .text((d) => {
        return (
          d.source.value +
          " genes present " +
          labels[d.source.index].name +
          " and " +
          labels[d.target.index].name +
          ", "
        );
      });
  }, [data, labels]);

  return (
    <div className={styles.wrapper}>
      <svg width={width} height={height} ref={ref} />
    </div>
  );
};

export default ChordDiagram;
