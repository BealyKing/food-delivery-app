// Глобальная переменная для хранения токена
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }
    
    const tokenPayload = decodeJWT(authToken);
    // Проверка на ADMIN или ROLE_ADMIN
    const role = tokenPayload.role || tokenPayload.authorities?.[0]?.authority || '';
    if (!role.includes('ADMIN')) {
        alert('Доступ запрещен. Требуется роль ADMIN.');
        logout();
        return;
    }
    
    currentUser = tokenPayload.sub;
    document.getElementById('user-info').textContent = `👤 ${currentUser} (ADMIN)`;
    
    // Загружаем все данные при старте
    loadUsers();
    loadOrders();
    loadCategories();
    loadFoodItems();
});

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

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

// --- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ---
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5">Загрузка...</td></tr>';

    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const users = await res.json();

        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td><span class="badge">${u.role}</span></td>
                <td>${u.email || '-'}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteUser(${u.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="error">Ошибка: ${e.message}</td></tr>`;
    }
}

async function deleteUser(id) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ID ${id}?`)) return;
    try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            alert('Пользователь удален');
            loadUsers();
        } else {
            alert('Ошибка удаления: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}

// --- УПРАВЛЕНИЕ ЗАКАЗАМИ ---
async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';

    try {
        const res = await fetch('/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const orders = await res.json();

        tbody.innerHTML = '';
        // Сортируем: новые сверху
        orders.sort((a, b) => b.id - a.id).forEach(o => {
            const tr = document.createElement('tr');
            const customerName = o.customer ? o.customer.username : 'Аноним';
            const courierName = o.courier ? o.courier.username : 'Нет';
            
            tr.innerHTML = `
                <td>#${o.id}</td>
                <td>${customerName}</td>
                <td>${courierName}</td>
                <td><span class="badge status-${o.status}">${o.status}</span></td>
                <td>${o.totalPrice} ₽</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteOrder(${o.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="error">Ошибка: ${e.message}</td></tr>`;
    }
}

async function deleteOrder(id) {
    if (!confirm(`Удалить заказ #${id}?`)) return;
    try {
        const res = await fetch(`/api/admin/orders/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            alert('Заказ удален');
            loadOrders();
        } else {
            alert('Ошибка: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}

// --- УПРАВЛЕНИЕ МЕНЮ (КАТЕГОРИИ) ---
async function loadCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3">Загрузка...</td></tr>';

    try {
        const res = await fetch('/api/admin/categories', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('Ошибка');
        const cats = await res.json();

        tbody.innerHTML = '';
        cats.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteCategory(${c.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="error">Ошибка: ${e.message}</td></tr>`;
    }
}

async function addCategory() {
    const nameInput = document.getElementById('new-cat-name');
    const name = nameInput.value.trim();
    if (!name) return alert('Введите название категории');

    try {
        const res = await fetch(`/api/admin/categories?name=${encodeURIComponent(name)}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            nameInput.value = '';
            loadCategories();
            loadFoodItems(); // Обновить и список еды, так как там есть фильтр по категориям
        } else {
            alert('Ошибка: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}

async function deleteCategory(id) {
    if (!confirm('Удалить категорию? Товары в ней могут остаться без категории.')) return;
    try {
        const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            loadCategories();
            loadFoodItems();
        } else {
            alert('Ошибка: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}

// --- УПРАВЛЕНИЕ МЕНЮ (ЕДА) ---
async function loadFoodItems() {
    const tbody = document.getElementById('food-table-body');
    const catSelect = document.getElementById('food-cat-select');
    
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';

    try {
        // Параллельно грузим еду и категории для селекта
        const [foodRes, catRes] = await Promise.all([
            fetch('/api/admin/food', { headers: { 'Authorization': `Bearer ${authToken}` } }),
            fetch('/api/admin/categories', { headers: { 'Authorization': `Bearer ${authToken}` } })
        ]);

        if (!foodRes.ok || !catRes.ok) throw new Error('Ошибка загрузки данных');
        
        const foodItems = await foodRes.json();
        const categories = await catRes.json();

        // Заполняем селект категорий для формы добавления
        catSelect.innerHTML = '<option value="">Выберите категорию</option>';
        categories.forEach(c => {
            catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });

        // Заполняем таблицу
        tbody.innerHTML = '';
        foodItems.forEach(f => {
            const tr = document.createElement('tr');
            const catName = f.category ? f.category.name : 'Без категории';
            tr.innerHTML = `
                <td>${f.id}</td>
                <td>${f.name}</td>
                <td>${catName}</td>
                <td>${f.price} ₽</td>
                <td title="${f.description}">${f.description ? f.description.substring(0, 30) + '...' : '-'}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteFood(${f.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="error">Ошибка: ${e.message}</td></tr>`;
    }
}

async function addFood() {
    const name = document.getElementById('food-name').value.trim();
    const desc = document.getElementById('food-desc').value.trim();
    const price = document.getElementById('food-price').value;
    const img = document.getElementById('food-img').value.trim();
    const catId = document.getElementById('food-cat-select').value;

    if (!name || !price || !catId) {
        return alert('Заполните название, цену и выберите категорию');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('imageUrl', img);
    formData.append('categoryId', catId);

    try {
        const res = await fetch('/api/admin/food', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (res.ok) {
            // Очистка полей
            document.getElementById('food-name').value = '';
            document.getElementById('food-desc').value = '';
            document.getElementById('food-price').value = '';
            document.getElementById('food-img').value = '';
            document.getElementById('food-cat-select').value = '';
            
            loadFoodItems();
        } else {
            alert('Ошибка: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}

async function deleteFood(id) {
    if (!confirm('Удалить этот товар из меню?')) return;
    try {
        const res = await fetch(`/api/admin/food/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            loadFoodItems();
        } else {
            alert('Ошибка: ' + await res.text());
        }
    } catch (e) {
        alert('Ошибка сети: ' + e.message);
    }
}