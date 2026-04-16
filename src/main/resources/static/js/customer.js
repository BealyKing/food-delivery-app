// Глобальная переменная для хранения токена
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }
    
    // Декодируем токен для получения информации о пользователе
    const tokenPayload = decodeJWT(authToken);
    
    // Проверяем роль
    if (tokenPayload.role !== 'CUSTOMER') {
        alert('Доступ запрещен. Требуется роль CUSTOMER.');
        logout();
        return;
    }
    
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser} (CUSTOMER)`;
});

// Выход из системы
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
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

// Получить профиль клиента
async function getCustomerProfile() {
    const resultEl = document.getElementById('profile-result');
    try {
        const response = await fetch('/api/customer/profile', {
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
