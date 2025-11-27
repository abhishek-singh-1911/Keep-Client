import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  InputBase,
  Box,
  IconButton,
  Checkbox,
  Button,
  styled,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { List, ListItem } from '../../store/slices/listsSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { updateList } from '../../store/slices/listsSlice';
import { listsService } from '../../services/listsService';
import { SortableItem } from './SortableItem';

const TitleInput = styled(InputBase)(() => ({
  width: '100%',
  padding: '12px 16px',
  fontSize: '1.25rem',
  fontWeight: 500,
  '& .MuiInputBase-input': {
    padding: 0,
  },
}));

const ItemInput = styled(InputBase)(() => ({
  width: '100%',
  padding: '4px 0',
  fontSize: '0.875rem',
  '& .MuiInputBase-input': {
    padding: 0,
  },
}));

interface EditNoteDialogProps {
  open: boolean;
  list: List | null;
  onClose: () => void;
}

export default function EditNoteDialog({ open, list, onClose }: EditNoteDialogProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (list) {
      setTitle(list.name);
      setItems(list.items);
    }
  }, [list]);

  const handleClose = async () => {
    if (!list) return;

    // Save changes on close
    // 1. Update title if changed
    if (title !== list.name) {
      try {
        const updatedList = await listsService.updateListName(list.listId, title);
        dispatch(updateList(updatedList));
      } catch (error) {
        console.error('Failed to update list name:', error);
      }
    }

    // 2. Add new item if text exists
    if (newItemText.trim()) {
      try {
        const updatedList = await listsService.addItem(list.listId, newItemText);
        dispatch(updateList(updatedList));
        setNewItemText('');
      } catch (error) {
        console.error('Failed to add item:', error);
      }
    }

    onClose();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (!list) return;

      const oldIndex = items.findIndex((item) => item.itemId === active.id);
      const newIndex = items.findIndex((item) => item.itemId === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        const itemIds = newItems.map(item => item.itemId);
        const updatedList = await listsService.reorderItems(list.listId, itemIds);
        dispatch(updateList(updatedList));
      } catch (error) {
        console.error('Failed to reorder items:', error);
        setItems(items); // Revert on failure
      }
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    if (!list) return;

    // Optimistic update
    const updatedItems = items.map(item =>
      item.itemId === itemId ? { ...item, completed: !completed } : item
    );
    setItems(updatedItems);

    try {
      const updatedList = await listsService.updateItem(list.listId, itemId, { completed: !completed });
      dispatch(updateList(updatedList));
    } catch (error) {
      console.error('Failed to update item:', error);
      // Revert on failure
      setItems(items);
    }
  };

  const handleUpdateItemText = async (itemId: string, text: string) => {
    if (!list) return;

    const updatedItems = items.map(item =>
      item.itemId === itemId ? { ...item, text } : item
    );
    setItems(updatedItems);
  };

  const handleBlurItemText = async (itemId: string, text: string) => {
    if (!list) return;

    // Only update if text changed from original
    const originalItem = list.items.find(i => i.itemId === itemId);
    if (originalItem && originalItem.text !== text) {
      try {
        const updatedList = await listsService.updateItem(list.listId, itemId, { text });
        dispatch(updateList(updatedList));
      } catch (error) {
        console.error('Failed to update item text:', error);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!list) return;

    // Optimistic update
    const updatedItems = items.filter(item => item.itemId !== itemId);
    setItems(updatedItems);

    try {
      const updatedList = await listsService.deleteItem(list.listId, itemId);
      dispatch(updateList(updatedList));
    } catch (error) {
      console.error('Failed to delete item:', error);
      setItems(items);
    }
  };

  const handleAddItem = async () => {
    if (!list || !newItemText.trim()) return;

    try {
      const updatedList = await listsService.addItem(list.listId, newItemText);
      dispatch(updateList(updatedList));
      setItems(updatedList.items);
      setNewItemText('');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  if (!list) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <TitleInput
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.itemId)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem key={item.itemId} id={item.itemId}>
                  <Checkbox
                    size="small"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item.itemId, item.completed)}
                    sx={{ p: 0.5, mr: 1 }}
                  />
                  <InputBase
                    value={item.text}
                    fullWidth
                    sx={{
                      fontSize: '0.875rem',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'text.secondary' : 'text.primary',
                    }}
                    onChange={(e) => handleUpdateItemText(item.itemId, e.target.value)}
                    onBlur={(e) => handleBlurItemText(item.itemId, e.target.value)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteItem(item.itemId)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, pl: 4 }}>
            <AddIcon sx={{ color: 'text.secondary', mr: 2, fontSize: 20 }} />
            <ItemInput
              placeholder="List item"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddItem}
            />
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
          borderTop: '1px solid rgba(0,0,0,0.12)'
        }}>
          <Button
            onClick={handleClose}
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
