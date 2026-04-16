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
    if (tokenPayload.role !== 'ADMIN') {
        alert('Доступ запрещен. Требуется роль ADMIN.');
        logout();
        return;
    }
    
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser} (ADMIN)`;
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

// Изменить роль пользователя (ADMIN)
async function updateUserRole() {
    const userId = document.getElementById('update-role-user-id').value;
    const role = document.getElementById('user-role-select').value;
    const resultEl = document.getElementById('update-role-result');
    
    if (!userId) {
        resultEl.textContent = 'Введите ID пользователя';
        resultEl.className = 'error';
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/role?role=${role}`, {
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

// Получить все заказы (ADMIN)
async function getAllOrders() {
    const resultEl = document.getElementById('all-orders-result');
    try {
        const response = await fetch('/api/admin/orders', {
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
