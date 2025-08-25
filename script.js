// Проверка загрузки скрипта
console.log("Script.js загружен успешно");

const firebaseConfig = {
  apiKey: "AIzaSyCQTk07tMT8y7tYH0Tcz3xV747rJKBmfIE",
  authDomain: "grandstep-2e1d8.firebaseapp.com",
  projectId: "grandstep-2e1d8",
  storageBucket: "grandstep-2e1d8.firebasestorage.app",
  messagingSenderId: "307286256573",
  appId: "1:307286256573:web:3d4ecaf42690e0da2c40d4",
  measurementId: "G-5VYW104YG6"
}

    

        // Проверка загрузки Firebase
        if (typeof firebase === 'undefined') {
            console.error("Firebase не загружен. Проверьте подключение к интернету и CDN ссылки.");
            showAuthMessage("Ошибка загрузки Firebase. Проверьте подключение к интернету.", "error");
        } else {
            console.log("Firebase загружен успешно");
            
            try {
                // Инициализируем Firebase
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase инициализирован успешно");
                
                // Получаем ссылки на сервисы
                const auth = firebase.auth();
                const db = firebase.firestore();
                
                console.log("Сервисы Firebase доступны");
                
                // Переменные
                // Переменные
let currentUser = null;
let selectedDate = null;
let selectedClass = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let classesByDate = {};
let isAdmin = false;
let userBookings = []; // Добавляем массив для хранения бронирований пользователя

                // Показ сообщений аутентификации
                function showAuthMessage(message, type) {
                    console.log("[AUTH] " + message + " (" + type + ")");
                    const messageDiv = document.getElementById('auth-message');
                    if (messageDiv) {
                        messageDiv.textContent = message;
                        messageDiv.className = 'message ' + type;
                    }
                }

                // Показ сообщений для администратора
                function showAdminMessage(message, type) {
                    console.log("[ADMIN] " + message + " (" + type + ")");
                    const messageDiv = document.getElementById('admin-message');
                    if (messageDiv) {
                        messageDiv.textContent = message;
                        messageDiv.className = 'message ' + type;
                    }


}

                // Функция входа
                function login() {
                    console.log("Вызов функции login");
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    console.log("Введенные данные:", {email: email, password: password});
                    
                    if (!email || !password) {
                        showAuthMessage("Введите email и пароль", "error");
                        return;
                    }
                    
                    showAuthMessage("Выполняется вход...", "success");
                    
                    auth.signInWithEmailAndPassword(email, password)
                        .then(function(userCredential) {
                            console.log("Вход выполнен успешно:", userCredential.user);
                            showAuthMessage("Вход выполнен успешно!", "success");
                            
                            // Проверяем, является ли пользователь администратором
                            checkAdminStatus(userCredential.user.uid);
                        })
                        .catch(function(error) {
                            console.error("Ошибка входа:", error);
                            var errorMessage = "Ошибка входа: ";
                            
                            switch(error.code) {
                                case 'auth/invalid-email':
                                    errorMessage += "Неверный формат email";
                                    break;
                                case 'auth/user-disabled':
                                    errorMessage += "Пользователь заблокирован";
                                    break;
                                case 'auth/user-not-found':
                                    errorMessage += "Пользователь не найден";
                                    break;
                                case 'auth/wrong-password':
                                    errorMessage += "Неверный пароль";
                                    break;
                                default:
                                    errorMessage += error.message;
                            }
                            
                            showAuthMessage(errorMessage, "error");
                        });
                }

                // Проверка статуса администратора
                function checkAdminStatus(userId) {
                    db.collection('users').doc(userId).get()
                        .then(function(doc) {
                            if (doc.exists) {
                                const userData = doc.data();
                                isAdmin = userData.role === 'admin';
                                
                                if (isAdmin) {
                                    console.log("Пользователь является администратором");
                                    document.getElementById('admin-panel-btn').style.display = 'inline-block';
                                } else {
                                    console.log("Пользователь не является администратором");
                                    document.getElementById('admin-panel-btn').style.display = 'none';
                                    document.getElementById('admin-panel').style.display = 'none';
                                }
                            } else {
                                console.log("Документ пользователя не найден");
                                isAdmin = false;
                            }
                        })
                        .catch(function(error) {
                            console.error("Ошибка проверки статуса администратора:", error);
                            isAdmin = false;
                        });
                }

                // Функция регистрации
                // Функция регистрации
function signup() {
    console.log("Вызов функции signup");
    
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
        .then(function(userCredential) {
            // Создаем запись о пользователе в Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                role: 'user', // Устанавливаем роль по умолчанию
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(function() {
            showAuthMessage("Регистрация успешна!", "success");
        })
        .catch(function(error) {
            console.error("Ошибка регистрации:", error);
            let errorMessage = "Ошибка регистрации: ";
            
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += "Email уже используется";
                    break;
                case 'auth/invalid-email':
                    errorMessage += "Неверный формат email";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage += "Операция не разрешена";
                    break;
                case 'auth/weak-password':
                    errorMessage += "Пароль слишком простой";
                    break;
                default:
                    errorMessage += error.message;
            }
            
            showAuthMessage(errorMessage, "error");
        });
}

                // Функция выхода
                function logout() {
                    auth.signOut()
                        .then(function() {
                            console.log("Выход выполнен успешно");
                            showAuthMessage("Вы вышли из системы", "success");
                            isAdmin = false;
                            document.getElementById('admin-panel-btn').style.display = 'none';
                            document.getElementById('admin-panel').style.display = 'none';
                        })
                        .catch(function(error) {
                            console.error("Ошибка выхода:", error);
                        });
                }

                // Переключение панели администратора
                function toggleAdminPanel() {
                    const adminPanel = document.getElementById('admin-panel');
                    if (adminPanel.style.display === 'none') {
                        adminPanel.style.display = 'block';
                    } else {
                        adminPanel.style.display = 'none';
                    }
                }
// Получение количества участников для занятия
// Кэш для хранения количества участников
const participantsCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Получение количества участников с кэшированием
async function getParticipantsCount(classId) {
  const now = Date.now();
  
  // Проверяем кэш
  if (participantsCache[classId] && now - participantsCache[classId].timestamp < CACHE_DURATION) {
    return participantsCache[classId].count;
  }
  
  try {
    const snapshot = await db.collection('bookings')
      .where('classId', '==', classId)
      .where('status', '==', 'confirmed')
      .get();
    
    const count = snapshot.size;
    
    // Сохраняем в кэш
    participantsCache[classId] = {
      count: count,
      timestamp: now
    };
    
    return count;
  } catch (error) {
    console.error('Ошибка получения количества участников:', error);
    return 0;
  }
}

// Очистка кэша при изменении данных
function invalidateParticipantsCache(classId = null) {
  if (classId) {
    delete participantsCache[classId];
  } else {
    // Очищаем весь кэш
    participantsCache = {};
  }
}

// Получение количества участников для нескольких занятий
// Получение количества участников для нескольких занятий
async function getParticipantsCountForClasses(classIds) {
  try {
    const counts = {};
    const promises = [];
    
    // Создаем промисы для каждого занятия
    classIds.forEach(classId => {
      const promise = db.collection('bookings')
        .where('classId', '==', classId)
        .where('status', '==', 'confirmed')
        .get()
        .then(snapshot => {
          counts[classId] = snapshot.size;
        })
        .catch(error => {
          console.error(`Ошибка получения количества для занятия ${classId}:`, error);
          counts[classId] = 0;
        });
      
      promises.push(promise);
    });
    
    // Ждем завершения всех запросов
    await Promise.all(promises);
    return counts;
  } catch (error) {
    console.error('Общая ошибка получения количества участников:', error);
    
    // В случае ошибки возвращаем все нули
    const counts = {};
    classIds.forEach(classId => {
      counts[classId] = 0;
    });
    return counts;
  }
}
                // Добавление нового занятия
                function addNewClass(event) {
                    event.preventDefault();
                    const title = document.getElementById('class-title').value;
                    const description = document.getElementById('class-description').value;
                    const date = document.getElementById('class-date').value;
                    const time = document.getElementById('class-time').value;
                    const duration = parseInt(document.getElementById('class-duration').value);
                    const maxParticipants = parseInt(document.getElementById('class-max-participants').value);
                    const instructor = document.getElementById('class-instructor').value;
                    
                    if (!title || !date ||  !time || !duration || !maxParticipants || !instructor) {
                        showAdminMessage("Заполните все обязательные поля", "error");
                        return;

                    }
                    
                    // Создаем объект даты из отдельных полей даты и времени
                    const classDateTime = new Date(date + 'T' + time);
                    
                    showAdminMessage("Добавление занятия...", "success");
                    
                    db.collection('classes').add({
                        title: title,
                        description: description,
                        date: classDateTime,
                        duration: duration,
                        maxParticipants: maxParticipants,
                        currentParticipants: 0,
                        instructor: instructor
                    })
                    .then(function(docRef) {
                        console.log("Занятие добавлено с ID: ", docRef.id);
                        showAdminMessage("Занятие успешно добавлено!", "success");
                        
                        // Очищаем форму
                        document.getElementById('add-class-form').reset();
                        
                        // Обновляем календарь
                        loadMonthClasses(currentMonth, currentYear);
                    })
                    .catch(function(error) {
                        console.error("Ошибка добавления занятия: ", error);
                        showAdminMessage("Ошибка при добавлении занятия: " + error.message, "error");
                    });
                }



                // Инициализация календаря
               // Инициализация календаря
function initCalendar() {
    renderCalendar(currentMonth, currentYear);
    loadMonthClasses(currentMonth, currentYear);
    
    // Автоматически выбираем сегодняшнюю дату
    selectDate(new Date());
}

                // Отображение календаря
                function renderCalendar(month, year) {
                    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                                       "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];


document.getElementById('current-month-year').textContent = monthNames[month] + ' ' + year;
                    
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
                    
                    // Текущая дата
                    const today = new Date();
                    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                    
                    // Создаем дни из предыдущего месяца
                    const prevMonthLastDay = new Date(year, month, 0).getDate();
                    for (let i = 0; i < firstDayIndex; i++) {
                        const day = document.createElement('div');
                        day.className = 'day other-month';
                        day.innerHTML = '<div class="day-number">' + (prevMonthLastDay - firstDayIndex + i + 1) + '</div>';
                        daysContainer.appendChild(day);
                    }
                    
                    // Создаем дни текущего месяца
                    for (let i = 1; i <= daysInMonth; i++) {
                        const day = document.createElement('div');
                        day.className = 'day';
                        const date = new Date(year, month, i);
                        const dateStr = formatDate(date);
                        
                        // Проверяем, является ли день сегодняшним
                        if (isCurrentMonth && i === today.getDate()) {
                            day.classList.add('today');
                        }
                        
                        day.innerHTML = '<div class="day-number">' + i + '</div>';
                        
                        // Проверяем, есть ли занятия на эту дату
                        if (classesByDate[dateStr] && classesByDate[dateStr].length > 0) {
                            day.classList.add('has-classes');
                            const classPreview = classesByDate[dateStr][0];
                            day.innerHTML += '<div class="class-preview">' + classPreview.title + '</div>';
                            
                            if (classesByDate[dateStr].length > 1) {
                                day.innerHTML += '<div class="class-preview">+' + (classesByDate[dateStr].length - 1) + ' еще</div>';
                            }
                        }
                        
                        day.addEventListener('click', function() {
                            selectDate(date);
                        });
                        daysContainer.appendChild(day);
                    }
                    
                    // Создаем дни следующего месяца
                    const totalCells = 42; // 6 недель * 7 дней
                    const remainingCells = totalCells - (firstDayIndex + daysInMonth);
                    for (let i = 1; i <= remainingCells; i++) {
                        const day = document.createElement('div');
                        day.className = 'day other-month';
                        day.innerHTML = '<div class="day-number">' + i + '</div>';
                        daysContainer.appendChild(day);
                    }
                }

               // Загрузка занятий на месяц
async function loadMonthClasses(month, year) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  console.log("Загрузка занятий с", startDate, "по", endDate);
  
  try {
    // Загружаем занятия
    const classesSnapshot = await db.collection('classes')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
    
    // Собираем ID всех занятий
    const classIds = [];
    const classesData = [];
    
    classesSnapshot.forEach(doc => {
      const classData = doc.data();
      classesData.push({
        id: doc.id,
        ...classData
      });
      classIds.push(doc.id);
    });
    
    // Получаем количество участников для всех занятий
    const participantsCount = await getParticipantsCountForClasses(classIds);
    
    // Формируем данные для отображения
    classesByDate = {};
    classesData.forEach(classItem => {
      const dateStr = formatDate(classItem.date.toDate());
      if (!classesByDate[dateStr]) {
        classesByDate[dateStr] = [];
      }
      
      // Добавляем количество участников
      classItem.currentParticipants = participantsCount[classItem.id] || 0;
      classesByDate[dateStr].push(classItem);
    });
    
    console.log("Занятия загружены:", classesByDate);
    renderCalendar(currentMonth, currentYear);
  } catch (error) {
    console.error('Ошибка загрузки занятий:', error);
  }
}

                // Выбор даты
                // Выбор даты
// Выбор даты
// Выбор даты
// Выбор даты
async function selectDate(date) {
  selectedDate = date;
  const dateStr = formatDate(date);
  document.getElementById('selected-date').textContent = dateStr;
  
  const classesList = document.getElementById('classes-list');
  classesList.innerHTML = '';
  
  if (classesByDate[dateStr] && classesByDate[dateStr].length > 0) {
    // Загружаем актуальные данные о бронированиях пользователя
    await loadUserBookingsForDate(dateStr);
    
    classesByDate[dateStr].forEach(classData => {
      const classDate = classData.date.toDate();
      const isFull = classData.currentParticipants >= classData.maxParticipants;
      const isUserRegistered = userBookings.some(booking => 
        booking.classId === classData.id && booking.status === 'confirmed'
      );
      
      const classItem = document.createElement('div');
      classItem.className = 'class-item';
      
      let buttonHTML;
      if (isUserRegistered) {
        buttonHTML = '<button onclick="cancelBooking(\'' + classData.id + '\')" class="cancel-btn">Отписаться</button>';
      } else if (isFull) {
        buttonHTML = '<button disabled>Мест нет</button>';
      } else {
        buttonHTML = '<button onclick="openBookingModal(\'' + classData.id + '\')">Записаться</button>';
      }
      
      classItem.innerHTML = 
        '<h4>' + classData.title + '</h4>' +
        '<p>Время: ' + classDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</p>' +
        '<p>Инструктор: ' + classData.instructor + '</p>' +
        '<p>Места: ' + classData.currentParticipants + '/' + classData.maxParticipants + '</p>' +
        buttonHTML;
      
      classesList.appendChild(classItem);
    });
  } else {
    classesList.innerHTML = '<p>На выбранную дату занятий нет.</p>';
  }
  
  // Прокручиваем к деталям дня
  document.getElementById('day-details').scrollIntoView({ behavior: 'smooth' });
}
              // Загрузка бронирований пользователя для определенной даты
// Загрузка бронирований пользователя для определенной даты
function loadUserBookingsForDate(dateStr) {
    if (!currentUser) return Promise.resolve();
    
    return db.collection('bookings')
        .where('userId', '==', currentUser.uid)
        .where('status', '==', 'confirmed')
        .get()
        .then(function(querySnapshot) {
            userBookings = [];
            const promises = [];
            
            querySnapshot.forEach(function(doc) {
                const bookingData = doc.data();
                
                const promise = db.collection('classes').doc(bookingData.classId).get()
                    .then(function(classDoc) {
                        if (classDoc.exists) {
                            const classData = classDoc.data();
                            const classDateStr = formatDate(classData.date.toDate());
                            
                            if (classDateStr === dateStr) {
                                userBookings.push({
                                    id: doc.id,
                                    classId: bookingData.classId,
                                    status: bookingData.status
                                });
                            }
                        }
                    });
                
                promises.push(promise);
            });
            
            return Promise.all(promises);
        })
        .catch(function(error) {
            console.error("Ошибка загрузки бронирований:", error);
            return Promise.resolve();
        });
}

              // Отмена бронирования
// Отмена бронирования
// Отмена бронирования
// Отмена бронирования через Cloud Function
// Отмена бронирования
// Отмена бронирования
// Отмена бронирования
async function cancelBooking(classId) {
  if (!currentUser) {
    alert('Для отмены записи необходимо авторизоваться');
    return;
  }
  
  try {
    // Находим бронирование пользователя для этого занятия
    const bookingQuery = await db.collection('bookings')
      .where('userId', '==', currentUser.uid)
      .where('classId', '==', classId)
      .where('status', '==', 'confirmed')
      .get();
    
    if (bookingQuery.empty) {
      alert('Бронирование не найдено!');
      return;
    }
    
    // Подтверждение отмены
    if (!confirm('Вы уверены, что хотите отменить запись на это занятие?')) {
      return;
    }
    
    // Обновляем статус бронирования
    const bookingId = bookingQuery.docs[0].id;
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('Запись на занятие отменена!');
    
    // Обновляем отображение
    await loadMonthClasses(currentMonth, currentYear);
    selectDate(selectedDate);
  } catch (error) {
    console.error('Ошибка отмены бронирования:', error);
    
    // Проверяем тип ошибки
    if (error.code === 'permission-denied') {
      alert('Ошибка доступа. У вас нет прав для отмены этой записи.');
    } else {
      alert('Ошибка отмены бронирования: ' + error.message);
    }
  }
}
// Проверка прав доступа пользователя
function checkUserPermissions() {
    if (!currentUser) {
        console.log("Пользователь не аутентифицирован");
        return;
    }
    
    console.log("ID пользователя:", currentUser.uid);
    
    // Проверяем наличие документа пользователя
    db.collection('users').doc(currentUser.uid).get()
        .then(function(doc) {
            if (doc.exists) {
                console.log("Данные пользователя:", doc.data());
                
                // Проверяем роль пользователя
                const userData = doc.data();
                if (userData.role) {
                    console.log("Роль пользователя:", userData.role);
                } else {
                    console.log("Роль пользователя не установлена");
                }
            } else {
                console.log("Документ пользователя не найден");
            }
        })
        .catch(function(error) {
            console.error("Ошибка загрузки данных пользователя:", error);
        });
}

// Проверка прав доступа к конкретному документу
function testDocumentAccess(collectionName, docId) {
    db.collection(collectionName).doc(docId).get()
        .then(function(doc) {
            console.log("Доступ к документу разрешен:", doc.exists);
        })
        .catch(function(error) {
            console.error("Ошибка доступа к документу:", error);
        });
}
// Проверка состояния аутентификации
auth.onAuthStateChanged(function(user) {
    console.log("Состояние аутентификации изменено:", user);
    if (user) {
        currentUser = user;
        console.log("Пользователь авторизован:", user.email);
        
        // Проверяем права доступа
        checkUserPermissions();
        
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        initCalendar();
    } else {
        currentUser = null;
        console.log("Пользователь не авторизован");
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }
});
              // Мгновенное обновление данных занятия
function updateClassData(classId, change) {
    // Находим занятие в кэше и обновляем счетчик
    for (const date in classesByDate) {
        const classes = classesByDate[date];
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                classes[i].currentParticipants += change;
                break;
            }
        }
    }
}

