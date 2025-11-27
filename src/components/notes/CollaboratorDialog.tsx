import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateList } from '../../store/slices/listsSlice';
import { listsService } from '../../services/listsService';
import { sendCollaboratorAdded, sendCollaboratorRemoved, sendPermissionChanged } from '../../services/socketService';
import type { List as ListType } from '../../store/slices/listsSlice';

interface CollaboratorDialogProps {
  open: boolean;
  onClose: () => void;
  list: ListType;
}

export default function CollaboratorDialog({ open, onClose, list }: CollaboratorDialogProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?._id === list.owner;

  const handleAddCollaborator = async () => {
    if (!email) return;
    try {
      const updatedList = await listsService.addCollaborator(list.listId, email);
      dispatch(updateList(updatedList));
      // Emit socket event
      const addedCollaborator = updatedList.collaborators.find(c => c.userId.email === email);
      if (addedCollaborator) {
        sendCollaboratorAdded(list.listId, addedCollaborator.userId._id);
      }
      setEmail('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    try {
      const collaboratorToRemove = list.collaborators.find(c => c.userId.email === email);
      const updatedList = await listsService.removeCollaborator(list.listId, email);
      dispatch(updateList(updatedList));
      // Emit socket event
      if (collaboratorToRemove) {
        sendCollaboratorRemoved(list.listId, collaboratorToRemove.userId._id);
      }
    } catch (err: any) {
      console.error('Failed to remove collaborator:', err);
    }
  };

  const handlePermissionChange = async (email: string, permission: 'view' | 'edit') => {
    try {
      const collaborator = list.collaborators.find(c => c.userId.email === email);
      const updatedList = await listsService.updateCollaboratorPermission(list.listId, email, permission);
      dispatch(updateList(updatedList));
      // Emit socket event
      if (collaborator) {
        sendPermissionChanged(list.listId, collaborator.userId._id, permission);
      }
    } catch (err: any) {
      console.error('Failed to update permission:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collaborators</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Person or email to share with"
            variant="outlined"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button onClick={handleAddCollaborator} disabled={!email} sx={{ ml: 1 }}>
            Add
          </Button>
        </Box>

        <List>
          {/* Owner */}
          <ListItem>
            <Box sx={{ mr: 2 }}>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </Box>
            <ListItemText
              primary="Owner"
              secondary="(You)"
            />
            <ListItemSecondaryAction>
              <Typography variant="body2" color="textSecondary">
                Owner
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>

          {/* Collaborators */}
          {list.collaborators.map((collab) => (
            <ListItem key={collab.userId._id}>
              <Box sx={{ mr: 2 }}>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </Box>
              <ListItemText
                primary={collab.userId.name || collab.userId.email}
                secondary={collab.userId.email}
              />
              <ListItemSecondaryAction>
                {isOwner ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Select
                      value={collab.permission}
                      onChange={(e) => handlePermissionChange(collab.userId.email, e.target.value as 'view' | 'edit')}
                      size="small"
                      sx={{ mr: 1, fontSize: '0.875rem' }}
                      variant="standard"
                    >
                      <MenuItem value="view">View</MenuItem>
                      <MenuItem value="edit">Edit</MenuItem>
                    </Select>
                    <IconButton edge="end" onClick={() => handleRemoveCollaborator(collab.userId.email)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {collab.permission}
                  </Typography>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
