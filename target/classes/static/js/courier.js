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
    
    // Проверяем роль (учитываем, что в токене может быть "ROLE_COURIER" или просто "COURIER")
    const role = tokenPayload.role || tokenPayload.authorities?.[0]?.authority || '';
    if (!role.includes('COURIER')) {
        alert('Доступ запрещен. Требуется роль COURIER.');
        logout();
        return;
    }
    
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser} (COURIER)`;
    
    // Автоматически загружаем заказы при старте
    loadAvailableOrders();
    loadMyOrders();
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
        console.error("Ошибка декодирования токена", e);
        return {};
    }
}

// --- НОВЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ИНТЕРФЕЙСОМ ---

// Загрузка доступных заказов (свободных)
async function loadAvailableOrders() {
    const resultEl = document.getElementById('available-orders-list');
    if (!resultEl) return;
    try {
        // Путь изменен на /api/courier/available
        const response = await fetch('/api/courier/available', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        // ... остальной код без изменений
        if (response.ok) {
            const orders = await response.json();
            renderOrdersList(orders, resultEl, true);
        } else {
             const err = await response.text();
             console.error("Ошибка загрузки доступных:", err);
             resultEl.innerHTML = `<p class="error">Ошибка: ${err}</p>`;
        }
    } catch (error) {
        resultEl.innerHTML = `<p class="error">Ошибка сети: ${error.message}</p>`;
    }
}

// Загрузка моих заказов (в работе)
async function loadMyOrders() {
    const resultEl = document.getElementById('my-orders-list');
    if (!resultEl) return;
    try {
        // Путь изменен на /api/courier/my-orders
        const response = await fetch('/api/courier/my-orders', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        // ... остальной код без изменений
        if (response.ok) {
            const orders = await response.json();
            renderOrdersList(orders, resultEl, false);
        } else {
            const err = await response.text();
            console.error("Ошибка загрузки моих заказов:", err);
            resultEl.innerHTML = `<p class="error">Ошибка: ${err}</p>`;
        }
    } catch (error) {
        resultEl.innerHTML = `<p class="error">Ошибка сети: ${error.message}</p>`;
    }
}

// Вспомогательная функция отрисовки списка заказов
function renderOrdersList(orders, container, isAvailable) {
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>Список пуст</p>';
        return;
    }

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Формируем список товаров для отображения
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = '<ul class="order-items">';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.foodItem.name} x${item.quantity} (${item.price * item.quantity} ₽)</li>`;
            });
            itemsHtml += '</ul>';
        } else {
            itemsHtml = '<p>Состав заказа недоступен</p>';
        }

        card.innerHTML = `
            <h4>Заказ #${order.id}</h4>
            <p><strong>Клиент:</strong> ${order.customer?.username || 'Аноним'}</p>
            <p><strong>Статус:</strong> ${order.status}</p>
            <p><strong>Сумма:</strong> ${order.totalPrice} ₽</p>
            ${itemsHtml}
            <div class="actions">
                ${isAvailable 
                    ? `<button class="btn-success" onclick="takeOrder(${order.id})">Взять в работу</button>` 
                    : `<button class="btn-primary" onclick="updateOrderStatus(${order.id}, 'DELIVERED')">Завершить доставку</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

// Взять заказ (вызывается из кнопки в списке)
async function takeOrder(orderId) {
    if (!confirm(`Взять заказ #${orderId} в работу?`)) return;

    try {
        const response = await fetch(`/api/courier/orders/${orderId}/take`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            alert('Заказ успешно взят!');
            loadAvailableOrders(); // Обновить список доступных
            loadMyOrders();        // Обновить список моих
        } else {
            const errText = await response.text();
            alert('Ошибка: ' + errText);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error.message);
    }
}

// Обновить статус (завершить доставку)
async function updateOrderStatus(orderId, status) {
    if (!confirm(`Подтвердить доставку заказа #${orderId}?`)) return;
    try {
        // Используем метод PATCH, как в контроллере, или измените @PatchMapping на @PutMapping в Java
        const response = await fetch(`/api/courier/orders/${orderId}/status?status=${status}`, {
            method: 'PATCH', 
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            alert('Статус обновлен!');
            loadMyOrders();
            loadAvailableOrders(); // На случай если статус сменился на NEW (хотя маловероятно)
        } else {
            const errText = await response.text();
            console.error("Ошибка обновления статуса:", errText);
            alert('Ошибка: ' + errText);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error.message);
    }
}

// --- СТАРЫЕ ФУНКЦИИ (Оставлены для совместимости с твоими кнопками, если они нужны) ---
// Если ты хочешь использовать старые инпуты, раскомментируй их использование в HTML,
// но сейчас интерфейс перестроен на автоматические списки.

async function getCourierOrders() {
    // Эта функция теперь дублируется loadAvailableOrders, но оставлена для старой кнопки
    loadAvailableOrders();
}