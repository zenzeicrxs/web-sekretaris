'use client';

import { Box, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SendIcon from '@mui/icons-material/Send';
import SearchHistory from '@/components/dashboard/search-history';
import { colors } from '@/styles/colors';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, getHeaders } from '@/config/api';

// Buat tema MUI
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
});

// Styled Components
const StyledCard = styled(Card)`
  background: ${({ variant }) => {
    const gradients = {
      blue: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
      green: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      red: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
      purple: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
    };
    return gradients[variant] || gradients.blue;
  }};
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 140px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
    opacity: 0.6;
    z-index: 1;
  }
`;

const IconWrapper = styled(Box)`
  position: absolute;
  right: -20px;
  bottom: -20px;
  opacity: 0.2;
  z-index: 0;
`;

const ContentWrapper = styled(Box)`
  position: relative;
  z-index: 2;
  padding: 24px;
`;

const HistoryCard = styled(Card)`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

export default function Dashboard() {
  const [daftarSurat, setDaftarSurat] = useState([]); // Data surat masuk dan keluar
  const [filteredDaftarSurat, setFilteredDaftarSurat] = useState([]); // Data yang difilter
  const [searchQuery, setSearchQuery] = useState(''); // Query pencarian
  const [totalSuratMasuk, setTotalSuratMasuk] = useState(0); // Total surat masuk
  const [totalSuratKeluar, setTotalSuratKeluar] = useState(0); // Total surat keluar
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state


   // Fungsi untuk mengambil data surat masuk
   const fetchSuratMasuk = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SURAT_MASUK_GET_ALL, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data surat masuk');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching surat masuk:', error);
      throw error;
    }
  };

  // Fungsi untuk mengambil data surat keluar
  const fetchSuratKeluar = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SURAT_KELUAR_GET_ALL, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data surat keluar');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching surat keluar:', error);
      throw error;
    }
  };


 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil data surat masuk dan surat keluar
      const [dataSuratMasuk, dataSuratKeluar] = await Promise.all([
        fetchSuratMasuk(),
        fetchSuratKeluar(),
      ]);

      // Tambahkan field `jenisSurat` ke setiap data
      const suratMasukWithType = dataSuratMasuk.map((item) => ({ ...item, jenisSurat: 'masuk' }));
      const suratKeluarWithType = dataSuratKeluar.map((item) => ({ ...item, jenisSurat: 'keluar' }));

      // Gabungkan data surat masuk dan surat keluar
      const combinedData = [...suratMasukWithType, ...suratKeluarWithType];
      setDaftarSurat(combinedData);
      setFilteredDaftarSurat(combinedData);

      // Hitung total surat masuk dan surat keluar
      setTotalSuratMasuk(dataSuratMasuk.length); // Perbarui state totalSuratMasuk
      setTotalSuratKeluar(dataSuratKeluar.length); // Perbarui state totalSuratKeluar

      // Log jumlah data
      console.log('Jumlah Surat Masuk:', dataSuratMasuk.length);
      console.log('Jumlah Surat Keluar:', dataSuratKeluar.length);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  // Filter data berdasarkan pencarian
  useEffect(() => {
    const filtered = daftarSurat.filter(
      (item) =>
        item.perihal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenisSurat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tanggalSurat?.includes(searchQuery)
    );
    setFilteredDaftarSurat(filtered);
  }, [searchQuery, daftarSurat]);

  // Fungsi untuk menangani pencarian
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, padding: { xs: '16px', sm: '24px', md: '32px' } }}>
        {/* Welcome Card */}
        <StyledCard variant="blue">
          <ContentWrapper>
            <Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.5rem' }, mb: 2 }}>
                Selamat Datang di Sistem Persuratan Desa
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, opacity: 0.8, mb: 4 }}>
                Kelola persuratan desa dengan lebih mudah dan efisien
              </Typography>
            </Box>
          </ContentWrapper>
          <IconWrapper>
            <MarkEmailReadIcon sx={{ fontSize: '180px' }} />
          </IconWrapper>
        </StyledCard>

        {/* Cards Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard variant="green">
              <ContentWrapper>
                <Typography variant="subtitle1" sx={{ opacity: 0.8, mb: 1 }}>
                  Surat Masuk
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalSuratMasuk}
                </Typography>
              </ContentWrapper>
              <IconWrapper>
                <MarkEmailReadIcon sx={{ fontSize: '120px' }} />
              </IconWrapper>
            </StyledCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StyledCard variant="red">
              <ContentWrapper>
                <Typography variant="subtitle1" sx={{ opacity: 0.8, mb: 1 }}>
                  Surat Keluar
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalSuratKeluar}
                </Typography>
              </ContentWrapper>
              <IconWrapper>
                <SendIcon sx={{ fontSize: '120px' }} />
              </IconWrapper>
            </StyledCard>
          </Grid>
        </Grid>

        {/* History Section */}
        <HistoryCard>
          <CardHeader
            title={
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Daftar Surat
              </Typography>
            }
            action={
              <SearchHistory
                placeholder="Cari surat..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            }
            sx={{ borderBottom: '1px solid #eee', p: 3 }}
          />
          <CardBody sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              {/* Informasi Jumlah Data */}
             
              {/* Tabel */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#1a237e', fontWeight: 600 }}>No Surat</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#1a237e', fontWeight: 600 }}>Perihal</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#1a237e', fontWeight: 600 }}>Jenis Surat</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#1a237e', fontWeight: 600 }}>Tanggal Surat</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#1a237e', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : filteredDaftarSurat.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                        <MarkEmailReadIcon style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                        <Typography variant="body1" color="textSecondary">
                          {searchQuery ? 'Tidak ada surat yang sesuai dengan pencarian' : 'Belum ada data surat'}
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    filteredDaftarSurat.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '16px' }}>{item.nomor}</td>
                        <td style={{ padding: '16px' }}>{item.perihal}</td>
                        <td style={{ padding: '16px' }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: '12px',
                              bgcolor: item.jenisSurat === 'masuk' ? '#e8f5e9' : '#ffebee',
                              color: item.jenisSurat === 'masuk' ? '#2e7d32' : '#d32f2f',
                              fontWeight: 500,
                            }}
                          >
                            {item.jenisSurat === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                          </Box>
                        </td>
                        <td style={{ padding: '16px' }}>{item.tanggal}</td>
                        <td style={{ padding: '16px', textAlign: 'right', color: item.status === 'selesai' ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                          {item.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          </CardBody>
        </HistoryCard>
      </Box>
    </ThemeProvider>
  );
}