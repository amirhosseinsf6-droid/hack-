
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NodeData, LinkData, SecurityLevel } from '../types';

interface NetworkGraphProps {
  level: SecurityLevel;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ level }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const nodes: NodeData[] = Array.from({ length: 25 }, (_, i) => ({
      id: `ND_${i}`,
      status: i === 0 ? 'compromised' : 'active',
      val: Math.random()
    }));

    const links: LinkData[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const targets = [Math.floor(Math.random() * nodes.length), Math.floor(Math.random() * nodes.length)];
        targets.forEach(t => {
            if (i !== t) links.push({ source: nodes[i].id, target: nodes[t].id });
        });
    }

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(30))
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#400")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 4)
      .attr("fill", (d) => d.status === 'compromised' ? '#f00' : '#400')
      .style("filter", "drop-shadow(0 0 2px #f00)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    const infect = () => {
        const victims = nodes.filter(n => n.status !== 'compromised');
        if (victims.length > 0) {
            const victim = victims[Math.floor(Math.random() * victims.length)];
            victim.status = 'compromised';
            
            node.data(nodes)
                .transition().duration(400)
                .attr("fill", (d) => d.status === 'compromised' ? '#ff0000' : '#300')
                .attr("r", (d) => d.status === 'compromised' ? 6 : 4);
        }
    };

    let speed = 2000;
    if (level === SecurityLevel.CRITICAL) speed = 300;
    
    const interval = setInterval(infect, speed);
    return () => clearInterval(interval);
  }, [level]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[150px] border border-red-900/50 bg-black/80 relative overflow-hidden blood-border">
        <div className="absolute top-0 left-0 bg-red-900/30 text-[10px] px-2 py-1 text-red-500 font-bold uppercase tracking-tighter">NODE_MAP_INFILTRATION</div>
        <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default NetworkGraph;
