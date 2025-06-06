import { login, register, checkEmail, resetPassword } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const regButton = document.querySelector('#reg');
    if (regButton) {
        regButton.addEventListener('click', async () => {
            const name = document.querySelector('.fio-sign')?.value;
            const email = document.querySelector('.email-sign')?.value;
            const password = document.querySelector('.password-sign')?.value;

            if (!name || !email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }

            try {
                const isPasswordReset = localStorage.getItem('resetEmail') === email;
                
                if (isPasswordReset) {
                    const data = await resetPassword({ name, email, password });
                    console.log('Пароль успешно изменен:', data);
                    localStorage.removeItem('resetEmail');
                    alert('Пароль успешно изменен! Теперь вы можете войти.');
                    window.location.href = 'signin.html';
                } else {
                    const data = await register({ name, email, password });
                    console.log('Успешная регистрация:', data);
                    window.location.href = 'signin.html';
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка: ' + error.message);
            }
        });
    }

    const loginButton = document.querySelector('#login');
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const email = document.querySelector('.email-sign')?.value;
            const password = document.querySelector('.password-sign')?.value;

            if (!email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }

            try {
                const data = await login({ email, password });
                console.log('Успешный вход:', data);
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Ошибка при входе:', error);
                alert('Ошибка при входе: ' + error.message);
            }
        });
    }
    if (window.location.pathname.includes('password.html')) {
        const resetButton = document.querySelector('#resetPas');
        
        if (resetButton) {
            resetButton.addEventListener('click', async () => {
                const email = document.querySelector('#resetEmail').value;
                
                if (!email) {
                    alert('Пожалуйста, введите email');
                    return;
                }

                try {
                    const response = await checkEmail(email);
                    
                    if (response.success) {
                        alert(response.message || "На ваш email отправлена ссылка для сброса пароля.");
                        localStorage.setItem('resetEmail', email);
                        window.location.href = 'signup.html';
                    } else {
                        alert(response.error || 'Произошла ошибка');
                    }
                } catch (error) {
                    console.error('Password reset error:', error);
                    alert(error.message);
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