import { useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import NoteCard from '../components/notes/NoteCard';
import MasonryGrid from '../components/layout/MasonryGrid';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setLists, setLoading, setError } from '../store/slices/listsSlice';
import { listsService } from '../services/listsService';
import {
  subscribeToCollaboratorAdded,
  subscribeToCollaboratorRemoved,
  subscribeToPermissionChanged,
  subscribeToUpdateList,
} from '../services/socketService';

export default function Archive() {
  const dispatch = useAppDispatch();
  const { lists, loading } = useAppSelector((state) => state.lists);

  // Memoize the fetchLists function so it can be used in multiple places
  const fetchLists = useCallback(async () => {
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
  }, [dispatch]);

  // Initial fetch of lists
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Subscribe to real-time collaboration events
  useEffect(() => {
    // Set up socket event listeners for collaboration changes
    subscribeToCollaboratorAdded((data) => {
      console.log('Collaborator added, refetching lists...', data);
      fetchLists();
    });

    subscribeToCollaboratorRemoved((data) => {
      console.log('Collaborator removed, refetching lists...', data);
      fetchLists();
    });

    subscribeToPermissionChanged((data) => {
      console.log('Permission changed, refetching lists...', data);
      fetchLists();
    });

    // Subscribe to list content updates for real-time editing
    subscribeToUpdateList((changes) => {
      console.log('List updated, refetching lists...', changes);
      fetchLists();
    });
  }, [fetchLists]);

  // Filter only archived lists
  const archivedLists = lists.filter(list => list.archived);

  // Get search query from UI state
  const { searchQuery } = useAppSelector((state) => state.ui);

  // Filter lists based on search query
  const filteredArchivedLists = (() => {
    if (!searchQuery.trim()) return archivedLists;

    const query = searchQuery.toLowerCase();
    return archivedLists.filter(list => {
      // Search in list name
      if (list.name.toLowerCase().includes(query)) return true;

      // Search in list items text
      const hasMatchingItem = list.items.some(item =>
        item.text.toLowerCase().includes(query)
      );

      return hasMatchingItem;
    });
  })();

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
            ) : filteredArchivedLists.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <span className="material-icons-outlined" style={{ fontSize: 120, color: '#e0e0e0' }}>search_off</span>
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  No archived notes match "{searchQuery}"
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="overline" sx={{ ml: 1, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                  ARCHIVED
                </Typography>
                <MasonryGrid>
                  {filteredArchivedLists.map((list) => (
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
