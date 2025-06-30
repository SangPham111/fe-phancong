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
} from "@mui/material";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";
import { getCarWorkerHistory } from "../apis";

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

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                Lịch sử thay đổi thợ của xe: <strong>{carData.plateNumber}</strong>
            </Typography>

            <Typography variant="h6" mt={2}>
                🔧 <strong>Thợ hiện tại:</strong>
            </Typography>
            {carData.currentWorkers.length === 0 ? (
                <Typography>Không có thợ hiện tại.</Typography>
            ) : (
                <ul>
                    {carData.currentWorkers.map((worker, index) => {
                        const roleLabel =
                            worker.role === "main"
                                ? "Thợ chính"
                                : worker.role === "sub"
                                    ? "Thợ phụ"
                                    : worker.role;
                        return (
                            <li key={index}>
                                {worker.name} (<strong>{roleLabel}</strong>)
                            </li>
                        );
                    })}
                </ul>
            )}

            <Typography variant="h6" mt={4}>
                📜 <strong>Lịch sử thao tác:</strong>
            </Typography>
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
                                const actionText =
                                    log.action === "removed"
                                        ? "Đã Thay Đổi"
                                        : log.action === "added"
                                            ? "Thêm mới"
                                            : log.action;

                                const actionColor =
                                    log.action === "removed"
                                        ? "error.main"
                                        : log.action === "added"
                                            ? "success.main"
                                            : "text.primary";

                                return (
                                    <TableRow key={index}>
                                        <TableCell>{log.name}</TableCell>
                                        <TableCell sx={{ color: actionColor }}>{actionText}</TableCell>
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
