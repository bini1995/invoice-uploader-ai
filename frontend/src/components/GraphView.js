import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { API_BASE } from '../api';

const GraphView = ({ token, tenant }) => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/claims/graph`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-Id': tenant,
          },
        });
        const json = await res.json();
        if (!res.ok || !json.nodes || !json.links) {
          throw new Error(json.message || 'Invalid graph response');
        }
        setData({ nodes: json.nodes, links: json.links });
        setError(null);
      } catch (err) {
        console.error('Graph fetch error:', err);
        setError('Failed to load graph');
        setData({ nodes: [], links: [] });
      }
    };
    fetchGraph();
  }, [token, tenant]);

  return (
    <div className="h-96 border rounded flex items-center justify-center">
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <ForceGraph2D
          graphData={data}
          nodeId="id"
          nodeLabel="label"
          nodeAutoColorBy="type"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
        />
      )}
    </div>
  );
};

export default GraphView;
