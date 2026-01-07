import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function RuleBuilder({ rules = [], onChange }) {
  const [items, setItems] = useState(
    rules.map((rule, index) => ({
      ...rule,
      id: rule.id ?? `rule-${index}-${rule.condition}-${rule.action}`,
    }))
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const sourceIndex = items.findIndex((rule) => rule.id === active.id);
    const destinationIndex = items.findIndex((rule) => rule.id === over.id);
    if (sourceIndex === -1 || destinationIndex === -1) return;
    const reordered = arrayMove(items, sourceIndex, destinationIndex);
    setItems(reordered);
    onChange && onChange(reordered);
  };

  const toggleActive = index => {
    const updated = [...items];
    updated[index] = { ...updated[index], active: !updated[index].active };
    setItems(updated);
    onChange && onChange(updated);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((rule, index) => (
            <RuleItem
              key={rule.id}
              rule={rule}
              onToggle={() => toggleActive(index)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function RuleItem({ rule, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
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
      className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center"
    >
      <span className="text-sm mr-2">{rule.condition} → {rule.action}</span>
      <label className="flex items-center space-x-1">
        <input
          type="checkbox"
          checked={rule.active}
          onChange={onToggle}
          className="form-checkbox"
        />
        <span className="text-xs">{rule.active ? 'Active' : 'Inactive'}</span>
      </label>
    </li>
  );
}
