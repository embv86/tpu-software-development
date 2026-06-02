import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, PlusCircle, ShoppingBag, Trash2, Pencil } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; // ИМПОРТ МОДАЛКИ

function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- СТЕНТЫ ДЛЯ КАСТОМНОЙ МОДАЛКИ ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listingIdToDelete, setListingIdToDelete] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const currentUserId = localStorage.getItem('userId');
      const response = await api.get('/listings', { params: { ownerId: currentUserId } });
      setListings(response.data);
    } catch (err) {
      console.error("Ошибка загрузки моих объявлений:", err);
    } finally {
      setLoading(false);
    }
  };

  // Открывает модалку и запоминает ID лота
  const openDeleteModal = (id) => {
    setListingIdToDelete(id);
    setIsModalOpen(true);
  };

  // Вызывается при нажатии "Удалить" в модалке
  const handleConfirmDelete = async () => {
    if (!listingIdToDelete) return;
    try {
      await api.delete(`/listings/${listingIdToDelete}`);
      setListings(listings.filter(item => item.id !== listingIdToDelete));
      // alert("Объявление удалено") <- УБРАЛИ, ТАК КАК ПРИЛЕТИТ ОРАНЖЕВЫЙ ТОСТ!
    } catch (err) {
      alert("Не удалось удалить: " + err.message);
    } finally {
      setIsModalOpen(false);
      setListingIdToDelete(null);
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
    <div style={{ maxWidth: '1250px', margin: '30px auto', padding: '0 20px' }}>
      
      {/* ШАПКА РАЗДЕЛА */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Мои объявления</h2>
        
        <button 
          onClick={() => navigate('/create')}
          style={{ 
            padding: '10px 16px', 
            backgroundColor: 'var(--primary)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: '600', 
            fontSize: '14px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            transition: 'background 0.2s' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          <PlusCircle size={16} /> Создать объявление
        </button>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      {listings.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '15px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px', fontSize: '18px' }}>У вас пока нет объявлений</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', maxWidth: '320px' }}>Выставьте свой первый товар на продажу прямо сейчас!</p>
          
          <button 
            onClick={() => navigate('/create')}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: 'var(--bg-surface)', 
              color: 'var(--primary)', 
              border: '1px solid var(--primary)', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              fontSize: '15px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              transition: 'all 0.2s' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            <PlusCircle size={18} /> Разместить товар
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', 
          gap: '20px', 
          justifyContent: 'center' 
        }}>
          {listings.map((item) => {
            const coverImg = item.images?.[0]?.processedUrl || item.images?.[0]?.rawUrl || '';
            return (
              <div key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ height: '160px', background: 'var(--bg-element)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/catalog/${item.id}`)}>
                  {coverImg ? <img src={coverImg} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={40} color="var(--text-muted)" />}
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => navigate(`/catalog/${item.id}`)} title={item.title}>{item.title}</h4>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>{item.price?.toLocaleString()} ₽</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button 
                      onClick={() => navigate(`/edit/${item.id}`)} 
                      style={{ flex: 1, padding: '8px', background: 'none', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                    >
                      <Pencil size={12} /> Изменить
                    </button>
                    {/* ЗАМЕНИЛИ ХЕНДЛЕР НА openDeleteModal */}
                    <button 
                      onClick={() => openDeleteModal(item.id)} 
                      style={{ padding: '8px', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ПОДКЛЮЧАЕМ КОМПОНЕНТ МОДАЛКИ */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить объявление?"
        message="Вы уверены, что хотите убрать этот товар из каталога Deala? Это действие нельзя отменить."
      />
    </div>
  );
}

export default MyListings;