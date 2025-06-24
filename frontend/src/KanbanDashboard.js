import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button
} from '@mui/material';
import { API_BASE } from './api';

export default function KanbanDashboard() {
  const token = localStorage.getItem('token') || '';
  const [columns, setColumns] = useState({ pending: [], approved: [], flagged: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setColumns({
          pending: data.filter(i => i.approval_status === 'Pending' && !i.flagged),
          approved: data.filter(i => i.approval_status === 'Approved'),
          flagged: data.filter(i => i.flagged)
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    const id = draggableId;
    let url = '';
    let options = { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    if (destination.droppableId === 'approved') {
      url = `${API_BASE}/api/invoices/${id}/approve`;
    } else if (destination.droppableId === 'flagged') {
      url = `${API_BASE}/api/invoices/${id}/flag`;
      options.body = JSON.stringify({ flagged: true });
    } else if (destination.droppableId === 'pending') {
      url = `${API_BASE}/api/invoices/${id}/flag`;
      options.body = JSON.stringify({ flagged: false });
    }
    if (url) {
      await fetch(url, options).catch(() => {});
      fetchData();
    }
  };

  const renderColumn = (key, title, items) => (
    <Grid item xs={12} md={4}>
      <Droppable droppableId={key}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            {items.map((inv, index) => (
              <Draggable key={inv.id} draggableId={String(inv.id)} index={index}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ marginBottom: 8 }}>
                    <Tooltip title={`Amount: $${inv.amount}`}> 
                      <Card onDoubleClick={() => setSelected(inv)} sx={{ cursor: 'pointer' }}>
                        <CardContent>
                          <Typography variant="subtitle2">#{inv.invoice_number}</Typography>
                          <Typography variant="body2">{inv.vendor}</Typography>
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Grid>
  );

  const handleField = (field, value) => {
    setSelected(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Kanban Dashboard">
      {loading && <CircularProgress />}
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {renderColumn('pending', 'Pending', columns.pending)}
          {renderColumn('approved', 'Approved', columns.approved)}
          {renderColumn('flagged', 'Flagged', columns.flagged)}
        </Grid>
      </DragDropContext>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent>
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TextField label="Invoice #" value={selected.invoice_number || ''} onChange={e => handleField('invoice_number', e.target.value)} />
              <TextField label="Vendor" value={selected.vendor || ''} onChange={e => handleField('vendor', e.target.value)} />
              <TextField label="Amount" value={selected.amount || ''} onChange={e => handleField('amount', e.target.value)} />
              <Button variant="contained" onClick={() => setSelected(null)} sx={{ mt: 1 }}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