// Мгновенное обновление бронирований пользователя
function updateUserBookings(classId, isAdding) {
    if (isAdding) {
        // Добавляем запись о бронировании
        userBookings.push({
            classId: classId,
            status: 'confirmed'
        });
    } else {
        // Удаляем запись о бронировании
        userBookings = userBookings.filter(booking => booking.classId !== classId);
    }
}

                // Открытие модального окна для записи
function openBookingModal(classId) {
    selectedClass = classId;
    
    // Используем актуальные данные из кэша
    for (const date in classesByDate) {
        const classes = classesByDate[date];
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                const classData = classes[i];
                const modalInfo = document.getElementById('modal-class-info');
                
                modalInfo.innerHTML = 
                    '<h3>' + classData.title + '</h3>' +
                    '<p>Время: ' + classData.date.toDate().toLocaleString() + '</p>' +
                    '<p>Инструктор: ' + classData.instructor + '</p>' +
                    '<p>Места: ' + classData.currentParticipants + '/' + classData.maxParticipants + '</p>';
                
                document.getElementById('booking-modal').style.display = 'block';
                return;
            }
        }
    }
    
    // Если не нашли в кэше, загружаем из базы
    db.collection('classes').doc(classId).get()
        .then(function(doc) {
            if (!doc.exists) return;
            
            const classData = doc.data();
            const modalInfo = document.getElementById('modal-class-info');
            
            modalInfo.innerHTML = 
                '<h3>' + classData.title + '</h3>' +
                '<p>Время: ' + classData.date.toDate().toLocaleString() + '</p>' +
                '<p>Инструктор: ' + classData.instructor + '</p>' +
                '<p>Места: ' + classData.currentParticipants + '/' + classData.maxParticipants + '</p>';
            
            document.getElementById('booking-modal').style.display = 'block';
        })
        .catch(function(error) {
            console.error("Ошибка загрузки информации о занятии:", error);
        });
}

                // Подтверждение записи
