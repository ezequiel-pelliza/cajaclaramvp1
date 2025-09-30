import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  data: Record<string, number>;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const categories = Object.keys(data);
  const amounts = Object.values(data);

  if (amounts.every(amount => amount === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos de egresos para mostrar
      </div>
    );
  }

  const colors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F59E0B'
  ];

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = amounts.reduce((sum, amount) => sum + amount, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <div className="h-80">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ExpenseChart;