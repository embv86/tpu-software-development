import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, Loader2, MessageSquare, ShoppingBag, Tag, Trash2 } from 'lucide-react';

function ChatsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const currentUserId = Number(localStorage.getItem('userId'));

  const searchParams = new URLSearchParams(location.search);
  const urlListingId = searchParams.get('listingId');
  const urlSellerId = searchParams.get('sellerId');

  const [activeChat, setActiveChat] = useState(null);
  const [rooms, setRooms] = useState({ buying: [], selling: [] });
  const [activeTab, setActiveTab] = useState('buying');
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    fetchAllRooms();
  }, []);

  useEffect(() => {
    if (urlListingId && urlSellerId) {
      setActiveChat({
        listingId: Number(urlListingId),
        sellerId: Number(urlSellerId),
        buyerId: currentUserId
      });
      setActiveTab('buying');
    }
  }, [urlListingId, urlSellerId]);

  useEffect(() => {
    if (activeChat) {
      fetchChatHistory(activeChat);
    }
  }, [activeChat]);

  // Скролл вниз при отправке/получении сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchAllRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await api.get('/chats/rooms', { params: { userId: currentUserId } });
      setRooms(response.data);
    } catch (err) {
      console.error("Ошибка списка чатов:", err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchChatHistory = async (chat) => {
    setMessagesLoading(true);
    try {
      const response = await api.get('/chats/history', {
        params: { listingId: chat.listingId, buyerId: chat.buyerId, sellerId: chat.sellerId }
      });
      setMessages(response.data);
    } catch (err) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const payload = {
      listingId: activeChat.listingId,
      buyerId: activeChat.buyerId,
      sellerId: activeChat.sellerId,
      senderId: currentUserId,
      text: newMessage.trim()
    };

    try {
      const response = await api.post('/chats/send', payload);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      fetchAllRooms();
    } catch (err) {
      alert("Не удалось отправить: " + err.message);
    }
  };

  const handleDeleteChat = async (e, room) => {
    e.stopPropagation();
    if (!window.confirm("Удалить этот чат? Вся история переписки будет стёрта.")) return;

    try {
      await api.delete(`/chats/${room.id}`); 
      setRooms((prevRooms) => ({
        ...prevRooms,
        [activeTab]: prevRooms[activeTab].filter(item => item.id !== room.id)
      }));
      
      const isActive = activeChat?.listingId === room.listingId && 
                       activeChat?.buyerId === room.buyerId && 
                       activeChat?.sellerId === room.sellerId;
                       
      if (isActive) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      alert("Не удалось удалить чат: " + err.message);
    }
  };

  return (
    <div className="chats-container" style={{ display: 'flex', maxWidth: '1100px', margin: '10px auto', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', height: 'calc(100vh - 140px)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      
      {/* ЛЕВАЯ ЧАСТЬ: Список чатов */}
      <div className="chats-sidebar" style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-element)' }}>
          <button 
            onClick={() => setActiveTab('buying')}
            style={{ flex: 1, padding: '15px', background: activeTab === 'buying' ? 'var(--bg-surface)' : 'none', border: 'none', color: activeTab === 'buying' ? 'var(--primary)' : 'var(--text-muted)', Letters: '1px', fontWeight: '600', cursor: 'pointer', borderBottom: activeTab === 'buying' ? '2px solid var(--primary)' : 'none' }}
          >
            Я покупаю
          </button>
          <button 
            onClick={() => setActiveTab('selling')}
            style={{ flex: 1, padding: '15px', background: activeTab === 'selling' ? 'var(--bg-surface)' : 'none', border: 'none', color: activeTab === 'selling' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', borderBottom: activeTab === 'selling' ? '2px solid var(--primary)' : 'none' }}
          >
            Я продаю
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {roomsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}><Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" /></div>
          ) : (rooms[activeTab] || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px', marginTop: '30px' }}>Нет активных диалогов</p>
          ) : (
            (rooms[activeTab] || []).map((room) => {
              const isSelected = activeChat?.listingId === room.listingId && activeChat?.buyerId === room.buyerId && activeChat?.sellerId === room.sellerId;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveChat(room)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--primary-alpha)' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '5px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'transparent',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                      <ShoppingBag size={16} color="var(--primary)" />
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>Объявление #{room.listingId}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {activeTab === 'buying' ? `Продавец ID: ${room.sellerId}` : `Покупатель ID: ${room.buyerId}`}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(e, room)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onStringToColor={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    title="Удалить чат"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Окно самого диалога */}
      <div className="chats-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
        {activeChat ? (
          <>
            <div 
              onClick={() => navigate(`/catalog/${activeChat.listingId}`)}
              style={{ padding: '12px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              title="Перейти к объявлению"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tag size={18} color="var(--primary)" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: '600' }}>
                    Открыть карточку объявления #{activeChat.listingId} ↗
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Собеседник ID: {activeTab === 'buying' ? activeChat.sellerId : activeChat.buyerId}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messagesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" />
                </div>
              ) : messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>История переписки пуста.</p>
              ) : (
                messages.map((msg) => {
                  const isMyMsg = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMyMsg ? 'flex-end' : 'flex-start',
                        background: isMyMsg ? 'var(--primary)' : 'var(--bg-surface)',
                        color: isMyMsg ? '#fff' : 'var(--text-main)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        maxWidth: '70%',
                        fontSize: '14px',
                        wordBreak: 'break-word',
                        border: isMyMsg ? 'none' : '1px solid var(--border-color)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', background: 'var(--bg-surface)' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-element)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
              />
              <button type="submit" style={{ background: 'var(--primary)', border: 'none', borderRadius: '6px', padding: '0 18px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', padding: '20px' }}>
            <MessageSquare size={48} style={{ marginBottom: '15px', opacity: 0.3, color: 'var(--primary)' }} />
            <h3 style={{ color: 'var(--text-main)' }}>Выберите чат из списка слева</h3>
            <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px', margin: '5px 0 0 0' }}>Или перейдите к любому объявлению в каталоге, чтобы начать новый диалог.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatsPage;