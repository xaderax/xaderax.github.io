


console.log("Script.js загружен");

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
function initializeFirebase() {
  try {
    console.log("Попытка инициализации Firebase...");
    
    // Проверяем, все ли поля заполнены
    const isConfigValid = Object.values(firebaseConfig).every(
      value => value && !value.includes("ваш_")
    );
    
    if (!isConfigValid) {
      throw new Error("Неверная конфигурация Firebase. Замените все значения 'ваш_...' на реальные из Firebase Console.");
    }
    
    // Инициализируем Firebase
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase успешно инициализирован");
    
    // Проверяем доступность сервисов
    testFirebaseConnection();
    
    return true;
  } catch (error) {
    console.error("Ошибка инициализации Firebase:", error);
    showAuthMessage("Ошибка инициализации: " + error.message, "error");
    return false;
  }
}

// Проверка подключения к Firebase
function testFirebaseConnection() {
  console.log("Тестирование подключения к Firebase...");
  
  // Проверяем доступность Firestore
  const db = firebase.firestore();
  db.collection("test").doc("connection").get()
    .then(() => console.log("Подключение к Firestore успешно"))
    .catch(error => console.error("Ошибка подключения к Firestore:", error));
  
  // Проверяем доступность Auth
  const auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    console.log("Сервис аутентификации доступен");
    if (user) {
      console.log("Пользователь уже авторизован:", user.email);
    } else {
      console.log("Пользователь не авторизован");
    }
  });
}

// Показ сообщений аутентификации
function showAuthMessage(message, type) {
  console.log("Показать сообщение:", message, type);
  const messageDiv = document.getElementById('auth-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = message ${type};
  }
}

// Аутентификация
function login() {
  console.log("Функция login вызвана");
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log("Введенные данные:", {email, password});
  
  if (!email || !password) {
    showAuthMessage("Введите email и пароль", "error");
    return;
  }
  
  showAuthMessage("Выполняется вход...", "success");
  
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Вход выполнен успешно:", userCredential.user);
      showAuthMessage("Вход выполнен успешно!", "success");
    })
    .catch((error) => {
      console.error("Ошибка входа:", error);
      const errorMessage = getAuthErrorMessage(error.code);
      showAuthMessage('Ошибка входа: ' + errorMessage, "error");
    });
}

// Функция регистрации
function signup() {
  console.log("Функция signup вызвана");
  
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
  
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Создаем запись о пользователе в Firestore
      return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      showAuthMessage("Регистрация успешна!", "success");
    })
    .catch((error) => {
      console.error("Ошибка регистрации:", error);
      const errorMessage = getAuthErrorMessage(error.code);


showAuthMessage('Ошибка регистрации: ' + errorMessage, "error");
    });
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM загружен, инициализируем приложение...");
  
  // Назначаем обработчики кнопок
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('signup-btn').addEventListener('click', signup);
  
  // Инициализируем Firebase
  if (initializeFirebase()) {
    // Проверяем состояние аутентификации
    firebase.auth().onAuthStateChanged((user) => {
      console.log("Состояние аутентификации изменено:", user);
      if (user) {
        console.log("Пользователь авторизован:", user.email);
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
      } else {
        console.log("Пользователь не авторизован");
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
      }
    });
  }
});

