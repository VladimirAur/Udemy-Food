document.addEventListener('DOMContentLoaded', () =>{

    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show');
        });

        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        });        
    }
    
    function showTabContent(i=0) {
        tabsContent[i].classList.add('show');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) =>{
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item){
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
        
    });

    // Timer

    const deadLine = '2021-05-11';

    function getTimeRemaning(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date());
        const days = Math.floor(t / (1000 * 60 * 60 * 24));
        const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((t / (1000 * 60)) % 60);
        const seconds = Math.floor((t / 1000)  % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };  
    
    } //getTimeRemaning

    function getZero(num) {
        if(num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);
        
        updateClock();    
        
        function updateClock() {
            const t = getTimeRemaning(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);
            
            if(t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
            
    }

    setClock('.timer', deadLine);

    // Modal

    const modalTrigger = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal');
        

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        // clearInterval(modalTimerId);
    }    

    function closeModal() {
        modal.classList.remove('show');
        modal.classList.add('hide');
        document.body.style.overflow = '';
    } 
    
    function showByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight){
            openModal();
            window.removeEventListener('scroll', showByScroll);
        }
    }

    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal);
    });    
    
    
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // const modalTimerId = setTimeout(openModal, 3000);
    
    window.addEventListener('scroll', showByScroll);

    // Classes card

    class MenuCard {
        constructor(src, altimg, title, descr, price, parentSelector, ...classes){
            this.src = src;
            this.altimg = altimg;
            this.title = title;
            this.descr = descr;
            this.price = price;        
            this.parent = document.querySelector(parentSelector);
            this.classes = classes;
            this.transfer = 27;
            this.changeToUAH();            
        }//constructor

        changeToUAH() {
           this.price = this.price * this.transfer;
        }

        render() {            
            const element = document.createElement('div');
            if (this.classes.length === 0){
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }
            
            element.innerHTML = `            
            <img src=${this.src} alt=${this.alt}>
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">${this.descr}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
                <div class="menu__item-cost">Цена:</div>
                <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
            </div>            
            `;

            this.parent.append(element);
        }//render

    } //MenuCard

    const getResource = async (url) =>{
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Coud not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    };//getResource

    getResource('http://localhost:3000/menu')
    .then(data => {
        data.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        });
    });
    

    // Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'icons/spinner.svg',
        succes: 'Спасибо! Мы скоро с Вами свяжемся.',
        failure:'Упс! Сообщение не отправлено!'
    };
    
    forms.forEach(item => { 
        bindPostData(item); 
    });

    const postData = async (url,data) =>{
        const res = await fetch(url, {
            method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: data
        });
        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) =>{
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            
            form.insertAdjacentElement('afterend',statusMessage);           
            
            const formData = new FormData(form); 
            
            const json = JSON.stringify(Object.fromEntries(formData.entries())); 

            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data);
                showThanksModal(message.succes);                                  
                statusMessage.remove(); 
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() =>{
                form.reset();
            });


        });
    }//postData

    

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">                
            <div class="modal__close" data-close>&times;</div> 
            <div class="modal__title">${message}</div>               
        </div>        
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    // Slider
    const slides = document.querySelectorAll('.offer__slide'),
            prev = document.querySelector('.offer__slider-prev'),
            next = document.querySelector('.offer__slider-next'),
            total = document.querySelector('#total'),
            curent = document.querySelector('#current');
    let slideIndex = 1;

    showSlides(slideIndex);

    if(slides.length < 10){
        total.textContent = `0${slides.length}`;
    } else{
        total.textContent = slides.length;
    }
    
    function showSlides(n) {
        if (n > slides.length) {
            slideIndex = 1; 
        }

        if (n < 1){
            slideIndex = slides.length;
        }

        slides.forEach(item => item.style.display = 'none');

        slides[slideIndex - 1].style.display = 'block';

        if(slides.length < 10){
            curent.textContent = `0${slideIndex}`;
        } else{
            curent.textContent = slideIndex;
        }

    }//showSlides

    function plusSlides(n) {
        showSlides(slideIndex +=n);
    }
    
    prev.addEventListener('click', () => {
        plusSlides(-1);
    });

    next.addEventListener('click', () => {
        plusSlides(1);
    });




});