// Глобальные переменные
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;
let cart = []; // { foodItemId, name, price, quantity }
let menuItems = [];
let categories = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log("Страница загружена. Проверка токена...");
    
    if (!authToken) {
        console.warn("Токен не найден. Редирект на логин.");
        window.location.href = '/login.html';
        return;
    }

    const tokenPayload = decodeJWT(authToken);
    const role = tokenPayload.role || tokenPayload.authorities?.[0]?.authority || '';
    
    console.log("Роль пользователя:", role);

    if (!role.includes('CUSTOMER') && !role.includes('ADMIN')) {
        alert('Доступ запрещен. Требуется роль CUSTOMER.');
        logout();
        return;
    }

    currentUser = tokenPayload.sub;
    const userInfoEl = document.getElementById('user-info');
    if(userInfoEl) userInfoEl.textContent = `👤 ${currentUser}`;

    // Запускаем загрузку данных
    loadMenuData();
    loadMyOrders();
});

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Ошибка декодирования JWT:", e);
        return {};
    }
}

// --- Логика Меню ---

async function loadMenuData() {
    const menuContainer = document.getElementById('menu-items');
    if(!menuContainer) return;
    
    menuContainer.innerHTML = '<p>Загрузка меню...</p>';

    try {
        console.log("Запрос категорий и еды через публичный API...");
        
        // ИСПРАВЛЕНО: Используем /api/menu вместо /api/admin
        const [catRes, foodRes] = await Promise.all([
            fetch('/api/menu/categories', { headers: { 'Authorization': `Bearer ${authToken}` }}),
            fetch('/api/menu/items', { headers: { 'Authorization': `Bearer ${authToken}` }})
        ]);

        if (catRes.ok) {
            categories = await catRes.json();
            console.log("Категории загружены:", categories);
            renderCategories();
        } else {
            const errText = await catRes.text();
            console.error("Ошибка загрузки категорий (Status " + catRes.status + "):", errText);
            // Если 403 или 404, подсказываем пользователю
            if(catRes.status === 403) {
                menuContainer.innerHTML = '<p style="color:red">Ошибка доступа к меню. Проверьте настройки безопасности.</p>';
            }
        }

        if (foodRes.ok) {
            menuItems = await foodRes.json();
            console.log("Товары загружены:", menuItems);
            renderMenuItems('all');
        } else {
            const errText = await foodRes.text();
            console.error("Ошибка загрузки товаров (Status " + foodRes.status + "):", errText);
            menuContainer.innerHTML = '<p style="color:red">Ошибка загрузки товаров.</p>';
        }

    } catch (error) {
        console.error('Критическая ошибка загрузки меню:', error);
        menuContainer.innerHTML = '<p style="color:red">Ошибка сети. Проверьте консоль (F12).</p>';
    }
}

function renderCategories() {
    const container = document.getElementById('category-tabs');
    if (!container) return;

    container.innerHTML = `<button class="tab-btn active" onclick="filterMenu('all', this)">Все</button>`;
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = cat.name;
        btn.onclick = function() { filterMenu(cat.id, this); };
        container.appendChild(btn);
    });
}

function renderMenuItems(categoryId) {
    const container = document.getElementById('menu-items');
    if (!container) return;
    
    container.innerHTML = '';

    const filtered = categoryId === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category && item.category.id === categoryId);

    console.log(`Отрисовка меню. Фильтр: ${categoryId}, найдено товаров: ${filtered.length}`);

    if (filtered.length === 0) {
        container.innerHTML = '<p>В этой категории пока нет блюд. Добавьте их через панель администратора.</p>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card';
        
        // Безопасное получение картинки
        const imgUrl = item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl : 'https://via.placeholder.com/200?text=No+Image';
        const desc = item.description ? item.description : '';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200?text=Error'">
            <h4>${item.name}</h4>
            <p style="font-size:0.9em; color:#666; height: 40px; overflow: hidden;">${desc}</p>
            <div class="price">${item.price} ₽</div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id})">В корзину 🛒</button>
        `;
        container.appendChild(card);
    });
}

function filterMenu(categoryId, btnElement) {
    // Обновляем активный класс кнопок
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderMenuItems(categoryId);
}

// --- Логика Корзины ---

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) {
        console.error("Товар не найден в списке:", itemId);
        return;
    }

    const existing = cart.find(c => c.foodItemId === itemId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            foodItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    // Анимация или уведомление (опционально)
    console.log("Добавлено в корзину:", item.name);
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-sum');
    const btn = document.getElementById('checkout-btn');

    if (!list || !totalEl || !btn) return;

    list.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        list.innerHTML = '<li style="color:#777; text-align:center;">Корзина пуста</li>';
        btn.disabled = true;
        btn.textContent = "Оформить заказ";
    } else {
        cart.forEach((item, index) => {
            const sum = item.price * item.quantity;
            total += sum;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="flex-grow:1;">
                    <strong>${item.name}</strong><br>
                    <small>${item.quantity} x ${item.price}₽ = ${sum}₽</small>
                </div>
                <button onclick="removeFromCart(${index})" style="background:#dc3545; color:white; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold;">×</button>
            `;
            list.appendChild(li);
        });
        btn.disabled = false;
        btn.textContent = `Оформить заказ (${total} ₽)`;
    }

    totalEl.textContent = total;
}

