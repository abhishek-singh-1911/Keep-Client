import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  spacing?: number;
}

const GridContainer = styled(Box)(({ theme }) => ({
  columnGap: '16px',
  [theme.breakpoints.up('xs')]: {
    columnCount: 1,
  },
  [theme.breakpoints.up('sm')]: {
    columnCount: 2,
  },
  [theme.breakpoints.up('md')]: {
    columnCount: 3,
  },
  [theme.breakpoints.up('lg')]: {
    columnCount: 4,
  },
  [theme.breakpoints.up('xl')]: {
    columnCount: 5,
  },
}));

const GridItem = styled(Box)(({ }) => ({
  breakInside: 'avoid',
  marginBottom: '16px',
}));

import { useAppSelector } from '../../hooks/useRedux';

export default function MasonryGrid({ children }: MasonryGridProps) {
  const { viewMode } = useAppSelector((state) => state.ui);

  return (
    <GridContainer
      sx={
        viewMode === 'list'
          ? {
            columnCount: '1 !important',
            maxWidth: '600px',
            margin: '0 auto',
          }
          : {}
      }
    >
      {React.Children.map(children, (child) => (
        <GridItem>{child}</GridItem>
      ))}
    </GridContainer>
  );
}
