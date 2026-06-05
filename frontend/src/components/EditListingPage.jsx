import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';

function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageIds, setImageIds] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/listings/${id}`);
      const item = response.data;
      
      setTitle(item.title || '');
      setPrice(item.price || '');
      setDescription(item.description || '');
      
      if (item.images && Array.isArray(item.images)) {
        const savedIds = item.images.map(img => img.fileId || img.id);
        const savedUrls = item.images.map(img => {
          const url = img.processedUrl || img.rawUrl || img.url;
          return url ? url.replace('http://minio:9000', 'http://localhost:9000') : null;
        });
        setImageIds(savedIds);
        setPreviewUrls(savedUrls);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных объявления:", err);
      alert("Не удалось загрузить данные лота: " + err.message);
      navigate('/my-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (imageIds.length + files.length > 10) {
      alert(`Превышен лимит в 10 фото! Сейчас загружено: ${imageIds.length}.`);
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
      
      const newIds = response.data.map(img => img.fileId);
      const newUrls = response.data.map(img => {
        const url = img.processedUrl || img.url;
        return url ? url.replace('http://minio:9000', 'http://localhost:9000') : null;
      });
      
      setImageIds([...imageIds, ...newIds]);
      setPreviewUrls([...previewUrls, ...newUrls]);
    } catch (err) {
      alert("Не удалось загрузить новые фотографии: " + err.message);
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageIds(imageIds.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls(previewUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Название лота не может быть пустым!");
    if (!price || parseFloat(price) <= 0) return alert("Цена товара должна быть больше 0 ₽!");
    if (!description.trim()) return alert("Добавьте описание вашего товара!");
    if (imageIds.length === 0) return alert("Ошибка: в объявлении должна остаться хотя бы одна фотография!");

    setSaving(true);
    const payload = {
      title: title.trim(),
      price: Number(price),
      description: description.trim(),
      imageIds: imageIds
    };

    try {
      await api.put(`/listings/${id}`, payload);
      
      navigate('/my-listings');
    } catch (err) {
      console.error("Ошибка обновления лота:", err);
      alert("Не удалось сохранить изменения: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="center" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '100px' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" /> Загрузка данных лота...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
      {/* Ссылка "Назад" в общей светлой стилистике */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', fontSize: '15px', fontWeight: '500' }}
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <h2 style={{ fontSize: '26px', marginBottom: '25px', fontWeight: '600', color: 'var(--text-main)' }}>Редактирование объявления #{id}</h2>

      <form onSubmit={handleUpdateListing} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-surface)', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        
        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '-10px' }}>Название товара (макс. 100 символов) *</label>
        <input 
          type="text" 
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          style={{ marginBottom: 0 }} // Перебиваем нижний маржин стандартного класса для точности сетки формы
        />

        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '-10px' }}>Цена (₽) *</label>
        <input 
          type="number" 
          required
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input"
          style={{ marginBottom: 0 }}
        />

        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '-10px' }}>Описание товара *</label>
        <textarea 
          rows={5}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          style={{ height: 'auto', resize: 'vertical', marginBottom: 0 }}
        />

        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '-10px' }}>Фотографии товара ({imageIds.length} из 10) *</label>
        <div style={{ padding: '15px', border: '2px dashed var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-element)' }}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleNewImageUpload} 
            disabled={uploadingImages || imageIds.length >= 10} 
          />
          {uploadingImages && <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}><Loader2 style={{ animation: 'spin 1s linear infinite', marginRight: '5px' }} size={14} color="var(--primary)" /> Загрузка медиа...</span>}
        </div>

        {previewUrls.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
            {previewUrls.map((url, index) => (
              <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={url} alt="Превью лота" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                <button 
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          style={{ padding: '14px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          {saving ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} color="#fff" /> : <><Save size={18} /> Сохранить изменения</>}
        </button>

      </form>
    </div>
  );
}

export default EditListingPage;