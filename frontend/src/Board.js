import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MainLayout from './components/MainLayout';
import { API_BASE } from './api';

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

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
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
    <Droppable droppableId={key}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 dark:bg-gray-700 rounded p-2 w-72 min-h-[200px]">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          {items.map((inv, index) => (
            <Draggable key={inv.id} draggableId={String(inv.id)} index={index}>
              {(prov) => (
                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-white dark:bg-gray-800 p-2 mb-2 rounded shadow text-sm">
                  <div className="font-semibold">#{inv.invoice_number}</div>
                  <div>{inv.vendor}</div>
                  <div>${inv.amount}</div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <MainLayout title="Approval Board">
      <h1 className="text-xl font-semibold mb-4">Approval Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto">
            {renderColumn('pending', 'Pending', columns.pending)}
            {renderColumn('approved', 'Approved', columns.approved)}
            {renderColumn('flagged', 'Flagged', columns.flagged)}
        </div>
      </DragDropContext>
    </MainLayout>
  );
}
