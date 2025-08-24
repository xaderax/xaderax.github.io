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

// Переменные
let currentUser = null;
let selectedDate = null;
let selectedClass = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let classesByDate = {}; // Кэш занятий по датам

// Инициализация календаря
function initCalendar() {
    renderCalendar(currentMonth, currentYear);
    loadMonthClasses(currentMonth, currentYear);
}

// Отображение календаря
function renderCalendar(month, year) {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                       "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    
    document.getElementById('current-month-year').textContent = ${monthNames[month]} ${year};
    
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    // День недели первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    // Количество дней в месяце
    const daysInMonth = lastDay.getDate();
    
    // Создаем дни из предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayIndex; i++) {
        const day = document.createElement('div');
        day.className = 'day other-month';
        day.innerHTML = <div class="day-number">${prevMonthLastDay - firstDayIndex + i + 1}</div>;
        daysContainer.appendChild(day);
    }
    
    // Создаем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        const dateStr = formatDate(new Date(year, month, i));
        
        day.innerHTML = `
            <div class="day-number">${i}</div>
        `;
        
        // Проверяем, есть ли занятия на эту дату
        if (classesByDate[dateStr] && classesByDate[dateStr].length > 0) {
            day.classList.add('has-classes');
            const classPreview = classesByDate[dateStr][0];
            day.innerHTML += <div class="class-preview">${classPreview.title}</div>;
            
            if (classesByDate[dateStr].length > 1) {
                day.innerHTML += <div class="class-preview">+${classesByDate[dateStr].length - 1} еще</div>;
            }
        }
        
        day.addEventListener('click', () => selectDate(new Date(year, month, i)));
        daysContainer.appendChild(day);
    }
    
    // Создаем дни следующего месяца
    const totalCells = 42; // 6 недель * 7 дней
    const remainingCells = totalCells - (firstDayIndex + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.className = 'day other-month';
        day.innerHTML = <div class="day-number">${i}</div>;
        daysContainer.appendChild(day);
    }
}

// Загрузка занятий на месяц
function loadMonthClasses(month, year) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    db.collection('classes')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get()
        .then((querySnapshot) => {
            classesByDate = {};
            
            querySnapshot.forEach((doc) => {
                const classData = doc.data();
                const classDate = classData.date.toDate();
                const dateStr = formatDate(classDate);
                
                if (!classesByDate[dateStr]) {
                    classesByDate[dateStr] = [];
                }
                
                classesByDate[dateStr].push({
                    id: doc.id,
                    ...classData
                });
            });
            
            renderCalendar(currentMonth, currentYear);
        })
        .catch((error) => {
            console.error('Ошибка загрузки занятий:', error);
        });
}

// Выбор даты
function selectDate(date) {
    selectedDate = date;
    const dateStr = formatDate(date);
    document.getElementById('selected-date').textContent = dateStr;
    
    const classesList = document.getElementById('classes-list');
    classesList.innerHTML = '';
    
    if (classesByDate[dateStr] && classesByDate[dateStr].length > 0) {
        classesByDate[dateStr].forEach((classData) => {
            const classDate = classData.date.toDate();
            const isFull = classData.currentParticipants >= classData.maxParticipants;
            
            const classItem = document.createElement('div');
            classItem.className = 'class-item';
            classItem.innerHTML = `
                <h4>${classData.title}</h4>
                <p>Время: ${classDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p>Инструктор: ${classData.instructor}</p>
                <p>Места: ${classData.currentParticipants}/${classData.maxParticipants}</p>
                <button ${isFull ? 'disabled' : ''} onclick="openBookingModal('${classData.id}')">
                    ${isFull ? 'Мест нет' : 'Записаться'}
                </button>
            `;
            
            classesList.appendChild(classItem);
        });
    } else {
        classesList.innerHTML = '<p>На выбранную дату занятий нет.</p>';
    }
    
    // Прокручиваем к деталям дня
    document.getElementById('day-details').scrollIntoView({ behavior: 'smooth' });
}

// Смена месяца
function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar(currentMonth, currentYear);
    loadMonthClasses(currentMonth, currentYear);
}

// Вспомогательная функция для форматирования даты
function formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ... остальной код (аутентификация, модальное окно, запись на занятие) ...

// Обновляем функцию checkAuthState
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            initCalendar(); // Инициализируем календарь вместо загрузки занятий на конкретную дату
        } else {
            currentUser = null;
            document.getElementById('auth-container').style.display = 'block';
            document.getElementById('app-container').style.display = 'none';
        }
    });
}

// Обновляем функцию после успешной записи
// В обработчике подтверждения записи добавляем:
// loadMonthClasses(currentMonth, currentYear); // Перезагружаем занятия для месяца
