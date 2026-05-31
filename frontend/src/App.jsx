import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Catalog from './components/Catalog';
import ListingDetail from './components/ListingDetail';
import CreateListing from './components/CreateListing';
import Auth from './components/Auth';
import MyListings from './components/MyListings';
import ChatsPage from './components/ChatsPage';
import EditListingPage from './components/EditListingPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));

  const handleLogin = (newToken, username, userId) => {
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', username);
  localStorage.setItem('userId', userId);
  setToken(newToken);
  setUser(username);
};

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Header token={token} />
      <main>
        <Routes>
          {/* Дефолтный редирект на каталог */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          
          {/* Публичные эндпоинты */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ListingDetail />} />
          
          {/* Защищенные эндпоинты (только для залогиненных) */}
          <Route 
            path="/create" 
            element={token ? <CreateListing onListingCreated={() => window.location.href = '/catalog'} /> : <Navigate to="/profile" replace />} 
          />
          <Route 
            path="/my-listings" 
            element={token ? <MyListings /> : <Navigate to="/profile" replace />} 
          />
          <Route 
            path="/chats" 
            element={token ? <ChatsPage /> : <Navigate to="/profile" replace />} 
          />
          <Route 
            path="/edit/:id" 
            element={token ? <EditListingPage /> : <Navigate to="/profile" replace />} 
          />

          {/* Умный роут Профиля: если авторизован — видит ЛК, если нет — форму входа */}
          <Route 
            path="/profile" 
            element={
              token ? (
                <ProfilePage />
              ) : (
                <Auth token={token} user={user} onLogin={handleLogin} onLogout={handleLogout} />
              )
            } 
          />

          {/* Перехват несуществующих роутов */}
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;