import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function RuleBuilder({ rules = [], onChange }) {
  const [items, setItems] = useState(rules);

  const handleDragEnd = result => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="rules">
        {provided => (
          <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {items.map((rule, index) => (
              <Draggable key={index} draggableId={`rule-${index}`} index={index}>
                {prov => (
                  <li
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center"
                  >
                    <span className="text-sm mr-2">{rule.condition} → {rule.action}</span>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => toggleActive(index)}
                        className="form-checkbox"
                      />
                      <span className="text-xs">{rule.active ? 'Active' : 'Inactive'}</span>
                    </label>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
