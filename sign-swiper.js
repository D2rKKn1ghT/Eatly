import { login, register, checkEmail, resetPassword } from './api.js';
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
}
function validateName(name) {
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s]{2,50}$/;
    return nameRegex.test(name);
}
function showValidationError(message) {
    Swal.fire({
        icon: 'warning',
        title: 'Ошибка валидации',
        text: message,
        confirmButtonText: 'OK'
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const regButton = document.querySelector('#reg');
    if (regButton) {
        regButton.addEventListener('click', async () => {
            const name = document.querySelector('.fio-sign')?.value.trim();
            const email = document.querySelector('.email-sign')?.value.trim();
            const password = document.querySelector('.password-sign')?.value;

            if (!name || !email || !password) {
                showValidationError('Пожалуйста, заполните все поля');
                return;
            }

            if (!validateName(name)) {
                showValidationError('ФИО должно содержать только буквы и быть не короче 2 символов');
                return;
            }

            if (!validateEmail(email)) {
                showValidationError('Пожалуйста, введите корректный email адрес');
                return;
            }

            if (!validatePassword(password)) {
                showValidationError('Пароль должен содержать минимум 6 символов, включая буквы и цифры');
                return;
            }

            try {
                const resetEmail = localStorage.getItem('resetEmail');
                const isPasswordReset = resetEmail && resetEmail === email;
                
                if (isPasswordReset) {
                    await Swal.fire({
                        icon: 'loading',
                        title: 'Смена пароля',
                        timerProgressBar: true,
                        timer:2400,
                        text: 'Подождите, идет попытка сменить пароль!',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false
                    });
                    const data = await resetPassword({ name, email, password });
                    console.log('Пароль успешно изменен:', data);
                    localStorage.removeItem('resetEmail');
                    window.location.href = 'signin.html';
                } else {
                    console.log('Registering new user:', email);
                    const data = await register({ name, email, password });
                    console.log('Успешная регистрация:', data);
                    window.location.href = 'signin.html';
                }
            } catch (error) {
                console.error('Ошибка:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    const loginButton = document.querySelector('#login');
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const email = document.querySelector('.email-sign')?.value.trim();
            const password = document.querySelector('.password-sign')?.value;

            if (!email || !password) {
                showValidationError('Пожалуйста, заполните все поля');
                return;
            }

            if (!validateEmail(email)) {
                showValidationError('Пожалуйста, введите корректный email адрес');
                return;
            }

            try {
                const data = await login({ email, password });
                console.log('Успешный вход:', data);
                
                // Сохраняем токен авторизации
                localStorage.setItem('token', data.token);

                await Swal.fire({
                    icon: 'success',
                    title: 'Успешный вход!',
                    text: 'Добро пожаловать!',
                    confirmButtonText: 'OK'
                });
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('Ошибка при входе:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка входа',
                    text: 'Ошибка при входе: ' + error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    }
    if (window.location.pathname.includes('password.html')) {
        const resetButton = document.querySelector('#resetPas');
        
        if (resetButton) {
            resetButton.addEventListener('click', async () => {
                const email = document.querySelector('#resetEmail').value.trim();
                
                if (!email) {
                    showValidationError('Пожалуйста, введите email');
                    return;
                }

                if (!validateEmail(email)) {
                    showValidationError('Пожалуйста, введите корректный email адрес');
                    return;
                }

                try {
                    const response = await checkEmail(email);
                    
                    if (response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Проверка почты',
                                text: response.message || "На ваш email отправлена ссылка для сброса пароля.",
                                confirmButtonText: 'OK'
                            }).then((result) => {
                            localStorage.setItem('resetEmail', email);
                            window.location.href = 'signup.html';
                            });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Ошибка',
                            text: response.error || 'Произошла ошибка',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error) {
                    console.error('Password reset error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Ошибка',
                        text: error.message,
                        confirmButtonText: 'OK'
                    });
                }
            });
        }
    }

    const swiperContainer = document.querySelector('.swiper-container');
    if (swiperContainer) {
        new Swiper('.swiper-container', {
            observer: true,
            observeParents: true,
            virtualTranslate: true,
            effect: "fade",
            fadeEffect: { crossFade: true },
            pagination: {
                el: '.blog-slider__pagination',
                clickable: true,
            },
            slidesPerView: 1,
        });
    }
    const inputs = document.querySelectorAll('.input-sign');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (input.value.trim() !== '') {
                input.classList.add('active');
            } else {
                input.classList.remove('active');
            }
        });
    });

    const passwordInput = document.querySelector('.password-sign');
    const passwordControl = document.querySelector('.password-control');
    
    if (passwordInput && passwordControl) {
        passwordInput.addEventListener('focus', function() {
            passwordControl.classList.add('active');
        });

        passwordInput.addEventListener('blur', function() {
            if (this.value === '') {
                passwordControl.classList.remove('active');
            }
        });

        passwordInput.addEventListener('input', function() {
            if (this.value !== '') {
                passwordControl.classList.add('active');
            } else {
                passwordControl.classList.remove('active');
            }
        });

        passwordControl.addEventListener('click', function() {
            this.classList.toggle('view');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }
});