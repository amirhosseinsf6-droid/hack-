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

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    // Data generation based on "hacking" metaphor
    const nodes: NodeData[] = Array.from({ length: 20 }, (_, i) => ({
      id: `NODE_${i}`,
      status: i === 0 ? 'compromised' : 'active',
      val: Math.random()
    }));

    const links: LinkData[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (i !== target) links.push({ source: nodes[i].id, target: nodes[target].id });
    }

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(40))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(15));

    const link = svg.append("g")
      .attr("stroke", "#333")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => d.status === 'compromised' ? '#ff0000' : '#00ff00');

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

    // Animate infection spreading
    const spreadInfection = () => {
        const victimIndex = Math.floor(Math.random() * nodes.length);
        nodes[victimIndex].status = 'compromised';
        
        node.data(nodes)
            .transition().duration(500)
            .attr("fill", (d) => d.status === 'compromised' ? '#ef4444' : '#22c55e') // Red vs Green
            .attr("r", (d) => d.status === 'compromised' ? 8 : 5);
        
        link.attr("stroke", (d: any) => {
             const source = nodes.find(n => n.id === d.source.id);
             return source?.status === 'compromised' ? '#ef4444' : '#333';
        });
    };

    let intervalMs = 1000;
    if (level === SecurityLevel.WARNING) intervalMs = 500;
    if (level === SecurityLevel.BREACH || level === SecurityLevel.CRITICAL) intervalMs = 100;

    const interval = setInterval(spreadInfection, intervalMs);

    return () => clearInterval(interval);

  }, [level]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px] border border-green-900/50 bg-black/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-green-900/20 text-xs px-2 py-1 text-green-400">NETWORK TOPOLOGY</div>
        <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default NetworkGraph;