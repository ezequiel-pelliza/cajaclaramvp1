import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatDate } from '../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyChartProps {
  data: { date: string; income: number; expense: number }[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const labels = data.map(day => formatDate(day.date));
  const incomes = data.map(day => day.income);
  const expenses = data.map(day => day.expense);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: incomes,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Egresos',
        data: expenses,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WeeklyChart;