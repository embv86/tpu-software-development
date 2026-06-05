import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Mail, Phone, MapPin, Loader2, Edit2, Check, LogOut, Trash2 } from 'lucide-react';

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Поля формы
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${currentUserId}`); 
      const data = response.data;
      setProfile(data);
      
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
    } catch (err) {
      console.error("Ошибка загрузки профиля:", err);
      alert("Не удалось загрузить данные профиля.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName.trim()) {
      alert("Имя является обязательным полем!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null
      };

      const response = await api.put('/users/me', payload);
      setProfile(response.data);
      setIsEditing(false);
      
      localStorage.setItem('userFirstName', response.data.firstName);
      window.dispatchEvent(new Event('profileUpdated'));

      alert("Профиль успешно обновлен!");
    } catch (err) {
      console.error("Ошибка сохранения профиля:", err);
      alert("Ошибка изменения: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/catalog';
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ВНИМАНИЕ: Вы уверены, что хотите навсегда удалить свой аккаунт? Все ваши объявления также будут удалены!")) return;

    try {
      await api.delete(`/users/${currentUserId}`);
      alert("Ваш аккаунт успешно удален.");
      localStorage.clear();
      window.location.href = '/catalog';
    } catch (err) {
      console.error("Ошибка при удалении аккаунта:", err);
      alert("Не удалось удалить аккаунт: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="center" style={{ paddingTop: '100px' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '30px', position: 'relative', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
        
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '25px', color: 'var(--text-main)' }}>Мой профиль</h2>
        
        {/* Кнопка Изменить / Сохранить */}
        <button 
          onClick={() => { if (isEditing) handleSaveChanges(); else setIsEditing(true); }}
          disabled={saving}
          style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '600' }}
        >
          {saving ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isEditing ? (
            <><Check size={16} /> Сохранить</>
          ) : (
            <><Edit2 size={16} /> Изменить</>
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Рейтинг продавца */}
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', background: 'var(--bg-element)', padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '500' }}>
            Рейтинг продавца: <strong style={{ color: 'var(--warning)' }}>★ {profile?.rating?.toFixed(2) || '5.00'}</strong>
          </div>

          {/* Поле: Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email (Логин)</label>
            <input type="text" disabled value={profile?.email || ''} style={{ padding: '12px', background: 'var(--bg-element)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '14px', cursor: 'not-allowed', outline: 'none' }} />
          </div>

          {/* Поле: Имя */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}><User size={14} /> Имя *</label>
            <input 
              type="text" 
              disabled={!isEditing} 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Введите имя" 
              style={{ padding: '12px', background: 'var(--bg-element)', border: isEditing ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} 
            />
          </div>

          {/* Поле: Фамилия */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}><User size={14} /> Фамилия</label>
            <input 
              type="text" 
              disabled={!isEditing} 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Введите фамилию" 
              style={{ padding: '12px', background: 'var(--bg-element)', border: isEditing ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} 
            />
          </div>

          {/* Поле: Телефон */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}><Phone size={14} /> Телефон</label>
            <input 
              type="text" 
              disabled={!isEditing} 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+7 (999) 123-45-67" 
              style={{ padding: '12px', background: 'var(--bg-element)', border: isEditing ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} 
            />
          </div>

          {/* Поле: Город */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-main)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}><MapPin size={14} /> Город</label>
            <input 
              type="text" 
              disabled={!isEditing} 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Томск" 
              style={{ padding: '12px', background: 'var(--bg-element)', border: isEditing ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} 
            />
          </div>

        </div>

        {/* Кнопка Выхода */}
        <button onClick={handleLogout} style={{ width: '100%', marginTop: '30px', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}>
          <LogOut size={15} /> Выйти из аккаунта
        </button>

        {/* Кнопка Удаления */}
        <button onClick={handleDeleteAccount} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'var(--danger)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}>
          <Trash2 size={15} /> Удалить профиль навсегда
        </button>

      </div>
    </div>
  );
}

export default ProfilePage;