// Подтверждение записи через Cloud Function
// Подтверждение записи
// Подтверждение записи
// Подтверждение записи
async function confirmBooking() {
  if (!currentUser || !selectedClass) return;
  
  try {
    // Проверяем, не записан ли уже пользователь
    const existingBooking = await db.collection('bookings')
      .where('userId', '==', currentUser.uid)
      .where('classId', '==', selectedClass)
      .where('status', '==', 'confirmed')
      .get();
    
    if (!existingBooking.empty) {
      alert('Вы уже записаны на это занятие!');
      return;
    }
    
    // Проверяем, есть ли еще места
    const classDoc = await db.collection('classes').doc(selectedClass).get();
    if (!classDoc.exists) return;
    
    const classData = classDoc.data();
    const participantsCount = await getParticipantsCount(selectedClass);
    
    if (participantsCount >= classData.maxParticipants) {
      alert('К сожалению, места уже закончились!');
      return;
    }
    
    // Создаем запись о бронировании
    await db.collection('bookings').add({
      userId: currentUser.uid,
      classId: selectedClass,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'confirmed'
    });
    
    alert('Вы успешно записаны на занятие!');
    document.getElementById('booking-modal').style.display = 'none';
    
    // Обновляем отображение
    await loadMonthClasses(currentMonth, currentYear);
    selectDate(selectedDate);
  } catch (error) {
    console.error('Ошибка записи:', error);
    alert('Ошибка записи на занятие: ' + error.message);
  }
}

