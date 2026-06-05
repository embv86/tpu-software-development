import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ImageIcon, Loader2, ArrowLeft, Mail, User, Pencil, Trash2, Share2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; 

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoUrl, setActivePhotoUrl] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUserId = Number(localStorage.getItem('userId'));
  const isOwner = data?.owner?.id === currentUserId;

  // --- ФИКС MINIO: Функция для замены внутреннего адреса Docker на внешний ---
  const getValidImageUrl = (url) => {
    if (!url) return null;
    return url.replace('http://minio:9000', 'http://localhost:9000');
  };
  // -------------------------------------------------------------------------

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/listings/${id}`);
      const listingData = response.data;
      setData(listingData);
      
      if (listingData && Array.isArray(listingData.images) && listingData.images.length > 0) {
        const firstImg = listingData.images[0];
        const coverUrl = firstImg.processedUrl || firstImg.rawUrl || firstImg.url || null;
        // ФИКС MINIO: Пропускаем главную картинку через фильтр
        setActivePhotoUrl(getValidImageUrl(coverUrl));
      }
    } catch (err) {
      console.error("Ошибка загрузки деталей лота:", err);
      alert("Не удалось загрузить детальную информацию: " + err.message);
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToChat = () => {
    if (!data) return;
    navigate(`/chats?listingId=${data.id}&sellerId=${data.owner.id}`);
  };

  const handleShareListing = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert("Ссылка на объявление успешно скопирована!"))
      .catch((err) => console.error("Не удалось скопировать ссылку:", err));
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/listings/${data.id}`);
      navigate('/my-listings'); 
    } catch (err) {
      console.error("Не удалось удалить объявление:", err);
      alert("Ошибка при удалении: " + err.message);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="center">
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" /> Загрузка карточки...
      </div>
    );
  }

  if (!data) {
    return <div className="center">Объявление не найдено или было удалено.</div>;
  }

  return (
    <div className="ad-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Назад
      </button>

      <div className="ad-detail-layout">
        
        {/* ЛЕВАЯ КОЛОНКА: Фото + Галерея */}
        <div className="ad-detail-photos">
          <div className="ad-main-photo-container">
            {activePhotoUrl ? (
              <img src={activePhotoUrl} alt={data.title} className="ad-main-photo" />
            ) : (
              <div className="no-img" style={{ height: '400px' }}><ImageIcon size={64} /> Нет фото</div>
            )}
          </div>

          {Array.isArray(data.images) && data.images.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Все изображения товара ({data.images.length}):
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {data.images.map((img, i) => {
                  const rawUrl = img.processedUrl || img.rawUrl || img.url;
                  // ФИКС MINIO: Пропускаем миниатюры через фильтр
                  const imgUrl = getValidImageUrl(rawUrl);
                  
                  if (!imgUrl) return null;

                  const isSelected = activePhotoUrl === imgUrl;

                  return (
                    <div 
                      key={i} 
                      onClick={() => setActivePhotoUrl(imgUrl)}
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        borderRadius: '6px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        background: 'var(--bg-element)',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`миниатюра ${i}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА: Инфо и Кнопки действий */}
        <div className="ad-detail-info">
          <h2 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>{data.title}</h2>
          <p className="ad-price">{data.price?.toLocaleString()} ₽</p>
          <div className="ad-detail-divider" />
          <h4 className="ad-sub-title">Описание товара</h4>
          <p className="ad-description">{data.description || "Описание отсутствует."}</p>
          <div className="ad-detail-divider" />
          
          <div className="seller-box">
            <h4 className="ad-sub-title" style={{ marginTop: 0 }}>Продавец</h4>
            <div className="seller-details">
              <User size={24} className="seller-avatar" />
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>
                  {data.owner?.firstName || 'Пользователь'} {data.owner?.lastName || ''}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  {data.owner?.email || 'Email не указан'}
                </p>
              </div>
            </div>

            {!isOwner ? (
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="message-btn" onClick={handleRedirectToChat} style={{ flex: 1 }}>
                  <Mail size={16} /> Написать продавцу
                </button>
                
                <button 
                  onClick={handleShareListing}
                  style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-main)', 
                    borderRadius: '6px', 
                    padding: '0 15px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'all 0.2s' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                  title="Поделиться объявлением"
                >
                  <Share2 size={18} />
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                    Это ваше объявление
                  </p>
                  
                  <button 
                    onClick={handleShareListing}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Копировать ссылку"
                  >
                    <Share2 size={14} /> Поделиться
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => navigate(`/edit/${data.id}`)} 
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--warning)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.color = 'var(--warning)';
                    }}
                  >
                    <Pencil size={15} /> Изменить
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--danger)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.color = 'var(--danger)';
                    }}
                  >
                    <Trash2 size={15} /> Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить объявление?"
        message={`Вы уверены, что хотите навсегда удалить «${data.title}» из системы Deala?`}
      />
    </div>
  );
}

export default ListingDetail;