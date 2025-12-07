import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiService } from '../services/apiService';
import './PriceDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceDashboard = ({ asset, livePrices }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const historicalUpdateIntervalRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    fetchHistoricalData();

    // Set up historical data refresh every 5 minutes
    historicalUpdateIntervalRef.current = setInterval(() => {
      fetchHistoricalData();
    }, 5 * 60 * 1000);

    return () => {
      if (historicalUpdateIntervalRef.current) {
        clearInterval(historicalUpdateIntervalRef.current);
      }
    };
  }, [asset]);

  useEffect(() => {
    // When live prices update, update the last data point with current price
    if (livePrices?.prices?.[asset]?.price) {
      const currentPrice = livePrices.prices[asset].price;
      const currentTimestamp = Date.now();
      
      // Throttle updates to avoid too frequent re-renders (max once per 30 seconds)
      if (currentTimestamp - lastUpdateRef.current < 30000) {
        return;
      }
      
      lastUpdateRef.current = currentTimestamp;
      
      // Update the last data point with current price
      setHistoricalData(prevData => {
        if (!prevData || !prevData.dataPoints || prevData.dataPoints.length === 0) {
          return prevData;
        }
        
        const newDataPoints = [...prevData.dataPoints];
        const lastPoint = newDataPoints[newDataPoints.length - 1];
        const lastTimestamp = new Date(lastPoint?.date || lastPoint?.timestamp || 0).getTime();
        const timeDiff = currentTimestamp - lastTimestamp;
        
        // Only update if the last point is recent (within 1 hour) to avoid creating gaps
        if (timeDiff < 60 * 60 * 1000) {
          newDataPoints[newDataPoints.length - 1] = {
            ...lastPoint,
            price: Number(currentPrice.toFixed(2)),
            timestamp: currentTimestamp,
            date: new Date(currentTimestamp).toISOString(),
          };
          
          return {
            ...prevData,
            dataPoints: newDataPoints,
            endDate: new Date(currentTimestamp).toISOString(),
          };
        }
        
        return prevData;
      });
    }
  }, [livePrices, asset]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHistoricalData(asset, 30);
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = livePrices?.prices?.[asset]?.price;

  // Prepare chart data with proper formatting
  const dataPoints = historicalData?.dataPoints || [];
  const validDataPoints = dataPoints.filter(dp => dp && dp.price != null && dp.price > 0);
  
  // Format labels and data arrays, ensuring they're aligned
  const chartLabels = validDataPoints.map((dp) => {
    try {
      return new Date(dp.date || dp.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  });

  const chartPrices = validDataPoints.map((dp) => Number(dp.price));

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${asset} Price (USD)`,
        data: chartPrices,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: chartPrices.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `${asset} Price History (30 Days)`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
  };

  return (
    <div className="card price-dashboard">
      <h2>📊 Price Dashboard - {asset}</h2>
      
      {currentPrice && (
        <div className="current-price">
          <div className="price-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(currentPrice)}
          </div>
          <div className="price-label">Current Price</div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading historical data...</div>
      ) : validDataPoints.length > 0 ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="loading">No historical data available yet. Please wait...</div>
      )}

      {historicalData?.note && (
        <div className="data-note">
          <small>ℹ️ {historicalData.note}</small>
        </div>
      )}
    </div>
  );
};

export default PriceDashboard;

