import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, MessageSquare, User } from 'lucide-react'; // Твои иконки

// Добавили в пропсы hasUnread и setHasUnread, которые мы передаем из App.jsx
function Header({ token, hasUnread, setHasUnread }) {
  const location = useLocation();
  const userFirstName = localStorage.getItem('userFirstName') || 'Профиль';

  return (
    <header>
      {/* Обертка для центровки контента */}
      <div className="header-wrapper">
        
        {/* НОВОЕ НАЗВАНИЕ МАРКЕТПЛЕЙСА */}
        <Link to="/catalog" className="logo" style={{ textDecoration: 'none' }}>
          Deala
        </Link>

        {/* Твоя навигация */}
        <nav>
          <Link 
            to="/catalog" 
            className={`nav-link-btn ${location.pathname === '/catalog' ? 'active' : ''}`}
          >
            <ShoppingBag size={18} /> Каталог
          </Link>
          
          <Link 
            to="/my-listings" 
            className={`nav-link-btn ${location.pathname === '/my-listings' ? 'active' : ''}`}
          >
            Мои объявления
          </Link>
          
          <Link 
            to="/create" 
            className={`nav-link-btn ${location.pathname === '/create' ? 'active' : ''}`}
          >
            Создать объявление
          </Link>

          {/* ИКОНКА ЧАТА С КРУЖОЧКОМ УВЕДОМЛЕНИЯ */}
          <Link 
            to="/chats" 
            // При клике на кнопку чата вызываем setHasUnread(false), чтобы сбросить (потушить) кружочек
            onClick={() => setHasUnread(false)} 
            className={`nav-link-btn ${location.pathname === '/chats' ? 'active' : ''}`}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
          >
            {/* Сама иконка чата становится оранжевой, если есть непрочитанные */}
            <MessageSquare size={18} style={{ color: hasUnread ? '#ff5f1f' : 'inherit' }} />

            {/* Если флаг hasUnread равен true — рендерим маленький оранжевый кружочек */}
            {hasUnread && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ff5f1f', // Наш фирменный оранжевый Deala
                borderRadius: '50%',
                border: '2px solid #fff', // Белый ободок, чтобы кружочек не сливался с кнопкой
                boxShadow: '0 0 4px rgba(255, 95, 31, 0.5)'
              }} />
            )}
          </Link>
          
          <Link 
            to="/profile" 
            className={`nav-link-btn ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <User size={18} /> {token ? userFirstName : 'Войти'}
          </Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;