async function placeOrder() {
    if (cart.length === 0) return;

    const total = document.getElementById('cart-total-sum').textContent;
    if (!confirm(`Оформить заказ на сумму ${total} ₽?\n\nСостав:\n${cart.map(i => `- ${i.name} x${i.quantity}`).join('\n')}`)) {
        return;
    }

    try {
        console.log("Отправка заказа...", cart);
        
        const response = await fetch('/api/customer/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(cart.map(item => ({
                foodItemId: item.foodItemId,
                quantity: item.quantity
            })))
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Заказ создан:", result);
            alert('✅ Заказ успешно оформлен!');
            cart = [];
            updateCartUI();
            loadMyOrders();
        } else {
            const errText = await response.text();
            console.error("Ошибка сервера:", errText);
            alert('❌ Ошибка при создании заказа: ' + errText);
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert('❌ Ошибка сети: ' + error.message);
    }
}

// --- История заказов ---

async function loadMyOrders() {
    const list = document.getElementById('orders-list');
    if(!list) return;
    
    list.innerHTML = '<p>Загрузка истории...</p>';

    try {
        const response = await fetch('/api/customer/orders', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const orders = await response.json();
            list.innerHTML = '';
            
            if (orders.length === 0) {
                list.innerHTML = '<p style="color:#777;">У вас пока нет заказов.</p>';
                return;
            }

            // Сортировка: новые сверху
            orders.sort((a, b) => b.id - a.id);

            orders.forEach(order => {
                const div = document.createElement('div');
                div.className = `order-card status-${order.status}`;
                
                let itemsHtml = '';
                if (order.items && order.items.length > 0) {
                    itemsHtml = '<ul style="padding-left:20px; margin:5px 0; font-size:0.9em;">';
                    order.items.forEach(i => {
                        const fName = i.foodItem ? i.foodItem.name : 'Товар удален';
                        itemsHtml += `<li>${fName} x${i.quantity}</li>`;
                    });
                    itemsHtml += '</ul>';
                } else {
                    itemsHtml = '<p style="font-size:0.8em; color:#999;">Состав заказа недоступен</p>';
                }

                const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Дата не указана';

                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <strong>Заказ #${order.id}</strong>
                        <span style="font-weight:bold; font-size:1.1em;">${order.totalPrice} ₽</span>
                    </div>
                    <div style="margin-bottom:5px;">Статус: <span class="badge status-${order.status}">${translateStatus(order.status)}</span></div>
                    ${itemsHtml}
                    <div style="border-top:1px solid #eee; margin-top:5px; padding-top:5px; font-size:0.8em; color:#777;">
                        🕒 ${dateStr}
                    </div>
                `;
                list.appendChild(div);
            });
        } else {
            console.error("Ошибка загрузки истории:", await response.text());
            list.innerHTML = '<p style="color:red">Ошибка загрузки истории</p>';
        }
    } catch (error) {
        console.error("Ошибка сети при загрузке истории:", error);
        list.innerHTML = '<p style="color:red">Ошибка сети</p>';
    }
}

function translateStatus(status) {
    const map = {
        'NEW': 'Новый 🟡',
        'IN_PROGRESS': 'В работе 🔵',
        'DELIVERED': 'Доставлен 🟢',
        'CANCELLED': 'Отменен 🔴'
    };
    return map[status] || status;
}