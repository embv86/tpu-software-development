import React, { useState } from 'react';
import api from '../api';

function Auth({ token, user, onLogin, onLogout }) {
  const [isRegister] = useState(false); // Или используй свой стейт переключения, если он есть
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        if (!firstName.trim()) return alert("Имя обязательно для заполнения!");
        
        const response = await api.post('/auth/register', {
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim() || null
        });
        
        const { token: regToken, id: regId, email: registeredEmail } = response.data;
        
        localStorage.setItem('userFirstName', firstName.trim());
        onLogin(regToken, registeredEmail, regId);
        alert("Регистрация успешна!");
      } else {
        // 1. Логинимся (Получаем 200 OK)
        const response = await api.post('/auth/login', { email: email.trim(), password });
        const { token: loginToken, id: loginId, email: loggedEmail } = response.data; 
        
        // 2. Запрашиваем профиль, принудительно передавая СВЕЖИЙ токен в заголовке
        const userProfile = await api.get(`/users/${loginId}`, {
          headers: {
            'Authorization': `Bearer ${loginToken}` // Передаем токен напрямую, минуя интерцептор
          }
        });
        
        // 3. Сохраняем имя в кэш для отображения в Deala
        localStorage.setItem('userFirstName', userProfile.data.firstName || 'Профиль');
        
        // 4. Коммитим успешную авторизацию в глобальный стейт React приложения
        onLogin(loginToken, loggedEmail, loginId);
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      alert("Ошибка аутентификации: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '50px' }}>
      <h2 className="title">{isRegisterMode ? 'Регистрация' : 'Вход'}</h2>
      <form onSubmit={handleSubmit} className="form">
        
        <label className="label">Email / Логин *</label>
        <input 
          type="email" 
          required 
          className="input" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="example@tpu.ru" 
        />

        <label className="label">Пароль *</label>
        <input 
          type="password" 
          required 
          className="input" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="••••••••" 
        />

        {isRegisterMode && (
          <>
            <label className="label">Имя *</label>
            <input 
              type="text" 
              required 
              className="input" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              placeholder="Иван" 
            />

            <label className="label">Фамилия</label>
            <input 
              type="text" 
              className="input" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
              placeholder="Иванов" 
            />
          </>
        )}

        <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
          {isRegisterMode ? 'Создать аккаунт' : 'Войти'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isRegisterMode ? 'Уже есть аккаунт?' : 'Впервые у нас?'}{' '}
          <span 
            onClick={() => setIsRegisterMode(!isRegisterMode)} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
          >
            {isRegisterMode ? 'Войти' : 'Создать аккаунт'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Auth;