// Проверка доступности мест
function checkClassAvailability(classId) {
    db.collection('classes').doc(classId).get()
        .then(function(doc) {
            if (!doc.exists) return;
            
            const classData = doc.data();
            if (classData.currentParticipants >= classData.maxParticipants) {
                alert('К сожалению, места уже закончились!');
            } else {
                alert('Ошибка доступа. Пожалуйста, попробуйте еще раз или обратитесь к администратору.');
            }
        })
        .catch(function(error) {
            console.error('Ошибка проверки доступности:', error);
            alert('Ошибка проверки доступности мест: ' + error.message);
        });
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

                // Переход к текущему месяцу
                function goToToday() {
                    const today = new Date();
                    currentMonth = today.getMonth();
                    currentYear = today.getFullYear();
                    
                    renderCalendar(currentMonth, currentYear);
                    loadMonthClasses(currentMonth, currentYear);
                    selectDate(today);
                }

                // Вспомогательная функция для форматирования даты
                function formatDate(date) {
                    return date.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }

                // Инициализация при загрузке DOM
                document.addEventListener('DOMContentLoaded', function() {
                    console.log("DOM полностью загружен");
                    
                    // Назначаем обработчики кнопок
                    document.getElementById('login-btn').addEventListener('click', login);
                    document.getElementById('signup-btn').addEventListener('click', signup);
                    document.getElementById('logout-btn').addEventListener('click', logout);
                    document.getElementById('prev-month-btn').addEventListener('click', function() { changeMonth(-1); });
                    document.getElementById('next-month-btn').addEventListener('click', function() { changeMonth(1); });
                    document.getElementById('today-btn').addEventListener('click', goToToday);
                    document.getElementById('confirm-booking').addEventListener('click', confirmBooking);
                    document.getElementById('admin-panel-btn').addEventListener('click', toggleAdminPanel);
                    document.getElementById('add-class-form').addEventListener('submit', addNewClass);
                    
                    // Устанавливаем сегодняшнюю дату в форму по умолчанию
                    const today = new Date();
                    const formattedDate = today.toISOString().split('T')[0];
                    document.getElementById('class-date').value = formattedDate;
                    
                    // Устанавливаем время по умолчанию (ближайший час)
                    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
                    const formattedTime = nextHour.toTimeString().substr(0, 5);
                    document.getElementById('class-time').value = formattedTime;
                    
                    // Закрытие модального окна
                    document.querySelector('.close').addEventListener('click', function() {
                        document.getElementById('booking-modal').style.display = 'none';
                    });
                    
                    // Закрытие модального окна при клике вне его
                    window.addEventListener('click', function(event) {
                        if (event.target.classList.contains('modal')) {
                            event.target.style.display = 'none';
                        }
                    });
                    
                    // Глобальные функции для использования в onclick
                    window.openBookingModal = openBookingModal;
                  window.cancelBooking = cancelBooking;
window.openBookingModal = openBookingModal;
                    
                    console.log("Обработчики событий назначены");
                });

            } catch (error) {
                console.error("Ошибка инициализации Firebase:", error);
showAuthMessage("Ошибка инициализации Firebase: " + error.message, "error");
            }
        }
