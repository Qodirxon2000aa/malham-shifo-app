import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState('daily'); // Standart: kunlik
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [stat, setStat] = useState({ label: 'Bugungi Buyurtmalar', value: 0 });

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
      navigate('/login');
      return;
    }
    const parsedData = JSON.parse(storedData);
    setUserData(parsedData);

    const fetchOrders = async () => {
      try {
        const response = await fetch('https://clinic-backend-zeta.vercel.app/order');
        const allOrders = await response.json();
        
        const filteredOrders = allOrders.filter(order => 
          order.categoryId?._id === parsedData.category?._id
        );
        
        setOrders(filteredOrders);
        
        // Oylarni dinamik ravishda aniqlash
        const months = [...new Set(filteredOrders.map(order => {
          const date = new Date(order.date);
          return `${date.getFullYear()}-${date.getMonth() + 1}`;
        }))].sort();
        setAvailableMonths(months);
        
        // Dastlabki filtr: bugungi buyurtmalar
        filterOrdersByDate(filteredOrders, 'daily', selectedDate, selectedMonth);
      } catch (error) {
        console.error('Buyurtmalarni olishda xato:', error);
        toast.error('Buyurtmalarni olishda xato yuz berdi');
      }
    };

    if (parsedData.category?._id) {
      fetchOrders();
    }
  }, [navigate]);

  const filterOrdersByDate = (orders, type, date, month) => {
    let filtered = [];
    let statLabel = 'Bugungi Buyurtmalar';
    let statValue = 0;

    if (type === 'daily') {
      const selected = new Date(date);
      filtered = orders.filter(order => {
        const orderDate = new Date(order.date);
        return (
          orderDate.getFullYear() === selected.getFullYear() &&
          orderDate.getMonth() === selected.getMonth() &&
          orderDate.getDate() === selected.getDate()
        );
      });
      statValue = filtered.length;
    } else if (type === 'monthly') {
      const [year, monthNum] = month.split('-').map(Number);
      filtered = orders.filter(order => {
        const orderDate = new Date(order.date);
        return (
          orderDate.getFullYear() === year &&
          orderDate.getMonth() + 1 === monthNum
        );
      });
      statLabel = `${monthToName(monthNum)} Buyurtmalari`;
      statValue = filtered.length;
    } else if (type === 'yearly') {
      const selected = new Date(date);
      filtered = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getFullYear() === selected.getFullYear();
      });
      statLabel = `${selected.getFullYear()} Yil Buyurtmalari`;
      statValue = filtered.length;
    }

    setFilteredOrders(filtered);
    setFilterType(type);
    setStat({ label: statLabel, value: statValue });
  };

  const monthToName = (month) => {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];
    return months[month - 1];
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    toast.success('Tizimdan chiqildi');
    setTimeout(() => navigate('/login'), 1000);
  };

  const handleEditProfile = () => {
    toast.info('Profilni tahrirlash hali amalga oshirilmagan. Administrator bilan bog\'laning.');
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (filterType === 'daily') {
      filterOrdersByDate(orders, 'daily', newDate, selectedMonth);
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (filterType === 'monthly') {
      filterOrdersByDate(orders, 'monthly', selectedDate, newMonth);
    }
  };

  const handleFilterChange = (type) => {
    if (type === 'monthly') {
      const currentMonth = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
      setSelectedMonth(currentMonth);
      filterOrdersByDate(orders, 'monthly', selectedDate, currentMonth);
    } else {
      filterOrdersByDate(orders, type, selectedDate, selectedMonth);
    }
  };

  if (!userData) return null;

  return (
    <div className="dashboard-mobile">
      <Toaster />
      
      <header className="header">
        <button className="back-button" onClick={handleBack}>←</button>
        <h1>APP / MALHAM SHIFO</h1>
        <button className="logout-button" onClick={handleLogout}>🚪</button>
      </header>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      </div>

      <div className="patient-card">
        <div className="patient-image">
          <div className="rasm-box">
            {userData.images ? (
              <img 
                src={`https://clinic-backend-zeta.vercel.app/images/${userData.images}`} 
                alt="Profil" 
                onError={(e) => {
                  console.log('Rasm yuklashda xato:', e);
                  e.target.onerror = null;
                  e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAtsB8gAAAABJRU5ErkJggg==';
                }}
              />
            ) : (
              <div>MS</div>
            )}
          </div>
        </div>
        <div className="patient-info">
          {Object.entries(userData).map(([key, value]) => {
            if (
              typeof value === 'object' || 
              key === 'images' || 
              key === '_id' || 
              key === '__v' || 
              key === 'password' ||
              key === 'login'
            ) return null;

            const fieldNames = {
              name: 'Ism',
              position: 'Lavozim',
              age: 'Yosh',
              workTime: 'Ish vaqti',
              phone: 'Telefon'
            };

            return (
              <div key={key} className="info-row">
                <span className="info-label">{fieldNames[key] || key}:</span>
                <span className="info-value">{value}</span>
              </div>
            );
          })}
          <div className="edit-profile">
            <a href="#" onClick={handleEditProfile}>Profilni tahrirlash</a>
          </div>
        </div>
      </div>

      <div className="section-title">Buyurtmalar</div>
      <div className="orders-section">
        <div className="filter-controls">
          <button 
            className={`filter-button ${filterType === 'daily' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('daily')}
          >
            Kunlik
          </button>
          <button 
            className={`filter-button ${filterType === 'monthly' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('monthly')}
          >
            Oylik
          </button>
          <button 
            className={`filter-button ${filterType === 'yearly' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('yearly')}
          >
            Yillik
          </button>
          {filterType === 'daily' && (
            <input 
              type="date" 
              className="date-filter" 
              value={selectedDate} 
              onChange={handleDateChange} 
            />
          )}
          {filterType === 'monthly' && (
            <select 
              className="month-filter" 
              value={selectedMonth} 
              onChange={handleMonthChange}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {monthToName(Number(month.split('-')[1]))} {month.split('-')[0]}
                </option>
              ))}
            </select>
          )}
        </div>
        {filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-header">
                  <span className="order-service">
                    {order.services[0]?.name || 'Nomsiz xizmat'}
                  </span>
                  <div className="order-datetime">
                    <span className="order-date">
                      {new Date(order.date).toLocaleDateString('uz-UZ')}
                    </span>
                    <span className="order-time">
                      {new Date(order.date).toLocaleTimeString('uz-UZ', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                <div className="order-details">
                  <div className={`order-status ${order.status?.toLowerCase() || 'pending'}`}>
                    {order.status || 'TUGATILDI'}
                  </div>
                  <div className="order-price">
                    {order.services[0]?.price?.toLocaleString('uz-UZ') || 0} so'm
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">Tanlangan vaqt oralig'ida buyurtmalar mavjud emas</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;