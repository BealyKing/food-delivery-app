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
    if (tokenPayload.role !== 'COURIER') {
        alert('Доступ запрещен. Требуется роль COURIER.');
        logout();
        return;
    }
    
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser} (COURIER)`;
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

// Взять заказ курьером (COURIER)
async function takeOrder() {
    const orderId = document.getElementById('take-order-id').value;
    const resultEl = document.getElementById('take-order-result');
    
    if (!orderId) {
        resultEl.textContent = 'Введите ID заказа';
        resultEl.className = 'error';
        return;
    }
    
    try {
        const response = await fetch(`/api/courier/orders/${orderId}/take`, {
            method: 'POST',
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

// Обновить статус заказа (COURIER)
async function updateOrderStatus() {
    const orderId = document.getElementById('update-status-order-id').value;
    const status = document.getElementById('order-status-select').value;
    const resultEl = document.getElementById('update-status-result');
    
    if (!orderId) {
        resultEl.textContent = 'Введите ID заказа';
        resultEl.className = 'error';
        return;
    }
    
    try {
        const response = await fetch(`/api/courier/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
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
