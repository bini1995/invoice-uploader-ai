import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphView = ({ token, tenant }) => {
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/invoices/graph', {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-Id': tenant,
          },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Graph fetch error:', err);
      }
    };
    fetchGraph();
  }, [token, tenant]);

  return (
    <div className="h-96 border rounded">
      <ForceGraph2D
        graphData={data}
        nodeId="id"
        nodeLabel="label"
        nodeAutoColorBy="type"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
      />
    </div>
  );
};

export default GraphView;
