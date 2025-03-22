'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useUsers } from '../hooks/useUsers';

export default function UsersPage() {
  const { users, isLoading, error } = useUsers();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Uživatelé
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : users.length === 0 ? (
          <Typography>Žádní uživatelé nebyli nalezeni</Typography>
        ) : (
          <List>
            {users.map((user, index) => (
              <Box key={user.id}>
                <ListItem>
                  <ListItemText 
                    primary={user.displayName || user.username}
                    secondary={`${user.email} - ${user.role}`}
                  />
                </ListItem>
                {index < users.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
} 