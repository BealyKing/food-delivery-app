// Глобальная переменная для хранения токена
let authToken = localStorage.getItem('authToken') || null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Если мы уже на странице логина, не нужно никуда перенаправлять при отсутствии токена
    const currentPath = window.location.pathname;
    if (currentPath.includes('login.html') || currentPath === '/' || currentPath === '') {
        return; 
    }

    // Если токена нет, а мы на защищенной странице -> идем на логин
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }
    
    // Получаем информацию о пользователе из токена
    const tokenPayload = decodeJWT(authToken);
    
    // Логирование для отладки (нажмите F12 в браузере, чтобы увидеть payload)
    console.log('JWT Payload:', tokenPayload);

    const role = extractRole(tokenPayload);
    
    if (!role) {
        console.error('Роль не найдена в токене!', tokenPayload);
        logout();
        return;
    }

    // Перенаправляем на соответствующую страницу в зависимости от роли
    // Проверка текущего пути, чтобы не перезагружать страницу лишний раз
    const expectedPath = getExpectedPath(role);
    if (expectedPath && currentPath !== expectedPath) {
        window.location.href = expectedPath;
    }
});

// Функция извлечения роли из разных возможных полей JWT
function extractRole(payload) {
    // Вариант 1: Прямое поле 'role' (часто используется в кастомных токенах)
    if (payload.role) return payload.role;
    
    // Вариант 2: Поле 'roles' (массив или строка)
    if (payload.roles) {
        if (Array.isArray(payload.roles)) return payload.roles[0];
        return payload.roles;
    }

    // Вариант 3: Стандарт Spring Security 'authorities' (массив объектов или строк)
    if (payload.authorities) {
        if (Array.isArray(payload.authorities)) {
            const auth = payload.authorities[0];
            // Если это объект { authority: "ROLE_ADMIN" }
            if (typeof auth === 'object' && auth.authority) return auth.authority;
            // Если это просто строка "ROLE_ADMIN"
            return auth;
        }
    }

    return null;
}

// Маппинг ролей на пути
function getExpectedPath(role) {
    // Удаляем префикс ROLE_, если он есть, для сравнения
    const cleanRole = role.replace('ROLE_', '');
    
    switch(cleanRole) {
        case 'ADMIN': return '/admin.html';
        case 'CUSTOMER': return '/customer.html';
        case 'COURIER': return '/courier.html';
        default: return null;
    }
}

// Переключение между входом и регистрацией
function showRegister() {
    document.querySelector('.auth-container:first-of-type').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-section').style.display = 'none';
    document.querySelector('.auth-container:first-of-type').style.display = 'block';
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
            
            // Декодируем токен для получения роли
            const tokenPayload = decodeJWT(authToken);
            console.log('Получен токен с payload:', tokenPayload);
            
            const role = extractRole(tokenPayload);
            
            if (!role) {
                alert('Ошибка: В токене отсутствует роль. Проверьте бэкенд.');
                console.error('Роль не найдена в полученном токене');
                return;
            }

            const targetPath = getExpectedPath(role);
            if (targetPath) {
                window.location.href = targetPath;
            } else {
                alert('Неизвестная роль пользователя: ' + role);
            }
        } else {
            const errorText = await response.text();
            alert('Ошибка входа: ' + (errorText || 'неверный логин или пароль'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
});

// Обработка формы регистрации
// Обработка формы регистрации
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const roleValue = document.getElementById('register-role').value;
    
    if (!roleValue) {
        alert('Пожалуйста, выберите роль');
        return;
    }

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Отправляем объект с полем role
            body: JSON.stringify({ 
                username, 
                password, 
                role: roleValue 
            })
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь войдите в систему.');
            showLogin();
        } else {
            const errorText = await response.text();
            alert('Ошибка регистрации: ' + errorText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
});

// Выход из системы
function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

// Декодирование JWT токена
function decodeJWT(token) {
    try {
        if (!token) return {};
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Ошибка декодирования JWT:', e);
        return {};
    }
}