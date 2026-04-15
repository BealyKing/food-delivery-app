// Глобальная переменная для хранения токена
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showMainContent();
    } else {
        showAuthSection();
    }
});

// Переключение между входом и регистрацией
function showRegister() {
    document.getElementById('login-form').parentElement.style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-form').parentElement.style.display = 'block';
}

// Обработка формы входа
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            authToken = await response.text();
            localStorage.setItem('authToken', authToken);
            showMainContent();
        } else {
            alert('Ошибка входа: неверный логин или пароль');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
});

// Обработка формы регистрации
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь войдите в систему.');
            showLogin();
        } else {
            alert('Ошибка регистрации: ' + await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
});

// Показать основной контент после входа
function showMainContent() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('nav-menu').style.display = 'flex';
    
    // Декодируем токен для получения информации о пользователе
    const tokenPayload = decodeJWT(authToken);
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser}`;
}

// Показать секцию авторизации
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('nav-menu').style.display = 'none';
}

// Выход из системы
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showAuthSection();
    
    // Очистка результатов
    document.querySelectorAll('pre').forEach(el => el.textContent = '');
}

// Декодирование JWT токена
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

// Получить всех пользователей (ADMIN)
async function getAllUsers() {
    const resultEl = document.getElementById('users-result');
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            resultEl.textContent = JSON.stringify(data, null, 2);
            resultEl.className = 'success';
        } else {
            resultEl.textContent = 'Ошибка: ' + await response.text();
            resultEl.className = 'error';
        }
    } catch (error) {
        resultEl.textContent = 'Ошибка: ' + error.message;
        resultEl.className = 'error';
    }
}

// Получить заказы клиента (CUSTOMER)
async function getCustomerOrders() {
    const resultEl = document.getElementById('orders-result');
    try {
        const response = await fetch('/api/customer/orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.text();
            resultEl.textContent = data;
            resultEl.className = 'success';
        } else {
            resultEl.textContent = 'Ошибка: ' + await response.text();
            resultEl.className = 'error';
        }
    } catch (error) {
        resultEl.textContent = 'Ошибка: ' + error.message;
        resultEl.className = 'error';
    }
}

// Создать заказ (CUSTOMER)
async function createOrder() {
    const resultEl = document.getElementById('orders-result');
    try {
        const response = await fetch('/api/customer/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ items: ['Pizza', 'Cola'], total: 500 })
        });
        
        if (response.ok) {
            const data = await response.text();
            resultEl.textContent = data;
            resultEl.className = 'success';
        } else {
            resultEl.textContent = 'Ошибка: ' + await response.text();
            resultEl.className = 'error';
        }
    } catch (error) {
        resultEl.textContent = 'Ошибка: ' + error.message;
        resultEl.className = 'error';
    }
}

// Получить заказы курьера (COURIER)
async function getCourierOrders() {
    const resultEl = document.getElementById('courier-orders-result');
    try {
        const response = await fetch('/api/courier/orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.text();
            resultEl.textContent = data;
            resultEl.className = 'success';
        } else {
            resultEl.textContent = 'Ошибка: ' + await response.text();
            resultEl.className = 'error';
        }
    } catch (error) {
        resultEl.textContent = 'Ошибка: ' + error.message;
        resultEl.className = 'error';
    }
}

// Удалить пользователя (ADMIN)
async function deleteUser() {
    const userId = document.getElementById('delete-user-id').value;
    const resultEl = document.getElementById('delete-result');
    
    if (!userId) {
        resultEl.textContent = 'Введите ID пользователя';
        resultEl.className = 'error';
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.text();
            resultEl.textContent = data;
            resultEl.className = 'success';
        } else {
            resultEl.textContent = 'Ошибка: ' + await response.text();
            resultEl.className = 'error';
        }
    } catch (error) {
        resultEl.textContent = 'Ошибка: ' + error.message;
        resultEl.className = 'error';
    }
}
