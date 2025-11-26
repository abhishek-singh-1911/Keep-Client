import { Box, Typography } from '@mui/material';

function ListView() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h3">List View Page</Typography>
    </Box>
  );
}

export default ListView;
