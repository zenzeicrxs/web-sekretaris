'use client';
import { useState, useEffect, useCallback } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FileUpload from '@/components/fileupload'; // Komponen terpisah untuk upload file
import { API_ENDPOINTS, getHeaders, API_BASE_URL } from '@/config/api'; // Import endpoint dan headers

// Styled components
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
  marginBottom: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
}));

export default function SuratMasuk() {
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nomor: '',
    tanggal: '',
    perihal: '',
    asal: '',
    file: null
  });
  const [previewFile, setPreviewFile] = useState(null); // Untuk pratinjau file
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SURAT_MASUK_GET_ALL, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data surat masuk');
      }

      const data = await response.json();
      setRows(data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data surat masuk');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, file }));
      setPreviewFile(URL.createObjectURL(file)); // Buat pratinjau file
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle add/edit surat masuk
  const handleSave = async () => {
    if (!formData.nomor || !formData.tanggal || !formData.perihal || !formData.asal) {
      setError('Semua field harus diisi');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('nomor', formData.nomor);
      data.append('tanggal', formData.tanggal);
      data.append('perihal', formData.perihal);
      data.append('asal', formData.asal);
      if (formData.file) {
        data.append('file', formData.file);
      }

      const endpoint = editingId 
        ? API_ENDPOINTS.SURAT_MASUK_UPDATE(editingId) 
        : API_ENDPOINTS.SURAT_MASUK_ADD;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        body: data,
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data');
      }

      setShowModal(false);
      fetchData(); // Refresh data setelah berhasil menyimpan
    } catch (err) {
      setError('Gagal menyimpan data');
      console.error('Error saving data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete surat masuk
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak dapat mengembalikan data ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a237e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.SURAT_MASUK_DELETE(id), {
          method: 'DELETE',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error('Gagal menghapus data');
        }

        Swal.fire('Terhapus!', 'Data surat masuk telah dihapus.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error!', 'Gagal menghapus data.', 'error');
        console.error('Error deleting data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form and open modal for adding new surat
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nomor: '',
      tanggal: '',
      perihal: '',
      asal: '',
      file: null // Reset file hanya saat menambah data baru
    });
    setPreviewFile(null);
    setShowModal(true);
  };

  // Open modal for editing surat
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      nomor: row.nomor,
      tanggal: row.tanggal,
      perihal: row.perihal,
      asal: row.asal,
      file: row.file // Simpan file yang sudah ada
    });
    setPreviewFile(row.file ? `${API_BASE_URL}/${row.file}` : null); // Tampilkan pratinjau file
    setShowModal(true);
  };

  return (
    <Box sx={{ padding: '24px' }}>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Data Surat Masuk
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ backgroundColor: 'white', color: '#1a237e' }}
        >
          Tambah Surat Masuk
        </Button>
      </HeaderBox>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <StyledCard>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                 
                  <TableCell>Nomor Surat</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Perihal</TableCell>
                  <TableCell>Asal</TableCell>
                  <TableCell>File Surat</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="textSecondary">
                        Belum ada data surat masuk
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={row.id}>
                
                      <TableCell>{row.nomor}</TableCell>
                      <TableCell>{row.tanggal}</TableCell>
                      <TableCell>{row.perihal}</TableCell>
                      <TableCell>{row.asal}</TableCell>
                      <TableCell>
                        {row.file && (
                          <IconButton onClick={() => window.open(`${API_BASE_URL}/${row.file}`, '_blank')}>
                            <DescriptionIcon />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => handleDelete(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nomor"
            name="nomor"
            value={formData.nomor}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="Contoh: 001/SM/2023"
            required
          />
          <TextField
            label="Tanggal"
            name="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Perihal"
            name="perihal"
            value={formData.perihal}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Asal"
            name="asal"
            value={formData.asal}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              File Surat
            </Typography>
            <FileUpload
              label="Upload File"
              name="file"
              onChange={handleInputChange}
              accept=".pdf,.doc,.docx"
            />
            {previewFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Pratinjau File:</Typography>
                <iframe
                  src={previewFile}
                  width="100%"
                  height="300px"
                  style={{ border: 'none' }}
                  title="Pratinjau File"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Batal</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}