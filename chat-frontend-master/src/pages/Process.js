import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import './Process.css'; // 匯入CSS樣式
import Swal from 'sweetalert2';
function Process() {
    const [processData, setProcessData] = useState([]);
    const user = useSelector((state) => state.user);
    const userID = user && user._id;

    useEffect(() => {
        if (user && user._id) {
            fetchProcessData();
        }
    }, [user]);

    async function fetchProcessData() {
        try {
            const response = await axios.get('http://localhost:5001/admin/process', {
                params: {
                    fromId: userID,
                },
            });
            const data = response.data;
            setProcessData(data);
        } catch (error) {
            console.log(error);
        }
    }


    async function deleteProcessData(processId) {
        try {
            Swal.fire({
                title: '確定要刪除?',
                text: '刪除後將無法還原。',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '刪除',
                cancelButtonText: '取消',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await axios.delete(`http://localhost:5001/admin/process/${processId}`);
                    fetchProcessData();
                    Swal.fire('已刪除', '資料已成功刪除。', 'success');
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="d-flex justify-content-center" style={{ margin: '40px' }}>
            <div className="w-100" style={{ background: '#f7f3e9', padding: '20px' }}>
                <h1 className="text-center text-dark font-weight-bold" style={{ fontWeight: 'bold' }}> History</h1>
                <Table striped bordered hover variant="light" style={{ backgroundColor: '#eadfc6' }}>
                    <thead>
                        <tr>
                            <th style={{ fontSize: 'larger', color: '#4c4c4c' }}>Edit</th>
                            <th style={{ fontSize: 'larger', color: '#4c4c4c' }}>Result</th>
                            <th style={{ fontSize: 'larger', color: '#4c4c4c' }}>Room</th>
                            <th style={{ fontSize: 'larger', color: '#4c4c4c' }}>CreatedAt</th>
                            <th style={{ fontSize: 'larger', color: '#4c4c4c' }}>Wordcloud</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processData.map((process) => (
                            <tr key={process._id}>
                                <td style={{ fontSize: 'larger', color: '#4c4c4c' }}>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => deleteProcessData(process._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                                <td style={{ fontSize: 'larger', color: '#4c4c4c' }}>{process.result}</td>
                                <td style={{ fontSize: 'larger', color: '#4c4c4c' }}>{process.to}</td>
                                <td style={{ fontSize: 'larger', color: '#4c4c4c' }}>{process.createdAt}</td>
                                <td className="vertical-center" style={{ fontSize: 'larger', color: '#4c4c4c' }}>
                                    <div className="image-container">
                                        <img src={process.imageSrc} alt="Wordcloud" className="wordcloud-image" />
                                        <div className="hover-overlay">
                                            <img src={process.imageSrc} alt="Wordcloud" className="zoomed-image" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {!user && <div className="alert alert-danger">Please login</div>}
            </div>
        </div>
    );
}

export default Process;
