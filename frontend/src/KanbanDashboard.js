import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/MainLayout';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

function InvoiceCard({ inv, columnId, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(inv.id),
    data: { columnId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 8,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Tooltip title={`Amount: $${inv.amount}`}>
        <Card onDoubleClick={() => onSelect(inv)} sx={{ cursor: 'pointer' }}>
          <CardContent>
            <Typography variant="subtitle2">#{inv.invoice_number}</Typography>
            <Typography variant="body2">{inv.vendor}</Typography>
          </CardContent>
        </Card>
      </Tooltip>
    </div>
  );
}

function KanbanColumn({ columnId, title, items, onSelect }) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <Grid item xs={12} md={4}>
      <div ref={setNodeRef} style={{ minHeight: 200 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <SortableContext items={items.map((inv) => String(inv.id))} strategy={verticalListSortingStrategy}>
          {items.map((inv) => (
            <InvoiceCard key={inv.id} inv={inv} columnId={columnId} onSelect={onSelect} />
          ))}
        </SortableContext>
      </div>
    </Grid>
  );
}

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
          pending: data.filter(i => i.approval_status === 'Pending'),
          approved: data.filter(i => i.approval_status === 'Approved'),
          flagged: data.filter(i => i.approval_status === 'Flagged')
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDragEnd = async ({ active, over }) => {
    if (!over) return;
    const sourceColumnId = active.data.current?.columnId;
    const destinationColumnId = over.data.current?.columnId ?? over.id;
    if (!destinationColumnId || sourceColumnId === destinationColumnId) return;
    const id = active.id;
    let url = '';
    let options = { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    if (destinationColumnId === 'approved') {
      url = `${API_BASE}/api/invoices/${id}/approve`;
    } else if (destinationColumnId === 'flagged') {
      url = `${API_BASE}/api/invoices/${id}/flag`;
      options.body = JSON.stringify({ flagged: true });
    } else if (destinationColumnId === 'pending') {
      url = `${API_BASE}/api/invoices/${id}/flag`;
      options.body = JSON.stringify({ flagged: false });
    }
    if (url) {
      await fetch(url, options).catch(() => {});
      fetchData();
    }
  };

  const handleField = (field, value) => {
    setSelected(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Kanban Dashboard">
      {loading && <CircularProgress />}
      <DndContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <KanbanColumn columnId="pending" title="Pending" items={columns.pending} onSelect={setSelected} />
          <KanbanColumn columnId="approved" title="Approved" items={columns.approved} onSelect={setSelected} />
          <KanbanColumn columnId="flagged" title="Flagged" items={columns.flagged} onSelect={setSelected} />
        </Grid>
      </DndContext>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Claim Document</DialogTitle>
        <DialogContent>
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TextField label="Claim #" value={selected.invoice_number || ''} onChange={e => handleField('invoice_number', e.target.value)} />
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
