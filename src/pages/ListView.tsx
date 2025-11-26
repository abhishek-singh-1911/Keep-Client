import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';
import { joinListRoom, leaveListRoom, subscribeToUpdateList, sendListUpdate } from '../services/socketService';

function ListView() {
  const { listId } = useParams();
  const [content, setContent] = useState('');
  const [updates, setUpdates] = useState<string[]>([]);

  useEffect(() => {
    if (listId) {
      joinListRoom(listId);

      subscribeToUpdateList((changes) => {
        console.log('Received update:', changes);
        setUpdates(prev => [...prev, JSON.stringify(changes)]);
        if (changes.content) {
          setContent(changes.content);
        }
      });

      return () => {
        leaveListRoom(listId);
      };
    }
  }, [listId]);

  const handleUpdate = () => {
    if (listId) {
      sendListUpdate(listId, { content });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        p: 4
      }}
    >
      <Typography variant="h3" gutterBottom>List View: {listId}</Typography>

      <Box sx={{ mb: 4, width: '100%', maxWidth: 600 }}>
        <TextField
          fullWidth
          label="Edit Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleUpdate}>
          Send Update
        </Button>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 600, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
        <Typography variant="h6">Real-time Updates Log:</Typography>
        {updates.map((u, i) => (
          <Typography key={i} variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
            {u}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default ListView;
