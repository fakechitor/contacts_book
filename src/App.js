
import React, { useState } from 'react';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Анна Петрова', phone: '+79123456789' },
    { id: 2, name: 'Иван Смирнов', phone: '+79876543210' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyPhoneToClipboard = async (phone, id) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Не удалось скопировать номер:', err);
    }
  };

  const validateName = (value) => {
    if (!value.trim()) return 'Имя обязательно';
    if (value.length < 2) return 'Имя должно содержать минимум 2 символа';
    if (!/^[а-яА-Яa-zA-Z\s\-']+$/u.test(value)) return 'Имя может содержать только буквы, пробелы, дефисы и апострофы';
    return '';
  };

  const normalizePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) {
      return '+7' + digits.slice(1);
    } else if (digits.startsWith('7')) {
      return '+' + digits;
    } else if (digits.length > 0) {
      return '+' + digits;
    }
    return value;
  };

  const validatePhone = (rawValue) => {
    if (!rawValue.trim()) return 'Телефон обязателен';
    const normalized = normalizePhone(rawValue);
    const digitsOnly = normalized.replace(/\D/g, '');
    if (!normalized.startsWith('+')) return 'Невозможно определить формат номера';
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return 'Номер должен содержать от 10 до 15 цифр';
    return '';
  };

  const openAddModal = () => {
    setName('');
    setPhone('');
    setNameError('');
    setPhoneError('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setNameError('');
    setPhoneError('');
    setEditingId(contact.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    setNameError(nameErr);
    setPhoneError(phoneErr);

    if (!nameErr && !phoneErr) {
      const normalizedPhone = normalizePhone(phone);
      const updatedContact = { id: editingId ?? Date.now(), name: name.trim(), phone: normalizedPhone };

      if (editingId) {
        setContacts(contacts.map(c => (c.id === editingId ? updatedContact : c)));
      } else {
        setContacts([...contacts, updatedContact]);
      }

      setIsModalOpen(false);
    }
  };

  const handleDelete = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
      <div className="container">
        <div className="header">
          <h1 className="title">Книга контактов</h1>
          <button className="add-contact-button" onClick={openAddModal}>
            + Добавить контакт
          </button>
        </div>

        <div className="contacts-list">
          {contacts.length > 0 ? (
              contacts.map((contact) => {
                const words = contact.name.trim().split(/\s+/);
                let initials = words[0].substring(0, 1).toUpperCase();
                if (words.length > 1) {
                  initials += words[1].substring(0, 1).toUpperCase();
                }

                return (
                    <div key={contact.id} className="contact-item">
                      <div className="contact-avatar">{initials}</div>

                      <div className="contact-info">
                        <strong>{contact.name}</strong>
                        <div
                            className="phone"
                            onClick={() => copyPhoneToClipboard(contact.phone, contact.id)}
                            style={{cursor: 'copy'}}
                        >
                          {contact.phone}
                          {copiedId === contact.id && (
                              <span className="copied-hint"> Скопировано!</span>
                          )}
                        </div>
                      </div>

                      <div className="contact-actions">
                        <button
                            onClick={() => openEditModal(contact)}
                            className="edit-button"
                        >
                          Изменить
                        </button>
                        <button
                            onClick={() => handleDelete(contact.id)}
                            className="delete-button"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                );
              })
          ) : (
              <p className="empty-text">Нет сохранённых контактов</p>
          )}
        </div>

        {/* Модальное окно */}
        {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                  {editingId ? 'Редактировать контакт' : 'Новый контакт'}
                </h2>
                <form onSubmit={handleSubmit} className="form">
                  <div>
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError(validateName(e.target.value));
                        }}
                        className={`input ${nameError ? 'input-error' : ''}`}
                    />
                    {nameError && <p className="error-text">{nameError}</p>}
                  </div>

                  <div>
                    <input
                        type="tel"
                        placeholder="Телефон (например, 89123456789)"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError(validatePhone(e.target.value));
                        }}
                        className={`input ${phoneError ? 'input-error' : ''}`}
                    />
                    {phoneError && <p className="error-text">{phoneError}</p>}
                  </div>

                  <div className="modal-buttons">
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                      Отмена
                    </button>
                    <button
                        type="submit"
                        className="modal-submit"
                        disabled={!!(nameError || phoneError || !name.trim() || !phone.trim())}
                    >
                      {editingId ? 'Сохранить' : 'Добавить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;