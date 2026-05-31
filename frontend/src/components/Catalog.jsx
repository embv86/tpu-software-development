import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ImageIcon, Loader2 } from 'lucide-react';

function Catalog() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const response = await api.get('/listings');
      setListings(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item) => {
    if (!item.images || item.images.length === 0) return null;
    const img = item.images[0];
    return img.processedUrl || img.rawUrl;
  };

  if (loading) return <div className="center"><Loader2 style={{animation: 'spin 1s linear infinite'}} /> Загрузка...</div>;

  return (
    // Ограничиваем общую ширину каталога и центруем его на экране
    <div style={{ maxWidth: '1250px', margin: '30px auto', padding: '0 20px' }}>
      <h2 className="title" style={{ marginBottom: '20px' }}>Каталог</h2>
      
      {/* СЕТКА С ЖЕСТКОЙ КЛЕЙКОЙ НА 5 СТОЛБЦОВ */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', 
        gap: '20px', 
        justifyContent: 'center' 
      }}>
        {listings.map((item) => {
          const imgUrl = getImageUrl(item);
          return (
            <Link to={`/catalog/${item.id}`} key={item.id} className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <div className="image-container">
                {imgUrl ? (
                  <img src={imgUrl} alt={item.title} className="card-img" />
                ) : (
                  <div className="no-img"><ImageIcon size={32} /> Нет фото</div>
                )}
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-price">{item.price?.toLocaleString()} ₽</p>
                </div>
                <p className="card-desc">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Catalog;