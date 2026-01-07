import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function WorkflowBuilder({ steps = [], onChange }) {
  const [items, setItems] = useState(steps);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const sourceIndex = items.indexOf(active.id);
    const destinationIndex = items.indexOf(over.id);
    if (sourceIndex === -1 || destinationIndex === -1) return;
    const reordered = arrayMove(items, sourceIndex, destinationIndex);
    setItems(reordered);
    onChange && onChange(reordered);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((step) => (
            <WorkflowStep key={step} step={step} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function WorkflowStep({ step }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-2 bg-gray-100 dark:bg-gray-700 rounded"
    >
      {step}
    </li>
  );
}
