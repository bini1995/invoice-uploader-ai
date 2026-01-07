import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MainLayout from './components/MainLayout';
import PageHeader from './components/PageHeader';
import { API_BASE } from './api';

function BoardCard({ invoice, columnId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(invoice.id),
    data: { columnId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-white dark:bg-gray-800 p-2 mb-2 rounded shadow text-sm"
    >
      <div className="font-semibold">#{invoice.invoice_number}</div>
      <div>{invoice.vendor}</div>
      <div>${invoice.amount}</div>
    </div>
  );
}

function BoardColumn({ columnId, title, items }) {
  const { setNodeRef } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className="bg-gray-100 dark:bg-gray-700 rounded p-2 w-72 min-h-[200px]">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <SortableContext items={items.map((inv) => String(inv.id))} strategy={verticalListSortingStrategy}>
        {items.map((inv) => (
          <BoardCard key={inv.id} invoice={inv} columnId={columnId} />
        ))}
      </SortableContext>
    </div>
  );
}

export default function Board() {
  const token = localStorage.getItem('token') || '';
  const [columns, setColumns] = useState({ pending: [], approved: [], flagged: [] });

  const fetchData = useCallback(async () => {
    if (!token) return;
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

  return (
    <MainLayout title="Approval Board">
      <PageHeader title="ClarifyOps › ClarifyClaims" subtitle="Approval Board" />
      <DndContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
            <BoardColumn columnId="pending" title="Pending" items={columns.pending} />
            <BoardColumn columnId="approved" title="Approved" items={columns.approved} />
            <BoardColumn columnId="flagged" title="Flagged" items={columns.flagged} />
        </div>
      </DndContext>
    </MainLayout>
  );
}
