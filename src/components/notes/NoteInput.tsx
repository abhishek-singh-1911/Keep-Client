import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  InputBase,
  Box,
  IconButton,
  Button,
  ClickAwayListener,
  Checkbox,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckBoxOutlined as CheckBoxIcon,
  PushPinOutlined as PinIcon,
  PersonAddOutlined as CollaboratorIcon,
  ArchiveOutlined as ArchiveIcon,
  DeleteOutline as DeleteIcon,
  UndoOutlined as UndoIcon,
  RedoOutlined as RedoIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/useRedux';
import { listsService } from '../../services/listsService';
import { addList } from '../../store/slices/listsSlice';

const InputContainer = styled(Paper)(() => ({
  width: '100%',
  maxWidth: '600px',
  margin: '32px auto',
  borderRadius: 8,
  boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
}));

const TitleInput = styled(InputBase)(() => ({
  width: '100%',
  padding: '12px 16px',
  fontSize: '1rem',
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

const ActionButton = styled(IconButton)(() => ({
  padding: 8,
  '& svg': {
    fontSize: 20,
  },
}));

interface NewItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function NoteInput() {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<NewItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const handleExpand = () => setIsExpanded(true);

  const handleCollapse = async () => {
    if (title.trim() || items.length > 0 || newItemText.trim()) {
      await saveList();
    }
    setIsExpanded(false);
    setTitle('');
    setItems([]);
    setNewItemText('');
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setItems([
        ...items,
        { id: Date.now().toString(), text: newItemText, completed: false }
      ]);
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const saveList = async () => {
    try {
      // 1. Create the list
      const listName = title || 'Untitled List';
      const createdList = await listsService.createList(listName);

      // 2. Add items if any
      const itemsToAdd = [...items];
      if (newItemText.trim()) {
        itemsToAdd.push({ id: 'temp', text: newItemText, completed: false });
      }

      // We need to add items sequentially or in parallel
      // For simplicity in this demo, we'll just add them one by one
      // In a real app, we'd want a bulk add endpoint
      for (const item of itemsToAdd) {
        await listsService.addItem(createdList.listId, item.text);
      }

      // 3. Fetch full list to get everything properly
      const fullList = await listsService.getList(createdList.listId);
      dispatch(addList(fullList));

    } catch (error) {
      console.error('Failed to save list:', error);
    }
  };

  return (
    <ClickAwayListener onClickAway={() => isExpanded && handleCollapse()}>
      <InputContainer>
        {!isExpanded ? (
          <Box
            onClick={handleExpand}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: '12px 16px',
              cursor: 'text'
            }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
              Take a note...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="New List">
                <ActionButton size="small"><CheckBoxIcon /></ActionButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 1 }}>
              <TitleInput
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <Tooltip title="Pin note">
                <IconButton sx={{ mt: 1 }}>
                  <PinIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ px: 2, py: 1 }}>
              {items.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox
                    size="small"
                    checked={item.completed}
                    sx={{ p: 0.5, mr: 1 }}
                  />
                  <InputBase
                    value={item.text}
                    fullWidth
                    sx={{ fontSize: '0.875rem' }}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].text = e.target.value;
                      setItems(newItems);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== index);
                      setItems(newItems);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
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
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1,
              py: 1,
              mt: 1
            }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Collaborator">
                  <ActionButton size="small"><CollaboratorIcon /></ActionButton>
                </Tooltip>
                <Tooltip title="Archive">
                  <ActionButton size="small"><ArchiveIcon /></ActionButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <ActionButton size="small"><DeleteIcon /></ActionButton>
                </Tooltip>
                <Tooltip title="Undo">
                  <span>
                    <ActionButton size="small" disabled><UndoIcon /></ActionButton>
                  </span>
                </Tooltip>
                <Tooltip title="Redo">
                  <span>
                    <ActionButton size="small" disabled><RedoIcon /></ActionButton>
                  </span>
                </Tooltip>
              </Box>

              <Button
                onClick={handleCollapse}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </InputContainer>
    </ClickAwayListener>
  );
}
