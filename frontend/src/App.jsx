import React, { useState, useEffect } from 'react'; // Добавили useEffect
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
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));

  // Создаем стейт для хранения ссылки на stomp-клиент, чтобы иметь возможность отключиться при логауте
  const [stompClient, setStompClient] = useState(null);

  const handleLogin = (newToken, username, userId) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', username);
    localStorage.setItem('userId', userId);
    setToken(newToken);
    setUser(username);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      console.log("Попытка установить чистый WebSocket для пользователя:", storedUserId);
      
      // ИСПОЛЬЗУЕМ СТАНДАРТНЫЙ БРАУЗЕРНЫЙ ПРЕТОКОЛ ws:// НАПРЯМУЮ ЧЕРЕЗ ШЛЮЗ
      // Обрати внимание: теперь мы передаем урл прямо со спецификатором ws://
      const stompClient = Stomp.client('ws://localhost:8080/ws-notifications');

      // Извлекаем токен из localStorage
      const authToken = localStorage.getItem('token');

      stompClient.connect({
        // Передаем токен авторизации прямо в заголовках STOMP кадра
        'Authorization': `Bearer ${authToken}`
      }, () => {
        console.log(">>> УСПЕХ! Чистый WebSocket подключен к Deala! <<<");
        
        stompClient.subscribe(`/user/${storedUserId}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          console.log("УРА! Сообщение в браузере:", notification);
          alert(`[${notification.title}]: ${notification.message}`); 
        });
      }, (err) => {
        console.error("Ошибка чистых WebSockets:", err);
      });

      setStompClient(stompClient);

      return () => {
        if (stompClient && stompClient.connected) {
          stompClient.disconnect();
        }
      };
    }
  }, [token]);

  const handleLogout = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
    localStorage.clear();
    setToken(null);
    setUser(null);
    setStompClient(null);
  };

  return (
    <BrowserRouter>
      <Header token={token} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ListingDetail />} />
          
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

          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;