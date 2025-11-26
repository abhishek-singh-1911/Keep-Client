import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import NoteCard from '../components/notes/NoteCard';
import MasonryGrid from '../components/layout/MasonryGrid';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setLists, setLoading, setError } from '../store/slices/listsSlice';
import { listsService } from '../services/listsService';

export default function Archive() {
  const dispatch = useAppDispatch();
  const { lists, loading } = useAppSelector((state) => state.lists);

  useEffect(() => {
    const fetchLists = async () => {
      dispatch(setLoading(true));
      try {
        // Fetch all lists from the backend
        const data = await listsService.getAllLists();
        dispatch(setLists(data));
        dispatch(setLoading(false));
      } catch (error) {
        console.error('Failed to fetch lists:', error);
        dispatch(setError('Failed to load notes'));
        dispatch(setLoading(false));
      }
    };

    fetchLists();
  }, [dispatch]);

  // Filter only archived lists
  const archivedLists = lists.filter(list => list.archived);

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 4 }}>
        {loading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            {archivedLists.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <span className="material-icons-outlined" style={{ fontSize: 120, color: '#e0e0e0' }}>archive</span>
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  Your archived notes appear here
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="overline" sx={{ ml: 1, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                  ARCHIVED
                </Typography>
                <MasonryGrid>
                  {archivedLists.map((list) => (
                    <NoteCard
                      key={list.listId}
                      list={list}
                      onClick={() => console.log('Clicked note:', list.listId)}
                    />
                  ))}
                </MasonryGrid>
              </>
            )}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
