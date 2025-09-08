import React, { useState, useEffect } from 'react';
import { dashboardAPI } from './dashboardApi';

interface DashboardStats {
  todaySales: number;
  thisWeekSales: number;
  thisMonthSales: number;
  outOfStockProducts: number;
  totalCustomers: number;
  monthlyProfit: number;
}

interface SalesData {
  month: string;
  sales: number;
}

interface ProductData {
  productName: string;
  quantitySold: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    outOfStockProducts: 0,
    totalCustomers: 0,
    monthlyProfit: 0
  });
  const [monthlySalesData, setMonthlySalesData] = useState<SalesData[]>([]);
  const [mostSoldProducts, setMostSoldProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, salesResponse, productsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getMonthlySales(),
        dashboardAPI.getMostSoldProducts()
      ]);

      setStats(statsResponse.data);
      setMonthlySalesData(salesResponse.data);
      setMostSoldProducts(productsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f6fa', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#333',
          margin: 0
        }}>
          Admin Dashboard
        </h1>
        <button
          onClick={fetchDashboardData}
          style={{
            padding: '10px 20px',
            background: '#6c3fc5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '30px',
        maxWidth: '100%'
      }}>
        {/* Today Sales */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Today Sales</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {loading ? '...' : formatCurrency(stats.todaySales)}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>📊</div>
          </div>
        </div>

        {/* This Week Sales */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>This Week Sales</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {loading ? '...' : formatCurrency(stats.thisWeekSales)}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>📈</div>
          </div>
        </div>

        {/* This Month Sales */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>This Month Sales</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {loading ? '...' : formatCurrency(stats.thisMonthSales)}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>💰</div>
          </div>
        </div>

        {/* Out of Stock Products */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Out of Stock</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {loading ? '...' : stats.outOfStockProducts}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>📦</div>
          </div>
        </div>

        {/* Total Customers */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          color: '#333',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>Total Customers</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {loading ? '...' : stats.totalCustomers}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>👥</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px',
        maxWidth: '100%'
      }}>
        {/* Monthly Sales Panel */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333',
              margin: 0
            }}>
              Monthly Sales
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                🔄 Refresh
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                📊 Chart
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                📋 Table
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                🔽 Sort
              </button>
            </div>
          </div>
          
          <div style={{ 
            height: '250px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#dc3545',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {loading ? 'Loading...' : 'No Data Available'}
          </div>
        </div>

        {/* Monthly Profit Panel */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333',
              margin: 0
            }}>
              Monthly Profit
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                🔄 Refresh
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                📊 Chart
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                📋 Table
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}>
                🔽 Sort
              </button>
            </div>
          </div>
          
          <div style={{ 
            height: '250px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#dc3545',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {loading ? 'Loading...' : 'No Data Available'}
          </div>
        </div>
      </div>

      {/* Most Sold Products Panel */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333',
            margin: 0
          }}>
            Most Sold Products
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '6px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              🔄 Refresh
            </button>
            <button style={{
              padding: '6px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              📊 Chart
            </button>
            <button style={{
              padding: '6px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              📋 Table
            </button>
            <button style={{
              padding: '6px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              🔽 Sort
            </button>
          </div>
        </div>
        
        <div style={{ 
          height: '250px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#dc3545',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {loading ? 'Loading...' : 'No Data Available'}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
