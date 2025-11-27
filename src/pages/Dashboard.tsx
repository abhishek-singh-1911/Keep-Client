import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import MainLayout from '../components/layout/MainLayout';
import NoteInput from '../components/notes/NoteInput';
import NoteCard from '../components/notes/NoteCard';
import EditNoteDialog from '../components/notes/EditNoteDialog';
import MasonryGrid from '../components/layout/MasonryGrid';
import { SortableNoteCard } from '../components/notes/SortableNoteCard';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setLists, setLoading, setError, type List } from '../store/slices/listsSlice';
import { listsService } from '../services/listsService';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { lists, loading } = useAppSelector((state) => state.lists);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNoteClick = (list: List) => {
    setSelectedList(list);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedList(null);
    setIsDialogOpen(false);
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Determine if we're in pinned or unpinned section
      const isPinned = pinnedLists.some(list => list.listId === active.id);
      const sourceList = isPinned ? pinnedLists : unpinnedLists;

      const oldIndex = sourceList.findIndex((list) => list.listId === active.id);
      const newIndex = sourceList.findIndex((list) => list.listId === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedSection = arrayMove(sourceList, oldIndex, newIndex);

      let pinnedIndex = 0;
      let unpinnedIndex = 0;

      // Update the full lists array
      const updatedLists = lists.map(list => {
        if (list.archived) return list;

        if (list.pinned) {
          if (isPinned) {
            const item = reorderedSection[pinnedIndex];
            pinnedIndex++;
            return item;
          }
          return list;
        }

        // Unpinned list
        if (!isPinned) {
          const item = reorderedSection[unpinnedIndex];
          unpinnedIndex++;
          return item;
        }
        return list;
      });

      // Optimistically update UI
      dispatch(setLists(updatedLists));

      try {
        const listIds = updatedLists.map(list => list.listId);
        console.log('Sending reorder request with IDs:', listIds);
        await listsService.reorderLists(listIds);
        console.log('Successfully reordered lists on backend');
      } catch (error: any) {
        console.warn('Failed to persist list order to backend:', error.message || error);
        console.warn('Order will be maintained locally but may reset on page refresh');
        // Don't revert - keep the local order even if backend fails
      }
    }
  };

  // Filter out archived lists and separate pinned from unpinned
  const activeLists = lists.filter(list => !list.archived);
  const pinnedLists = activeLists.filter(list => list.pinned);
  const unpinnedLists = activeLists.filter(list => !list.pinned);

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <NoteInput />

        {loading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1200, mt: 4 }}>
            {activeLists.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <span className="material-icons-outlined" style={{ fontSize: 120, color: '#e0e0e0' }}>lightbulb</span>
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  Notes you add appear here
                </Typography>
              </Box>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                {pinnedLists.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ ml: 1, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                      PINNED
                    </Typography>
                    <SortableContext
                      items={pinnedLists.map(list => list.listId)}
                      strategy={rectSortingStrategy}
                    >
                      <MasonryGrid>
                        {pinnedLists.map((list) => (
                          <SortableNoteCard key={list.listId} id={list.listId}>
                            <NoteCard
                              list={list}
                              onClick={() => handleNoteClick(list)}
                            />
                          </SortableNoteCard>
                        ))}
                      </MasonryGrid>
                    </SortableContext>
                  </>
                )}

                {unpinnedLists.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ ml: 1, mb: 1, mt: pinnedLists.length > 0 ? 4 : 0, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                      OTHERS
                    </Typography>
                    <SortableContext
                      items={unpinnedLists.map(list => list.listId)}
                      strategy={rectSortingStrategy}
                    >
                      <MasonryGrid>
                        {unpinnedLists.map((list) => (
                          <SortableNoteCard key={list.listId} id={list.listId}>
                            <NoteCard
                              list={list}
                              onClick={() => handleNoteClick(list)}
                            />
                          </SortableNoteCard>
                        ))}
                      </MasonryGrid>
                    </SortableContext>
                  </>
                )}
              </DndContext>
            )}
          </Box>
        )}
        <EditNoteDialog
          open={isDialogOpen}
          list={selectedList}
          onClose={handleDialogClose}
        />
      </Box>
    </MainLayout>
  );
}
