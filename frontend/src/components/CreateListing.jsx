import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import api from '../api';
import { Loader2, X } from 'lucide-react';

function CreateListing({ onListingCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageIds, setImageIds] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Проверка лимита на основе актуального стейта
    if (imageIds.length + files.length > 10) {
      alert(`Вы не можете загрузить больше 10 фотографий. Уже загружено: ${imageIds.length}`);
      e.target.value = "";
      return;
    }

    setUploadingImages(true);
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const response = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const ids = response.data.map(img => img.fileId || img.id);
      const urls = response.data.map(img => {
        const url = img.processedUrl || img.url;
        return url ? url.replace('http://minio:9000', 'http://localhost:9000') : null;
      });
      
      // ФИКС: Используем функциональное обновление стейта
      setImageIds(prev => [...prev, ...ids]);
      setPreviewUrls(prev => [...prev, ...urls]);
    } catch (err) {
      alert("Не удалось загрузить изображения: " + err.message);
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    // ФИКС: Фильтруем через prev, чтобы исключить рассинхрон
    setImageIds(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Укажите название товара!");
    if (!price || parseFloat(price) <= 0) return alert("Укажите корректную цену выше 0 ₽!");
    if (!description.trim()) return alert("Добавьте описание товара!");
    if (imageIds.length === 0) return alert("Обязательно загрузите хотя бы одну фотографию товара!");

    try {
      await api.post('/listings', {
        title: title.trim(), 
        description: description.trim(), 
        price: parseFloat(price), 
        imageIds
      });
      
      if (onListingCreated) onListingCreated();
      navigate('/my-listings');
    } catch (err) {
      alert("Ошибка создания: " + err.message);
    }
  };

  return (
    <div className="form-container">
      <h2 className="title">Новое объявление</h2>
      <form onSubmit={handleCreateListing} className="form">
        
        <label className="label">Название товара (макс. 100 символов) *</label>
        <input 
          type="text" 
          required 
          maxLength={100}
          className="input"
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Введите название товара" 
        />

        <label className="label">Цена (₽) *</label>
        <input 
          type="number" 
          required 
          min={1} 
          className="input"
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          placeholder="Укажите цену" 
        />

        <label className="label">Описание *</label>
        <textarea 
          required 
          className="input"
          style={{ height: '100px', resize: 'vertical' }} 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Описание товара" 
        />

        <label className="label">Фотографии товара (от 1 до 10 штук) *</label>
        <div className="upload-box">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageUpload} 
            disabled={uploadingImages || imageIds.length >= 10} 
          />
          {uploadingImages && <span style={{marginLeft: '10px'}}><Loader2 style={{animation: 'spin 1s linear infinite'}} size={14} /> Загрузка...</span>}
        </div>

        {previewUrls.length > 0 && (
          <div className="preview-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            {previewUrls.map((url, index) => (
              <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={url} alt="Превью лота" className="preview-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                <button 
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>Опубликовать</button>
      </form>
    </div>
  );
}

export default CreateListing;