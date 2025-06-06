import { sendSupportRequest } from './api.js';
// 'Like' activity
const hearts = document.querySelectorAll('.ri-heart-line');

hearts.forEach(heart => {
    let isClicked = false;

    heart.addEventListener('mouseover', function() {
        if (!isClicked) {
            this.classList.toggle('ri-heart-fill', true);
            this.classList.toggle('ri-heart-line', false);
        }
    });

    heart.addEventListener('mouseout', function() {
        if (!isClicked) {
            this.classList.toggle('ri-heart-fill', false);
            this.classList.toggle('ri-heart-line', true);
        }
    });

    heart.addEventListener('click', function() {
        isClicked = !isClicked;
        this.classList.toggle('ri-heart-fill', isClicked);
        this.classList.toggle('ri-heart-line', !isClicked);
    });
});
// Arrow appereance activity
const arrow = document.getElementById('arrow');
if (arrow) {
    const threshold = window.innerHeight * 1.35; // Appear when passed 135% of page

    function handleScroll() {
        const scrollTop = window.pageYOffset;

        if (scrollTop > threshold) {
            arrow.classList.add('visible');
        } else {
            arrow.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', handleScroll);
}
// Bookmark activity
const bookmarks = document.querySelectorAll('.bookmark');

bookmarks.forEach(bookmark => {
    let isClicked = false;
    bookmark.addEventListener('click', function(event) {
        if (event.target.classList.contains('ri-bookmark-fill')) {
            isClicked = !isClicked;
            const icon = this.querySelector('.ri-bookmark-fill');
            if (isClicked) {
                icon.classList.add('choose');
                this.classList.add('spanchoose');
            } else {
                icon.classList.remove('choose');
                this.classList.remove('spanchoose');
            }
        }
    });
});


// terminal expence
const select = document.querySelector('#time-select');
const expenceProgressBar = document.querySelector('.expence .expence-progress-bar');
const vocherProgressBar = document.querySelector('.vocher .expence-progress-bar');
const expencePrice = document.querySelector('.expence .price');
const vocherPrice = document.querySelector('.vocher .price');
const expencePercent = document.querySelector('.expence p:nth-child(3)');
const vocherPercent = document.querySelector('.vocher p:nth-child(3)');

const progressValues = {
    'today': { 
        expence: { width: '20%', price: '5949.99 ₽', percent: '--%' },
        vocher: { width: '10%', price: '2911.99 ₽', percent: '--%' }
    },
    'yesterday': { 
        expence: { width: '30%', price: '8924.99 ₽', percent: 'Увеличились на 3%' },
        vocher: { width: '20%', price: '5823.98 ₽', percent: 'Увеличилось на 2%' }
    },
    'week': { 
        expence: { width: '50%', price: '14874.98 ₽', percent: 'Увеличились на 5%' },
        vocher: { width: '40%', price: '11647.95 ₽', percent: 'Увеличилось на 4%' }
    },
    'month': { 
        expence: { width: '70%', price: '29749.95 ₽', percent: 'Увеличились на 10%' },
        vocher: { width: '60%', price: '14559.94 ₽', percent: 'Увеличилось на 5%' }
    },
    'year': { 
        expence: { width: '90%', price: '356999.40 ₽', percent: 'Увеличились на 15%' },
        vocher: { width: '80%', price: '174719.28 ₽', percent: 'Увеличилось на 8%' }
    }
};

if (select) {
    select.addEventListener('change', function (event) {
        const selectedValue = event.target.value;
        
        if (progressValues[selectedValue]) {
            expenceProgressBar.style.width = progressValues[selectedValue].expence.width;
            expencePrice.textContent = progressValues[selectedValue].expence.price;
            expencePercent.textContent = progressValues[selectedValue].expence.percent;

            vocherProgressBar.style.width = progressValues[selectedValue].vocher.width;
            vocherPrice.textContent = progressValues[selectedValue].vocher.price;
            vocherPercent.textContent = progressValues[selectedValue].vocher.percent;
        }
    });
}

if (typeof document.querySelector('#freePrice') !== 'undefined'){
    try{
        const freeButton = document.querySelector('#freePrice');
        freeButton.addEventListener('click', async () => {
            alert('Уже подключен!' );
            });
        const premButton = document.querySelector('#premPrice');
        premButton.addEventListener('click', async () => {
            alert('Платеж временно недоступен!' );
            }); 
    }catch{

    }
}
// Library Swipper
// https://swiperjs.com
document.addEventListener('DOMContentLoaded', function() {
    var swiper = new Swiper('.swiper-container', {
    observer: true,
    observeParents: true,
    slidesPerView: 2.6,
    spaceBetween: 45,
    loop: false,
    on: {
    slideChange: function () {
    updateProgressBar(this);
    },
    init: function () {
    updateProgressBar(this);
    },
    },
    });
});

function updateProgressBar(swiperInstance) {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    const progress = swiperInstance.activeIndex / (swiperInstance.slides.length - 1);
    progressBar.style.width = `${progress * 100}%`;
}
if (typeof document.querySelector('.problem-send') !== 'undefined'){
    try{
        const supportButton = document.querySelector('.problem-send');
        supportButton.addEventListener('click', async () => {
        const name = document.getElementById('FIO').value;
        const email = document.getElementById('email-text').value;
        const problem = document.getElementById('problem').value;

        try {
            const response = await sendSupportRequest({ name, email, problem });
            

            if (response.success) {
            alert('✅ ' + response.message);

            document.getElementById('FIO').value = '';
            document.getElementById('email-text').value = '';
            document.getElementById('problem').value = '';
            } else {
            alert('❌ ' + response.error);
            }
        } catch (error) {
            alert('❌ Ошибка при отправке обращения: ' + error.message);
        }
        });
    }catch{

    }
}

