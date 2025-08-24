// Инициализация Firebase

const firebaseConfig = {
  apiKey: "AIzaSyCQTk07tMT8y7tYH0Tcz3xV747rJKBmfIE",
  authDomain: "grandstep-2e1d8.firebaseapp.com",
  projectId: "grandstep-2e1d8",
  storageBucket: "grandstep-2e1d8.firebasestorage.app",
  messagingSenderId: "307286256573",
  appId: "1:307286256573:web:3d4ecaf42690e0da2c40d4",
  measurementId: "G-5VYW104YG6"
};

// Проверка конфигурации
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "ваш_apiKey") {
  showAuthMessage("Ошибка: Не настроена конфигурация Firebase. Замените значения в firebaseConfig на свои.", "error");
} else {
  try {
    firebase.initializeApp(firebaseConfig);
    showAuthMessage("Firebase успешно инициализирован", "success");
  } catch (error) {
    showAuthMessage("Ошибка инициализации Firebase: " + error.message, "error");
  }
}

const db = firebase.firestore();
const auth = firebase.auth();

// Переменные
let currentUser = null;
let selectedDate = null;
let selectedClass = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let classesByDate = {};

// Показ сообщений аутентификации
function showAuthMessage(message, type) {
  const messageDiv = document.getElementById('auth-message');
  messageDiv.textContent = message;
  messageDiv.className = message ${type};
  
  // Также выводим в debug-info
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    debugInfo.textContent += [${new Date().toLocaleTimeString()}] ${message}\n;
  }
  
  console.log(`[AUTH] ${message}`);
}

// Инициализация календаря
function initCalendar() {
  renderCalendar(currentMonth, currentYear);
  loadMonthClasses(currentMonth, currentYear);
}

// Аутентификация
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showAuthMessage("Введите email и пароль", "error");
    return;
  }
  
  showAuthMessage("Выполняется вход...", "success");
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showAuthMessage("Вход выполнен успешно!", "success");
      checkAuthState();
    })
    .catch((error) => {
      const errorMessage = getAuthErrorMessage(error.code);
      showAuthMessage('Ошибка входа: ' + errorMessage, "error");
      console.error("Ошибка входа:", error);
    });
}

function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showAuthMessage("Введите email и пароль", "error");
    return;
  }
  
  if (password.length < 6) {
    showAuthMessage("Пароль должен содержать не менее 6 символов", "error");
    return;
  }
  
  showAuthMessage("Регистрация...", "success");
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Создаем запись о пользователе в Firestore
      return db.collection('users').doc(userCredential.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      showAuthMessage("Регистрация успешна!", "success");
    })
    .catch((error) => {
      const errorMessage = getAuthErrorMessage(error.code);
      showAuthMessage('Ошибка регистрации: ' + errorMessage, "error");
      console.error("Ошибка регистрации:", error);
    });
}

function logout() {
  auth.signOut();
  showAuthMessage("Вы вышли из системы", "success");
}

// Преобразование кодов ошибок в понятные сообщения
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    "auth/invalid-email": "Неверный формат email",
    "auth/user-disabled": "Пользователь заблокирован",
    "auth/user-not-found": "Пользователь не найден",
    "auth/wrong-password": "Неверный пароль",
    "auth/email-already-in-use": "Email уже используется",
    "auth/operation-not-allowed": "Операция не разрешена",
    "auth/weak-password": "Пароль слишком простой"
  };
  
  return errorMessages[errorCode] || "Неизвестная ошибка: " + errorCode;
}

function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {

> Roman:
currentUser = user;
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'block';
      showAuthMessage("Пользователь аутентифицирован: " + user.email, "success");
      initCalendar();
    } else {
      currentUser = null;
      document.getElementById('auth-container').style.display = 'block';
      document.getElementById('app-container').style.display = 'none';
      showAuthMessage("Вы не авторизованы", "error");
    }
  });
}

// Остальные функции (календарь, занятия, модальное окно) остаются без изменений
// ...

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Назначение обработчиков кнопок
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('signup-btn').addEventListener('click', signup);
  
  // Проверка состояния аутентификации
  checkAuthState();
  
  // Закрытие модального окна
  document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('booking-modal').style.display = 'none';
  });
  
  // Подтверждение записи
  document.getElementById('confirm-booking').addEventListener('click', function() {
    // ... код подтверждения записи
  });
  
  showAuthMessage("Приложение загружено. Готово к работе.", "success");
});

// Для отладки: выводим информацию о Firebase в консоль
console.log("Firebase config:", firebaseConfig);
console.log("Firebase app:", firebase.apps);
