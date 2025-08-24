// Инициализация Firebase
const firebaseConfig = {
  apiKey: "ваш_apiKey",
  authDomain: "ваш_проект.firebaseapp.com",
  projectId: "ваш_проект",
  storageBucket: "ваш_проект.appspot.com",
  messagingSenderId: "123456789",
  appId: "ваш_appId"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Переменные
let currentUser = null;
let selectedDate = null;
let selectedClass = null;

// Инициализация календаря
const datePicker = flatpickr("#date-picker", {
  locale: "ru",
  dateFormat: "Y-m-d",
  onChange: function(selectedDates) {
    selectedDate = selectedDates[0];
    loadClassesForDate(selectedDate);
  }
});

// Аутентификация
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      checkAuthState();
    })
    .catch((error) => {
      alert('Ошибка входа: ' + error.message);
    });
}

function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Создаем запись о пользователе в Firestore
      return db.collection('users').doc(userCredential.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert('Регистрация успешна!');
    })
    .catch((error) => {
      alert('Ошибка регистрации: ' + error.message);
    });
}

function logout() {
  auth.signOut();
}

function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'block';
      loadClassesForDate(selectedDate || new Date());
    } else {
      currentUser = null;
      document.getElementById('auth-container').style.display = 'block';
      document.getElementById('app-container').style.display = 'none';
    }
  });
}

// Загрузка занятий
function loadClassesForDate(date) {
  if (!date) return;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const classesList = document.getElementById('classes-list');
  classesList.innerHTML = 'Загрузка...';
  
  db.collection('classes')
    .where('date', '>=', startOfDay)
    .where('date', '<=', endOfDay)
    .get()
    .then((querySnapshot) => {
      classesList.innerHTML = '';
      
      if (querySnapshot.empty) {
        classesList.innerHTML = 'На выбранную дату занятий нет.';
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const classData = doc.data();
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        
        const classDate = classData.date.toDate();
        const isFull = classData.currentParticipants >= classData.maxParticipants;
        
        classCard.innerHTML = `
          <h3>${classData.title}</h3>
          <p>Время: ${classDate.toLocaleTimeString()}</p>
          <p>Продолжительность: ${classData.duration} мин.</p>
          <p>Инструктор: ${classData.instructor}</p>
          <p>Места: ${classData.currentParticipants}/${classData.maxParticipants}</p>
          <button ${isFull ? 'disabled' : ''} onclick="openBookingModal('${doc.id}')">
            ${isFull ? 'Мест нет' : 'Записаться'}
          </button>
        `;
        
        classesList.appendChild(classCard);
      });
    })
    .catch((error) => {
      console.error('Ошибка загрузки занятий:', error);
      classesList.innerHTML = 'Ошибка загрузки занятий.';
    });
}

// Работа с модальным окном
function openBookingModal(classId) {
  selectedClass = classId;
  
  db.collection('classes').doc(classId).get()
    .then((doc) => {if (!doc.exists) return;
      
      const classData = doc.data();
      const modalInfo = document.getElementById('modal-class-info');
      
      modalInfo.innerHTML = `
        <h3>${classData.title}</h3>
        <p>Время: ${classData.date.toDate().toLocaleString()}</p>
        <p>Инструктор: ${classData.instructor}</p>
        <p>Места: ${classData.currentParticipants}/${classData.maxParticipants}</p>
      `;
      
      document.getElementById('booking-modal').style.display = 'block';
    });
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('booking-modal').style.display = 'none';
});

// Подтверждение записи
document.getElementById('confirm-booking').addEventListener('click', function() {
  if (!currentUser || !selectedClass) return;
  
  // Проверяем, не записан ли уже пользователь
  db.collection('bookings')
    .where('userId', '==', currentUser.uid)
    .where('classId', '==', selectedClass)
    .where('status', '==', 'confirmed')
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        alert('Вы уже записаны на это занятие!');
        return;
      }
      
      // Проверяем, есть ли еще места
      return db.collection('classes').doc(selectedClass).get();
    })
    .then((doc) => {
      if (!doc.exists) return;
      
      const classData = doc.data();
      if (classData.currentParticipants >= classData.maxParticipants) {
        alert('К сожалению, места уже закончились!');
        return;
      }
      
      // Создаем запись и обновляем счетчик
      const batch = db.batch();
      
      // Добавляем запись
      const bookingRef = db.collection('bookings').doc();
      batch.set(bookingRef, {
        userId: currentUser.uid,
        classId: selectedClass,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'confirmed'
      });
      
      // Обновляем счетчик участников
      const classRef = db.collection('classes').doc(selectedClass);
      batch.update(classRef, {
        currentParticipants: firebase.firestore.FieldValue.increment(1)
      });
      
      return batch.commit();
    })
    .then(() => {
      alert('Вы успешно записаны на занятие!');
      document.getElementById('booking-modal').style.display = 'none';
      loadClassesForDate(selectedDate); // Обновляем список
    })
    .catch((error) => {
      console.error('Ошибка записи:', error);
      alert('Ошибка записи на занятие: ' + error.message);
    });
});

// Инициализация
checkAuthState();
