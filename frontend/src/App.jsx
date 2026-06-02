import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Импорт стандартных стилей
import React, { useState, useEffect } from 'react';
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

  const [stompClient, setStompClient] = useState(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const handleLogin = (newToken, username, userId) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', username);
    localStorage.setItem('userId', userId);
    setToken(newToken);
    setUser(username);
  };

  // 1. Добавь этот useRef в самый верх компонента App, рядом с другими useState:
  const socketRef = React.useRef(null);

  // 2. А сам useEffect перепиши вот так:
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('token');
    
    // Переменная-флаг для отслеживания текущего рендера
    let isCurrentRender = true; 

    if (token && storedUserId && authToken) {
      // ЕСЛИ СОКЕТ УЖЕ СОЗДАН ИЛИ СОЗДАЕТСЯ — ИГНОРИРУЕМ ПОВТОРНЫЙ ЗАПУСК
      if (socketRef.current) {
        console.log("WebSocket уже инициализирован, отмена дублирования.");
        return;
      }

      console.log("Попытка установить ОДИН чистый WebSocket для пользователя:", storedUserId);
      
      const stompClient = Stomp.client('ws://localhost:8080/ws-notifications');
      socketRef.current = stompClient;

      stompClient.connect({
        'Authorization': `Bearer ${authToken}`
      }, () => {
        // Если пока шло соединение, компонент успел размонтироваться — закрываем сокет
        if (!isCurrentRender) {
          stompClient.disconnect();
          return;
        }

        console.log(">>> УСПЕХ! Чистый ОДИНОЧНЫЙ WebSocket подключен к Deala! <<<");
        
        stompClient.subscribe(`/topic/notifications.${storedUserId}`, (message) => {
          const notification = JSON.parse(message.body);
          console.log("Прилетело сокет-событие:", notification);
          
          const isAtChatsPage = window.location.pathname === '/chats';

          // ЕСЛИ ЭТО НОВОЕ СООБЩЕНИЕ ЧАТА
          if (notification.type === 'NEW_MESSAGE') {
            if (!isAtChatsPage) {
              setHasUnreadMessages(true); // Зажигаем кружочек, если мы в каталоге
            }

            // ГЕНЕРИРУЕМ СОБЫТИЕ ДЛЯ СТРАНИЦЫ ЧАТОВ
            // Передаем внутренний payload (наш msg объект) наружу
            const chatEvent = new CustomEvent('live-chat-message', { detail: notification.payload });
            window.dispatchEvent(chatEvent);
          }

          // Показываем оранжевый тост (только если мы НЕ на странице чатов, чтобы не спамить плашками при открытой переписке)
          if (!isAtChatsPage || notification.type !== 'NEW_MESSAGE') {
            toast(
              <div>
                <strong>{notification.title}</strong>
                <div>{notification.message}</div>
              </div>,
              {
                position: "top-right",
                autoClose: 5000,
                className: 'Toastify__toast--orange',
                icon: false
              }
            );
          }
        });
        
      }, (err) => {
        console.error("Ошибка чистых WebSockets:", err);
        if (isCurrentRender) socketRef.current = null;
      });

      setStompClient(stompClient);
    }

    // Очистка при размонтировании или смене токена
    return () => {
      isCurrentRender = false;
      if (socketRef.current) {
        console.log("Размонтирование: принудительно закрываем WebSocket...");
        const clientToDisconnect = socketRef.current;
        socketRef.current = null; // Сразу зануляем ссылку
        
        if (clientToDisconnect.connected) {
          clientToDisconnect.disconnect();
        }
      }
    };
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
      <Header token={token} hasUnread={hasUnreadMessages} setHasUnread={setHasUnreadMessages} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ListingDetail />} />
          
          <Route 
            path="/create" 
            element={token ? <CreateListing onListingCreated={() => {}} /> : <Navigate to="/profile" replace />} 
          />
          <Route 
            path="/my-listings" 
            element={token ? <MyListings /> : <Navigate to="/profile" replace />} 
          />
          <Route 
            path="/chats" 
            element={token ? <ChatsPage stompClient={stompClient} /> : <Navigate to="/profile" replace />} 
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
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;