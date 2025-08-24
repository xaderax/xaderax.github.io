

const firebaseConfig = {
  apiKey: "AIzaSyCQTk07tMT8y7tYH0Tcz3xV747rJKBmfIE",
  authDomain: "grandstep-2e1d8.firebaseapp.com",
  projectId: "grandstep-2e1d8",
  storageBucket: "grandstep-2e1d8.firebasestorage.app",
  messagingSenderId: "307286256573",
  appId: "1:307286256573:web:3d4ecaf42690e0da2c40d4",
  measurementId: "G-5VYW104YG6"
}

// Проверка загрузки скрипта
        console.log("🚀 Script.js загружен успешно");

        // Проверка загрузки Firebase
        if (typeof firebase === 'undefined') {
            console.error("❌ Firebase не загружен. Проверьте подключение к интернету и CDN ссылки.");
            showAuthMessage("Ошибка загрузки Firebase. Проверьте подключение к интернету.", "error");
        } else {
            console.log("✅ Firebase загружен успешно");
            
            try {
                // Инициализируем Firebase
                firebase.initializeApp(firebaseConfig);
                console.log("✅ Firebase инициализирован успешно");
                
                // Получаем ссылки на сервисы
                const auth = firebase.auth();
                const db = firebase.firestore();
                
                console.log("✅ Сервисы Firebase доступны");
                
                // Переменные
                let currentUser = null;
                let selectedDate = null;
                let selectedClass = null;
                let currentMonth = new Date().getMonth();
                let currentYear = new Date().getFullYear();
                let classesByDate = {};

                // Показ сообщений аутентификации
                function showAuthMessage(message, type) {
                    console.log(`[AUTH ${type}] ${message}`);
                    const messageDiv = document.getElementById('auth-message');
                    if (messageDiv) {
                        messageDiv.textContent = message;
                        messageDiv.className = message ${type};
                    }
                }

                // Функция входа
                function login() {
                    console.log("🔐 Вызов функции login");
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    console.log("Введенные данные:", {email, password});
                    
                    if (!email || !password) {
                        showAuthMessage("Введите email и пароль", "error");
                        return;
                    }
                    
                    showAuthMessage("Выполняется вход...", "success");
                    
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            console.log("✅ Вход выполнен успешно:", userCredential.user);
                            showAuthMessage("Вход выполнен успешно!", "success");
                        })
                        .catch((error) => {
                            console.error("❌ Ошибка входа:", error);
                            let errorMessage = "Ошибка входа: ";
                            
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

                // Функция регистрации
                function signup() {
                    console.log("📝 Вызов функции signup");


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
                            console.error("❌ Ошибка регистрации:", error);
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
                        .then(() => {
                            console.log("✅ Выход выполнен успешно");
                            showAuthMessage("Вы вышли из системы", "success");
                        })
                        .catch((error) => {
                            console.error("❌ Ошибка выхода:", error);
                        });
                }

                // Проверка состояния аутентификации
                auth.onAuthStateChanged((user) => {
                    console.log("Состояние аутентификации изменено:", user);
                    if (user) {
                        currentUser = user;
                        console.log("✅ Пользователь авторизован:", user.email);
                        document.getElementById('auth-container').style.display = 'none';
                        document.getElementById('app-container').style.display = 'block';
                        initCalendar();
                    } else {
                        currentUser = null;
                        console.log("🔓 Пользователь не авторизован");
                        document.getElementById('auth-container').style.display = 'block';
                        document.getElementById('app-container').style.display = 'none';
                    }
                });

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
                    
                    // Текущая дата
                    const today = new Date();
                    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                    
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
                        const date = new Date(year, month, i);
                        const dateStr = formatDate(date);
                        
                        // Проверяем, является ли день сегодняшним
                        if (isCurrentMonth && i === today.getDate()) {
                            day.classList.add('today');
                        }
                        
                        day.innerHTML = <div class="day-number">${i}</div>;
                        
                        // Проверяем, есть ли занятия на эту дату
                        if (classesByDate[dateStr] && classesByDate[dateStr].length > 0) {
                            day.classList.add('has-classes');
                            const classPreview = classesByDate[dateStr][0];
                            day.innerHTML += <div class="class-preview">${classPreview.title}</div>;
                            
                            if (classesByDate[dateStr].length > 1) {
                                day.innerHTML += <div class="class-preview">+${classesByDate[dateStr].length - 1} еще</div>;
                            }
                        }
                        
                        day.addEventListener('click', () => selectDate(date));
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
                    
                    console.log("Загрузка занятий с", startDate, "по", endDate);
                    
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
                            
                            console.log("Занятия загружены:", classesByDate);
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
                    document.getElementById('day-details').


scrollIntoView({ behavior: 'smooth' });
                }

                // Открытие модального окна для записи
                function openBookingModal(classId) {
                    selectedClass = classId;
                    
                    db.collection('classes').doc(classId).get()
                        .then((doc) => {
                            if (!doc.exists) return;
                            
                            const classData = doc.data();
                            const modalInfo = document.getElementById('modal-class-info');
                            
                            modalInfo.innerHTML = `
                                <h3>${classData.title}</h3>
                                <p>Время: ${classData.date.toDate().toLocaleString()}</p>
                                <p>Инструктор: ${classData.instructor}</p>
                                <p>Места: ${classData.currentParticipants}/${classData.maxParticipants}</p>
                            `;
                            
                            document.getElementById('booking-modal').style.display = 'block';
                        })
                        .catch((error) => {
                            console.error("Ошибка загрузки информации о занятии:", error);
                        });
                }

                // Подтверждение записи
                function confirmBooking() {
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


loadMonthClasses(currentMonth, currentYear); // Обновляем список
                        })
                        .catch((error) => {
                            console.error('Ошибка записи:', error);
                            alert('Ошибка записи на занятие: ' + error.message);
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
                    console.log("✅ DOM полностью загружен");
                    
                    // Назначаем обработчики кнопок
                    document.getElementById('login-btn').addEventListener('click', login);
                    document.getElementById('signup-btn').addEventListener('click', signup);
                    document.getElementById('logout-btn').addEventListener('click', logout);
                    document.getElementById('prev-month-btn').addEventListener('click', () => changeMonth(-1));
                    document.getElementById('next-month-btn').addEventListener('click', () => changeMonth(1));
                    document.getElementById('today-btn').addEventListener('click', goToToday);
                    document.getElementById('confirm-booking').addEventListener('click', confirmBooking);
                    
                    // Закрытие модального окна
                    document.querySelector('.close').addEventListener('click', function() {
                        document.getElementById('booking-modal').style.display = 'none';
                    });
                    
                    // Закрытие модального окна при клике вне его
                    window.addEventListener('click', function(event) {
                        const modal = document.getElementById('booking-modal');
                        if (event.target === modal) {
                            modal.style.display = 'none';
                        }
                    });
                    
                    // Глобальные функции для использования в onclick
                    window.openBookingModal = openBookingModal;
                    
                    console.log("✅ Обработчики событий назначены");
                });

            } catch (error) {
                console.error("❌ Ошибка инициализации Firebase:", error);
                showAuthMessage("Ошибка инициализации Firebase: " + error.message, "error");
            }
        }

