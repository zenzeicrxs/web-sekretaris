'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Fade,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';
import { UPLOAD_URL } from '@/config/api'; // Sesuaikan dengan URL upload file

// Styled components (tetap sama seperti sebelumnya)
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px',
  marginBottom: { xs: '8px', sm: '24px' },
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#1a237e',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px',
  width: '100%',
  fontSize: '1rem',
  marginBottom: '16px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
  },
  [theme.breakpoints.up('sm')]: {
    display: 'none'
  }
}));

const DesktopAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#1a237e',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: 'none',
  '& .MuiTableCell-head': {
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    color: '#1a237e'
  }
}));

export default function SuratKeluar() {
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: '',
    perihal: '',
    penerima: '',
    fileSurat: null
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await suratService.getAllSuratKeluar();
      setRows(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlertMessage('Gagal mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fileSurat') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      tanggal: '',
      perihal: '',
      penerima: '',
      fileSurat: null
    });
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      tanggal: row.tanggal,
      perihal: row.perihal,
      penerima: row.penerima,
      fileSurat: null
    });
    if (row.fileSurat) {
      setPreviewUrl(`${UPLOAD_URL}${row.fileSurat}`);
    } else {
      setPreviewUrl('');
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      showAlertMessage('Data tidak valid untuk dihapus (No/ID tidak ditemukan)', 'error');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus surat keluar dengan No ${id}?`)) {
      return;
    }

    try {
      setLoading(true);
      await suratService.deleteSuratKeluar(id);
      await fetchData();
      showAlertMessage(`Surat keluar dengan No ${id} berhasil dihapus`, 'success');
    } catch (error) {
      console.error('Error deleting data:', error);
      showAlertMessage(`Gagal menghapus surat keluar: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSave = async () => {
    if (!formData.tanggal || !formData.perihal || !formData.penerima) {
      showAlertMessage('Semua field harus diisi', 'error');
      return;
    }

    if (!editingId && !formData.fileSurat) {
      showAlertMessage('File surat harus diupload', 'error');
      return;
    }

    try {
      setLoading(true);
      const data = {
        tanggal: formData.tanggal,
        perihal: formData.perihal,
        penerima: formData.penerima,
        fileSurat: formData.fileSurat
      };

      if (editingId) {
        if (formData.fileSurat) {
          await suratService.updateSuratKeluar(editingId, data);
        } else {
          const { fileSurat, ...dataWithoutFile } = data;
          await suratService.updateSuratKeluar(editingId, dataWithoutFile);
        }
        showAlertMessage('Data berhasil diperbarui', 'success');
      } else {
        await suratService.addSuratKeluar(data);
        showAlertMessage('Data berhasil ditambahkan', 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      showAlertMessage(error.message || 'Gagal menyimpan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setPreviewUrl('');
  };

  return (
    <Box sx={{ 
      padding: '24px',
      mt: { xs: '64px', sm: '80px' }
    }}>
      <Fade in={showAlert}>
        <Alert 
          severity={alertType}
          sx={{ 
            position: 'fixed', 
            top: 24, 
            right: 24, 
            zIndex: 9999,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}
        >
          {alertMessage}
        </Alert>
      </Fade>

      <HeaderBox>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Data Surat Keluar
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Total Surat Keluar: {rows.length}
          </Typography>
        </Box>
        <DesktopAddButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Tambah Surat Keluar
        </DesktopAddButton>
      </HeaderBox>

      <AddButton
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAdd}
      >
        Tambah Surat Keluar
      </AddButton>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 3, color: '#1a237e' }}>
            Kelola data surat keluar dengan mudah
          </Typography>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Perihal</TableCell>
                  <TableCell>Penerima</TableCell>
                  <TableCell>File Surat</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <SendIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Belum ada data surat keluar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow 
                      key={row.id} 
                      sx={{ 
                        '&:hover': { 
                          bgcolor: '#f8f9fa',
                          '& .action-buttons': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.tanggal}</TableCell>
                      <TableCell>{row.perihal}</TableCell>
                      <TableCell>{row.penerima}</TableCell>
                      <TableCell>
                        {row.fileSurat ? (
                          <IconButton
                            size="small"
                            onClick={() => window.open(`${UPLOAD_URL}${row.fileSurat}`, '_blank')}
                          >
                            <DescriptionIcon />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Tidak ada file
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box 
                          className="action-buttons"
                          sx={{ 
                            opacity: { xs: 1, sm: 0.5 },
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1
                          }}
                        >
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(row)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(row.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </StyledCard>

      <Dialog 
        open={showModal} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            maxHeight: '90vh',
            margin: '16px',
            width: 'calc(100% - 32px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }
        }}>
          {editingId ? (
            <>
              <EditIcon sx={{ fontSize: 28 }} />
              Edit Surat Keluar
            </>
          ) : (
            <>
              <AddIcon sx={{ fontSize: 28 }} />
              Tambah Surat Keluar
            </>
          )}
        </DialogTitle>

        <DialogContent 
          sx={{ 
            py: 4,
            px: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#666',
              },
            },
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#1a237e' }}>
              Informasi Surat Keluar
            </Typography>
            <Divider />
          </Box>

          <TextField
            label="Tanggal"
            name="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ 
              shrink: true,
              sx: { fontWeight: 500 }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                  borderWidth: '2px',
                }
              }
            }}
          />

          <TextField
            label="Perihal"
            name="perihal"
            value={formData.perihal}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                  borderWidth: '2px',
                }
              }
            }}
          />

          <TextField
            label="Penerima"
            name="penerima"
            value={formData.penerima}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                  borderWidth: '2px',
                }
              }
            }}
          />

          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontWeight: 500,
                color: theme => theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <DescriptionIcon sx={{ fontSize: 20 }} />
              Upload File Surat *
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: theme => theme.palette.divider,
                borderRadius: '12px',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#1a237e',
                  bgcolor: 'rgba(26, 35, 126, 0.04)'
                }
              }}
            >
              <input
                accept=".pdf,.doc,.docx"
                type="file"
                name="fileSurat"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                {previewUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1">
                      File sudah diupload
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 3 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Klik atau seret file surat ke sini
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Format yang didukung: PDF, DOC, DOCX (Maks. 5MB)
                    </Typography>
                  </Box>
                )}
              </label>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          px: 4,
          py: 3,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          gap: 2,
          bgcolor: 'rgba(0, 0, 0, 0.02)'
        }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{ 
              borderRadius: '10px',
              borderColor: '#666',
              color: '#666',
              '&:hover': {
                borderColor: '#1a237e',
                color: '#1a237e',
                bgcolor: 'rgba(26, 35, 126, 0.04)'
              },
              px: 3,
              py: 1
            }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{ 
              borderRadius: '10px',
              bgcolor: '#1a237e',
              '&:hover': { 
                bgcolor: '#0d47a1'
              },
              px: 3,
              py: 1,
              gap: 1
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                Menyimpan...
              </>
            ) : (
              <>
                <DescriptionIcon />
                Simpan
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}