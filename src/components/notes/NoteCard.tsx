import { styled } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  PushPinOutlined as PinIcon,
  PushPin as PinFilledIcon,
  ArchiveOutlined as ArchiveIcon,
  DeleteOutline as DeleteIcon,
  PersonAddOutlined as CollaboratorIcon,
} from '@mui/icons-material';
import type { List } from '../../store/slices/listsSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { updateList, deleteList as removeList } from '../../store/slices/listsSlice';
import { listsService } from '../../services/listsService';

interface NoteCardProps {
  list: List;
  onClick?: () => void;
}

const StyledCard = styled(Card)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  backgroundColor: '#ffffff',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  '&:hover': {
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    '& .note-actions': {
      opacity: 1,
    },
    '& .pin-button': {
      opacity: 1,
    },
  },
}));

const NoteActions = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 8px',
  opacity: 0,
  transition: 'opacity 0.2s',
  marginTop: 'auto',
}));

const PinButton = styled(IconButton)<{ ispinned?: string }>(({ ispinned }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  opacity: ispinned === 'true' ? 1 : 0,
  transition: 'opacity 0.2s',
  padding: 8,
}));

const NoteContent = styled(Box)(() => ({
  cursor: 'default',
}));

export default function NoteCard({ list, onClick }: NoteCardProps) {
  const dispatch = useAppDispatch();

  // Take only first 8 items for preview
  const previewItems = list.items.slice(0, 8);
  const remainingCount = list.items.length - 8;

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedList = await listsService.pinList(list.listId, !list.pinned);
      dispatch(updateList(updatedList));
    } catch (error) {
      console.error('Failed to pin list:', error);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedList = await listsService.archiveList(list.listId, !list.archived);
      dispatch(updateList(updatedList));
    } catch (error) {
      console.error('Failed to archive list:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await listsService.deleteList(list.listId);
        dispatch(removeList(list.listId));
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
  };

  return (
    <StyledCard onClick={onClick}>
      <PinButton
        className="pin-button"
        size="small"
        onClick={handlePin}
        ispinned={list.pinned ? 'true' : 'false'}
      >
        {list.pinned ? <PinFilledIcon /> : <PinIcon />}
      </PinButton>

      <CardContent sx={{ pb: 0, pt: 2, px: 2, cursor: 'pointer' }}>
        {list.name && (
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, fontSize: '1rem' }}>
            {list.name}
          </Typography>
        )}

        <NoteContent>
          {previewItems.map((item) => (
            <Box key={item.itemId} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Checkbox
                checked={item.completed}
                size="small"
                sx={{ p: 0.5, mr: 1 }}
                disabled
              />
              <Typography
                variant="body2"
                sx={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'text.secondary' : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}

          {remainingCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
              + {remainingCount} more items
            </Typography>
          )}
        </NoteContent>
      </CardContent>

      <NoteActions className="note-actions">
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Collaborator">
            <IconButton size="small">
              <CollaboratorIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={list.archived ? "Unarchive" : "Archive"}>
            <IconButton size="small" onClick={handleArchive}>
              <ArchiveIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </NoteActions>
    </StyledCard>
  );
}
