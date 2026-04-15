import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useApp } from '../hooks/useApp';
import { Child } from '../models/types';
import packageJson from '../../package.json';

export default function SettingsPage() {
  const { children, addChild, removeChild, updateChild, loading } = useApp();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddChild = async () => {
    if (newChildName.trim()) {
      await addChild(newChildName.trim());
      setNewChildName('');
      setAddDialogOpen(false);
    }
  };

  const handleEditChild = async () => {
    if (editingChild && editName.trim()) {
      await updateChild({ ...editingChild, name: editName.trim() });
      setEditingChild(null);
      setEditName('');
      setEditDialogOpen(false);
    }
  };

  const handleRemoveChild = async (child: Child) => {
    if (
      window.confirm(
        `Remove ${child.name}? Their sighting history will be preserved.`
      )
    ) {
      await removeChild(child.id);
    }
  };

  const openEditDialog = (child: Child) => {
    setEditingChild(child);
    setEditName(child.name);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center">Settings</Typography>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Children</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              size="small"
            >
              Add Child
            </Button>
          </Box>

          {children.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No children added yet. Click "Add Child" to get started.
            </Typography>
          ) : (
            <List>
              {children.map((child, index) => (
                <ListItem
                  key={child.id}
                  sx={{
                    borderBottom: index < children.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    px: 0,
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => openEditDialog(child)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveChild(child)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {child.name}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Paper elevation={1} sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'info.dark' : 'info.light' }}>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.dark' }}>
            💡 Removing a child does not delete their sighting history
          </Typography>
        </Paper>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ pt: 2 }}>
          Version {packageJson.version}
        </Typography>
      </Stack>

      {/* Add Child Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Child</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Child's Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddChild();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddChild} variant="contained" disabled={!newChildName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Child Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Child</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Child's Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditChild();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditChild} variant="contained" disabled={!editName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
