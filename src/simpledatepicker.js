var simpleDatePicker = (function () {
    class SimpleDatePicker {
        constructor(selector, options = {}) {
            this.selector = selector;
            this.element  = document.querySelector(this.selector);
            this.activeDay = options.activeDay ? options.activeDay : new Date().getDate();
            this.activeMonth = options.activeMonth ? options.activeMonth - 1 : new Date().getMonth();
            this.activeYear = options.activeYear ? options.activeYear : new Date().getFullYear();
            this.daysInMonth = this.getDaysInMonth(this.activeMonth, this.activeYear);
            this.maxYears = options.maxYears ? options.maxYears : 3;
            this.maxDays = options.maxDays ? options.maxDays : 5;
            this.allowPrevDate = options.allowPrevDate ? options.allowPrevDate : 'true';
            this.showArrows = options.showArrows ? options.showArrows : 'true';
            this.arrowHtml = options.arrowHtml ? options.arrowHtml : '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"/></svg>';
            this.datePattern = options.datePattern ? options.datePattern : 'YYYY/MM/DD';
            this.langLocale = options.langLocale ? options.langLocale : 'default';
            this.inputType = options.inputType ? options.inputType : 'hidden';
            this.inputId = options.inputId ? options.inputId : 'selectedDate';
            this.liWidth = '100%';
            this.currentDay = new Date().getDate();
            this.currentMonth = new Date().getMonth();
            this.currentYear = new Date().getFullYear();
            this.mouseMoveListener = null;
            this.mouseDownListener = null;
            this.mouseUpListener = null;
            this.mouseLeaveListener = null;

            this.init();
        }

        createSimpleDatePicker(element) {
            const calendar = document.createElement("div");
            calendar.classList.add('simpleDatePicker');

            const yearContent = document.createElement("div");
            const yearList = document.createElement("ul");
            yearContent.classList.add('years');
            if(this.showArrows=='true') this.drawArrow(yearContent, 'prev');
            yearContent.appendChild(yearList);
            if(this.showArrows=='true') this.drawArrow(yearContent, 'next');
            yearList.appendChild(this.drawYear());
            calendar.appendChild(yearContent);
            
            const monthContent = document.createElement("div");
            const monthList = document.createElement("ul");
            monthContent.classList.add('months');
            if(this.showArrows=='true') this.drawArrow(monthContent, 'prev');
            monthContent.appendChild(monthList);
            if(this.showArrows=='true') this.drawArrow(monthContent, 'next');
            monthList.appendChild(this.drawMonth(this.activeMonth));
            calendar.appendChild(monthContent);
            
            const dayContent = document.createElement("div");
            const dayList = document.createElement("ul");
            dayContent.classList.add('days');
            if(this.showArrows=='true') this.drawArrow(dayContent, 'prev');
            dayContent.appendChild(dayList);
            if(this.showArrows=='true') this.drawArrow(dayContent, 'next');
            dayList.appendChild(this.drawDayList(this.activeDay, this.daysInMonth));
            calendar.appendChild(dayContent);
        
            element.appendChild(calendar);
            this.daysView();
            setTimeout(()=>{
                this.element.querySelectorAll('.days ul li').forEach(item => {
                    item.classList.add('anim');
                });
            }, 100);

            const input = document.createElement("input");
            input.setAttribute("type", this.inputType);
            input.setAttribute("id", this.inputId);
            const selectedDate = new Date(this.activeYear, this.activeMonth, this.activeDay);
            input.value = this.formatDate(selectedDate, this.datePattern);

            element.appendChild(input);
        }
        
        getDaysInMonth(month, year) {
            return new Date(year, month+1, 0).getDate();
        }
        
        getMonthName(monthNumber, locale = "default") {
            const date = new Date();
            date.setMonth(monthNumber - 1); // Set month (0-based index)
            // Use Intl.DateTimeFormat to get the month name in the specified locale
            return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
        }
        
        drawYear() {
            const ymin  = this.allowPrevDate=='true' ? this.activeYear - this.maxYears : this.currentYear;
            const ymax  = this.activeYear + this.maxYears + 1;
            const yearContainers = document.createDocumentFragment();
            
            for (let i = ymin; i < ymax ; i++) {
                const year = document.createElement("li");
                // year.style.opacity = '0';
                year.classList.add('year');
                (i==this.activeYear) ? year.classList.add('active') : '';
                year.innerHTML = '<span>' + i + '</span>';
                yearContainers.appendChild(year);
            }

            return yearContainers;
        }
        
        drawMonth(a) {
            const monthsContainer = document.createDocumentFragment();

            for (let i = 1; i < 13; i++) {
                const month = document.createElement("li");
                month.classList.add('month');
                (i-1==a) ? month.classList.add('active') : '';
                month.innerHTML = '<span>' + this.getMonthName(i, this.langLocale) + '</span>';
                monthsContainer.appendChild(month);
            }
            return monthsContainer;
        }
        
        drawDayList(d, dayM) {
            const dayContainer = document.createDocumentFragment();

            for (let i = 1; i <= dayM; i++) {
                const day = document.createElement("li");
                day.classList.add('day');
                day.setAttribute('data-day', i);
                (i==d) ? day.classList.add('active') : '';
                day.innerHTML = '<span>' + i + '</span>';
                dayContainer.appendChild(day);
            }

            return dayContainer;
        }

        // creates a list of days with the correct number of days for the month after changing the year or the month
        drawDays() {
            const newYear = this.element.querySelector('.years li.active').textContent.trim();
            const newMonth = Array.from(this.element.querySelectorAll('.months ul li')).findIndex(item => item.classList.contains('active'));
            const newdaysInMonth = this.daysInMonth = this.getDaysInMonth(newMonth, newYear);
            const newDay = this.element.querySelector('.days li.active').textContent.trim();
            let newDayValue = newDay>newdaysInMonth ? newdaysInMonth : newDay;
            if(this.allowPrevDate!='true' && this.isSameYear() && this.isSameMonth() && parseInt(newDay)<parseInt(this.currentDay) ) {
                newDayValue = this.currentDay;
            }
            const daysList = this.element.querySelector('.days ul');
            while (daysList.firstChild) {
                daysList.removeChild(daysList.firstChild);
            }
            daysList.appendChild(this.drawDayList(newDayValue, newdaysInMonth));

            this.element.querySelectorAll('.days ul li').forEach(item => {
                item.classList.remove('anim');
            });
            this.daysView();
            setTimeout(()=>{
                this.element.querySelectorAll('.days ul li').forEach(item => {
                    item.classList.add('anim');
                });
            }, 100);
            this.eventDragListeners();
        }

        // puts the selected day in the middle
        daysView() {
            const dayNodes = Array.from(this.element.querySelectorAll('.days ul li'));
            const dayIndex = dayNodes.findIndex(item => item.classList.contains('active'));
            const ulWidth = this.element.querySelector('.days ul').getBoundingClientRect().width;
            const changeCells = dayIndex - Math.floor(this.maxDays / 2);
            this.liWidth = ulWidth / this.maxDays;
            this.element.querySelectorAll('.days ul li').forEach(item => {
                item.style.width =  this.liWidth + 'px';
                item.style.transform =  'translateX(' + (-1 * this.liWidth * changeCells) + 'px)';
            });
        }
        
        drawArrow(item, name) {
            const arrowHtml = this.arrowHtml;
            const arrow = document.createElement("div");
            arrow.classList.add('arrow');
            arrow.classList.add('arrow-' + name);
            arrow.innerHTML = arrowHtml;
            item.appendChild(arrow);
        }
        
        formatDate(date, pattern) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(date.getDate()).padStart(2, '0');
            // Replace pattern placeholders with actual date values
            return pattern.replace(/YYYY/, year).replace(/MM/, month).replace(/DD/, day);
        }

        prevEl(i, min) {
            const x = i>min ? i-1 : min;
            return x;
        }

        nextEl(i, max) {
            const x = i<max ? i+1 : max;
            return x;
        }
        
        changeYear(dir) {
            const nodes = Array.from(this.element.querySelectorAll('.years ul li'));
            const index = nodes.findIndex(item => item.classList.contains('active'));
            const indexActive = nodes.findIndex(item => item.textContent.trim() == this.currentYear);
            nodes[index].classList.remove('active');
            const minYears = (this.allowPrevDate=='true') ? indexActive - this.maxYears : indexActive;
            dir==0 ? nodes[this.prevEl(index, minYears)].classList.add('active') : nodes[this.nextEl(index, indexActive + this.maxYears)].classList.add('active');
            if(this.allowPrevDate!='true' && dir==0 && this.isSameYear()) {
                const nodesMonth = Array.from(this.element.querySelectorAll('.months ul li'));
                const indexMonth = nodesMonth.findIndex(item => item.classList.contains('active'));
                if(indexMonth<this.currentMonth) {
                    const monthList = this.element.querySelector('.months ul');
                    while (monthList.firstChild) {
                        monthList.removeChild(monthList.firstChild);
                    }
                    monthList.appendChild(this.drawMonth(this.currentMonth));
                }
            }
            this.drawDays();
            this.selectedDateValue(this.element);
        }

        changeMonth(dir) {
            const nodes = Array.from(this.element.querySelectorAll('.months ul li'));
            const index = nodes.findIndex(item => item.classList.contains('active'));
            if(!(this.allowPrevDate!='true' && dir==0 && this.isSameYear() && this.isSameMonth())) {
                nodes[index].classList.remove('active');
                dir==0 ? nodes[this.prevEl(index, 0)].classList.add('active') : nodes[this.nextEl(index, 11)].classList.add('active');
                this.drawDays();
                this.selectedDateValue(this.element);
            }
        }

        changeDay(dir) {
            const dayNodes = Array.from(this.element.querySelectorAll('.days ul li'));
            const dayIndex = dayNodes.findIndex(item => item.classList.contains('active'));
            if(!(this.allowPrevDate!='true' && dir==0 && this.isSameYear() && this.isSameMonth() && this.isSameDay())) {
                dayNodes[dayIndex].classList.remove('active');
                dir==0 ? dayNodes[this.prevEl(dayIndex, 0)].classList.add('active') : dayNodes[this.nextEl(dayIndex, this.daysInMonth - 1)].classList.add('active');
                const changeCells = dir==0 ? this.prevEl(dayIndex, 0) - Math.floor(this.maxDays / 2) : this.nextEl(dayIndex, this.daysInMonth - 1) - Math.floor(this.maxDays / 2);
                this.element.querySelectorAll('.days ul li').forEach(item => {
                    item.style.transform =  'translateX(' + (-1 * this.liWidth * changeCells) + 'px)';
                });
                this.selectedDateValue(this.element);
            }
        }

        isSameYear() {
            const item = this.element.querySelector('.years ul li.active').textContent.trim();
            return item == this.currentYear ? true : false;
        }

        isSameMonth() {
            const item = this.element.querySelector('.months ul li.active').textContent.trim();
            return item == this.getMonthName(this.currentMonth + 1, this.langLocale) ? true : false;
        }
        
        isSameDay() {
            const item = this.element.querySelector('.days ul li.active').textContent.trim();
            return item == this.currentDay ? true : false;
        }

        selectedDateValue(element) {
            const year = element.querySelector('.years ul li.active').textContent.trim();
            const months = Array.from(element.querySelectorAll('.months ul li'));
            const month = months.findIndex(item => item.classList.contains('active'));
            const day = element.querySelector('.days ul li.active').textContent.trim();
            const selectedDate = new Date(year, month, day);
            element.querySelector('input').value = this.formatDate(selectedDate, this.datePattern);
        }

        // Snap to closest day on release
        snapToClosestDay(element, daysList, daysItems, translateX) {
            let closest = null;
            let minDist = Infinity;
            
            const parentRect = daysList.parentElement.getBoundingClientRect();
            const parentCenter = parentRect.left + parentRect.width / 2; // Center of visible area
        
            daysItems.forEach(li => {
                const rect = li.getBoundingClientRect();
                const centerDist = Math.abs(rect.left + rect.width / 2 - parentCenter);
                if (centerDist < minDist) {
                    minDist = centerDist;
                    closest = li;
                }
            });
        
            if (closest) {
                const targetX = parentCenter - closest.getBoundingClientRect().left - closest.offsetWidth / 2;
                translateX += targetX; // Adjust final position
        
                daysItems.forEach(li => {
                    li.style.transform = `translateX(${translateX}px)`;
                });
        
                // Highlight the selected day
                closest.classList.add('active');
                daysItems.forEach(li => {
                    if (li !== closest) li.classList.remove('active');
                });
        
                // Update selected date value (if needed)
                this.selectedDateValue(this.element);
            }
        }

        eventDragListeners() {
            const daysList = document.querySelector('.days ul');
            const daysItems = [...daysList.children];
            
            let isDragging = false;
            let startDragX = 0;
            let translateX = 0;
            let prevTranslateX = 0;
            
            function getTranslateX(daysItems) {
                const style = window.getComputedStyle(daysItems[0]);
                const matrix = new DOMMatrix(style.transform);
                return matrix.m41 || 0; // Extract translateX
            }
            
            this.mouseDownListener = (e) => {
                isDragging = true;
                startDragX = e.pageX;
                prevTranslateX = getTranslateX(daysItems);
                daysList.style.cursor = 'grabbing';
                daysList.classList.add('dragging');
                
                // Add mousemove event listener
                this.mouseMoveListener = (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    
                    const moveX = e.pageX - startDragX; // Drag distance
                    translateX = prevTranslateX + moveX;
                    
                    // Apply translation to all <li> elements
                    daysItems.forEach(li => {
                        li.style.transform = `translateX(${translateX}px)`;
                    });
                };
                
                daysList.addEventListener('mousemove', this.mouseMoveListener);
            };
            daysList.addEventListener('mousedown', this.mouseDownListener);

            this.mouseLeaveListener = (e) => {
                if (!isDragging) return;
                isDragging = false;
                this.snapToClosestDay(this.element, daysList, daysItems, translateX);
                daysList.removeEventListener('mousemove', this.mouseMoveListener);
            };
            daysList.addEventListener('mouseleave', this.mouseLeaveListener);

            this.mouseUpListener = (e) => {
                if (!isDragging) return;
                isDragging = false;
                daysList.style.cursor = 'grab';
                daysList.classList.remove('dragging');
                this.snapToClosestDay(this.element, daysList, daysItems, translateX);
                daysList.removeEventListener('mousemove', this.mouseMoveListener);
            };
            daysList.addEventListener('mouseup', this.mouseUpListener);
        }

        init() {
            this.createSimpleDatePicker(this.element);
            if(this.showArrows=='true') {
                this.element.querySelector('.years .arrow-prev').addEventListener('click', () => this.changeYear(0));
                this.element.querySelector('.years .arrow-next').addEventListener('click', () => this.changeYear(1));
                this.element.querySelector('.months .arrow-prev').addEventListener('click', () => this.changeMonth(0));
                this.element.querySelector('.months .arrow-next').addEventListener('click', () => this.changeMonth(1));
                this.element.querySelector('.days .arrow-prev').addEventListener('click', () => this.changeDay(0));
                this.element.querySelector('.days .arrow-next').addEventListener('click', () => this.changeDay(1));
            }
            this.eventDragListeners();
        }
    }

    return SimpleDatePicker;
})();





