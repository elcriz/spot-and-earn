import { CircularProgress, Container } from "@mui/material";

export default function Loader() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Container>
  );
}
