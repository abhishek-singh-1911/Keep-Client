import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton } from '@mui/material';
import { DragIndicator as DragHandleIcon } from '@mui/icons-material';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <IconButton
        size="small"
        sx={{
          cursor: isDragging ? 'grabbing' : 'grab',
          p: 0.5,
          mr: 0.5,
          touchAction: 'none',
        }}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon fontSize="small" sx={{ color: 'text.disabled' }} />
      </IconButton>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        {children}
      </Box>
    </Box>
  );
}
