import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Divider,
    Chip,
    Avatar,
    Stack,
    Tooltip,
    Backdrop
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getCarWorkerHistory } from "../apis";
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const CarWorkerHistoryPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [carData, setCarData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCarWorkerHistory = async () => {
            try {
                const res = await getCarWorkerHistory(id);
                setCarData(res.data.data);
            } catch (err) {
                setError("Lỗi khi tải dữ liệu lịch sử thợ");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCarWorkerHistory();
    }, [id]);

    if (loading) return (
        <Backdrop open={true} sx={{ color: '#fff', zIndex: 9999 }}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box p={{ xs: 1, sm: 2, md: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={700}>
                Lịch sử thay đổi thợ của xe: <strong>{carData.plateNumber}</strong>
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <AutorenewIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        Thợ hiện tại:
                    </Typography>
                </Stack>
                {carData.currentWorkers.length === 0 ? (
                    <Typography>Không có thợ hiện tại.</Typography>
                ) : (
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        {carData.currentWorkers.map((worker, index) => {
                            const roleLabel =
                                worker.role === "main"
                                    ? "Thợ chính"
                                    : worker.role === "sub"
                                        ? "Thợ phụ"
                                        : worker.role;
                            const chipColor = worker.role === "main" ? "primary" : worker.role === "sub" ? "secondary" : "default";
                            return (
                                <Chip
                                    key={index}
                                    avatar={<Avatar><PersonIcon /></Avatar>}
                                    label={<><b>{worker.name}</b> <span style={{ fontWeight: 400 }}>({roleLabel})</span></>}
                                    color={chipColor}
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            );
                        })}
                    </Stack>
                )}
            </Paper>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Typography variant="h6" fontWeight={600}>
                    📜 Lịch sử thao tác:
                </Typography>
            </Stack>
            <Paper elevation={3} sx={{ mt: 1, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Thợ</strong></TableCell>
                                <TableCell><strong>Hành động</strong></TableCell>
                                <TableCell><strong>Ghi chú</strong></TableCell>
                                <TableCell><strong>Thời gian</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carData.historyLogs.map((log, index) => {
                                let actionText = log.action;
                                let actionColor = "text.primary";
                                let ActionIcon = PersonIcon;
                                if (log.action === "removed") {
                                    actionText = "Đã Thay Đổi";
                                    actionColor = "error.main";
                                    ActionIcon = RemoveCircleIcon;
                                } else if (log.action === "added") {
                                    actionText = "Thêm mới";
                                    actionColor = "success.main";
                                    ActionIcon = AddCircleIcon;
                                }
                                return (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'background.paper',
                                            transition: 'background 0.2s',
                                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar sx={{ width: 28, height: 28 }}><PersonIcon fontSize="small" /></Avatar>
                                                <span>{log.name}</span>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: actionColor, fontWeight: 600 }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <ActionIcon fontSize="small" />
                                                <span>{actionText}</span>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {log.note
                                                ?.replace("waiting_handover", "Chờ giao xe cho khách hàng")
                                                .replace("additional_repair", "Đang sửa bổ sung")}
                                        </TableCell>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        </Box>
    );
};

export default CarWorkerHistoryPage;
