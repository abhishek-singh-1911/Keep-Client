import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import NoteCard from '../components/notes/NoteCard';
import MasonryGrid from '../components/layout/MasonryGrid';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setLists, setLoading, setError } from '../store/slices/listsSlice';
import { listsService } from '../services/listsService';

export default function Collaborated() {
  const dispatch = useAppDispatch();
  const { lists, loading } = useAppSelector((state) => state.lists);
  const currentUser = useAppSelector((state) => state.auth.user);

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

  // Filter only lists where current user is a collaborator (not owner)
  const collaboratedLists = lists.filter(list =>
    list.owner !== currentUser?._id && !list.archived
  );

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 4 }}>
        {loading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            {collaboratedLists.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <span className="material-icons-outlined" style={{ fontSize: 120, color: '#e0e0e0' }}>people</span>
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  Notes shared with you appear here
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="overline" sx={{ ml: 1, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                  COLLABORATED
                </Typography>
                <MasonryGrid>
                  {collaboratedLists.map((list) => (
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
