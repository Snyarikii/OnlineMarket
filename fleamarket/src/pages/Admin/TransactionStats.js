// src/components/Admin/TransactionStats.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransactionStats.css';

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const TransactionStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/admin/transaction-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin transaction stats:', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <p className="admin-stats-wrapper">Loading stats…</p>;

  /* ---------- Chart.js data ---------- */
  const revenueBarData = {
    labels: stats.revenue_over_time.map((r) => r.date),
    datasets: [
      {
        label: 'Revenue (Ksh)',
        data: stats.revenue_over_time.map((r) => r.revenue),
        backgroundColor: 'rgba(54,162,235,0.6)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 200,
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 45 } },
      y: { beginAtZero: true },
    },
  };

  const paymentPieData = {
    labels: stats.payment_methods.map((p) => p.payment_method),
    datasets: [
      {
        data: stats.payment_methods.map((p) => p.total),
        backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
      },
    ],
  };

  return (
    <div className="admin-stats-wrapper">
      <h1 className="admin-stats-header">Admin Transaction Dashboard</h1>

      {/* ─── Summary cards ────────────────────────────── */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p>Ksh {Number(stats.summary.total_revenue).toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p>{stats.summary.total_transactions}</p>
        </div>
        <div className="summary-card">
          <h3>Average Order Value</h3>
          <p>Ksh {Number(stats.summary.average_transaction_value).toFixed(2)}</p>
        </div>
      </div>

      {/* ─── Revenue over time chart ─────────────────── */}
      <div className="chart-box">
        <h4>Revenue Over Time</h4>
        <Bar data={revenueBarData} options={barOptions} />
      </div>

      {/* ─── Top sellers / products lists ────────────── */}
      <div className="lists-section">
        <div className="list-box">
          <h4>Top Sellers</h4>
          <ul>
            {stats.top_sellers.map((s, idx) => (
              <li key={idx}>
                {s.seller_name} – Ksh {Number(s.total_earned).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        <div className="list-box">
          <h4>Top Products</h4>
          <ul>
            {stats.top_products.map((p, idx) => (
              <li key={idx}>
                {p.title} – {p.units_sold} units (Ksh{' '}
                {Number(p.revenue_generated).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Payment method pie ─────────────────────── */}
      <div className="chart-box">
        <h4>Payment Methods</h4>
        <Pie data={paymentPieData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default TransactionStats;
