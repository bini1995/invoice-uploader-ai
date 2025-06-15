import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function WorkflowBuilder({ steps = [], onChange }) {
  const [items, setItems] = useState(steps);

  const handleDragEnd = result => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    onChange && onChange(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="workflow">
        {provided => (
          <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {items.map((step, index) => (
              <Draggable key={step} draggableId={step} index={index}>
                {prov => (
                  <li ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    {step}
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
