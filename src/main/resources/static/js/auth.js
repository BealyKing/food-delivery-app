// Глобальная переменная для хранения токена
let authToken = localStorage.getItem('authToken') || null;

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }
    
    // Получаем информацию о пользователе из токена
    const tokenPayload = decodeJWT(authToken);
    const role = tokenPayload.role;
    
    // Перенаправляем на соответствующую страницу в зависимости от роли
    switch(role) {
        case 'ADMIN':
            window.location.href = '/admin.html';
            break;
        case 'CUSTOMER':
            window.location.href = '/customer.html';
            break;
        case 'COURIER':
            window.location.href = '/courier.html';
            break;
        default:
            alert('Неизвестная роль пользователя');
            logout();
    }
});

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
            const role = tokenPayload.role;
            
            // Перенаправляем на соответствующую страницу
            switch(role) {
                case 'ADMIN':
                    window.location.href = '/admin.html';
                    break;
                case 'CUSTOMER':
                    window.location.href = '/customer.html';
                    break;
                case 'COURIER':
                    window.location.href = '/courier.html';
                    break;
                default:
                    alert('Неизвестная роль пользователя');
            }
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

// Выход из системы
function logout() {
    authToken = null;
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
