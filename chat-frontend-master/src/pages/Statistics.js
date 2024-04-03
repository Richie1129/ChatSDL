import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';

function Statistics() {
    const [statisticsData, setStatisticsData] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const user = useSelector((state) => state.user);
    const userID = user && user._id;
    console.log(userID);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (user && user._id) {
            fetchStatisticsData();
        }
    }, [user, filterValue]);

    async function fetchStatisticsData() {
        try {
            const response = await axios.get('http://localhost:5001/admin/statistics', {
                params: {
                    fromId: userID,
                    to: filterValue // 將 filterValue 作為參數傳遞給後端
                },
            });
            const data = response.data;
            const modifiedData = data.map((item) => ({
                name: item.from.name,
                count: item.count,
            }));
            setStatisticsData(modifiedData);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <h2>Statistics</h2>
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                <option value="">All</option>
                <option value="general">general</option>
                <option value="tech">tech</option>
                <option value="finance">finance</option>
                <option value="crypto">crypto</option>
                <option value="data">data</option>
            </select>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    {statisticsData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.count}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default Statistics;