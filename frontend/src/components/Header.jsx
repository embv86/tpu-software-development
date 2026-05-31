import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, MessageSquare, User } from 'lucide-react'; // Твои иконки

function Header({ token }) {
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

          <Link 
            to="/chats" 
            className={`nav-link-btn ${location.pathname === '/chats' ? 'active' : ''}`}
          >
            <MessageSquare size={18} />
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