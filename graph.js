import Victor from "https://cdn.skypack.dev/victor@1.1.0";

'use strict';

/**
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 */
class graph {
  // Идентификатор HTML-элемента-оболочки (instanceof HTMLElement)
  #id = 'graph';

  // Прочитать идентификатор HTML-элемента-оболочки (instanceof HTMLElement)
  get id() {
    return this.#id;
  }

  // Классы которые будут записаны в HTML-элементы
  classes = {
    node: {
      shell: ['nodes'],
      element: ['node'],
      onmouseenter: ['onmouseenter'],
      title: ['title'],
      cover: ['cover'],
      description: {
        both: ['description'],
        hidden: ['hidden'],
        shown: ['shown']
      },
      close: {
        both: ['close'],
        hidden: ['hidden'],
        shown: ['shown']
      },
      wrappers: {
        both: ['wrapper'],
        left: ['left'],
        right: ['right']
      },
      animation: ['animation']
    },
    connection: {
      shell: ['connections'],
      element: ['connection']
    }
  };

  // Оболочка (instanceof HTMLElement)
  #shell = document.getElementById(this.id);
  get shell() {
    return this.#shell;
  }

  // Реестр узлов
  #nodes = new Set;
  get nodes() {
    return this.#nodes;
  }

  // Реестр соединений
  #connections = new Set;
  get connections() {
    return this.#connections;
  }

  // Статус активации функций взаимодействий узлов
  actions = {
    pushing: true,
    pulling: true,
    move: {
      shell: true,
      node: true
    }
  }

  // Класс узла
  #node = class node {
    // Реестр входящих соединений
    #inputs = new Set();

    // Прочитать реестр входящих соединений
    get inputs() { return this.#inputs }

    // Реестр исходящих соединений
    #outputs = new Set();

    // Прочитать реестр исходящих соединений
    get outputs() { return this.#outputs }

    // Оператор
    #operator;

    // Прочитать оператора
    get operator() { return this.#operator }

    // HTML-элемент-оболочка
    #shell;

    // Прочитать HTML-элемент-оболочка
    get shell() { return this.#shell }

    // HTML-элемент
    #element;

    // Прочитать HTML-элемент
    get element() { return this.#element }

    // Наблюдатель
    #observer = null;

    // Прочитать наблюдатель
    get observer() { return this.#observer }

    // Реестр запрещённых к изменению параметров
    #block = new Set(['events']);

    // Прочитать реестр запрещённых к изменению параметров
    get block() { return this.#block }

    // Диаметр узла
    #diameter = 100;

    // Прочитать диаметр узла
    get diameter() { return this.#diameter }

    // Степень увеличения диаметра
    #increase = 0;

    // Прочитать степень увеличения диаметра
    get increase() { return this.#increase }

    // Величина степени увеличения диаметра
    #addition = 12;

    // Прочитать величину степени увеличения диаметра
    get addition() { return this.#addition }

    // Величина степени увеличения притягивания и отталкивания
    #shift = 0;

    // Прочитать величину степени увеличения притягивания и отталкивания
    get shift() { return this.#shift }

    /**
     * Обработка событий
     *
     * max - максимум итераций в процессе
     * current - текущая итерация в процессе
     */
    actions = {
      move: {
        active: true,
        unlimit: false
      },
      pushing: {
        active: true,
        max: 100,
        current: 0
      },
      pulling: {
        active: true,
        max: 100,
        current: 0
      }
    };

    /**
     * Отталкивания
     *
     * Реестр узлов которые обработали отталкивание с целевым узлом в потоке
     */
    pushings = new Set;

    /**
     * Притягивания
     *
     * Реестр узлов которые обработали притягивание с целевым узлом в потоке
     */
    pullings = new Set;

    /**
     * Расчёт времени анимации
     */
    #timing = 'cubic-bezier(0, 1, 1, 1)';

    /**
     * Прочитать расчёт времени анимации
     */
    get timing() { return this.#timing }

    /**
     * Длительность анимации (в секундах)
     */
    #duration = '3';

    /**
     * Прочитать длительность анимации (в секундах)
     */
    get duration() { return this.#duration }

    /**
     * Анимация (HTMLElement <style>)
     */
    #animation;

    /**
     * Прочитать анимацию (HTMLElement <style>)
     */
    get animation() { return this.#animation }

    /**
     * Троттлинг анимации
     *
     * Время после которого будет удалена (готова для перезапуска) анимация при завершении движения узла (остановке)
     */
    #throttle = 300;

    /**
     * Прочитать троттлинг анимации
     */
    get throttle() { return this.#throttle }

    /**
     * Движение
     */
    #movement = {
      status: null,
      observer: null,
      from: { x: null, y: null },
      to: { x: null, y: null }
    }

    // Прочитать движение
    get movement() { return this.#movement }

    /**
     * Конструктор узла
     *
     * @param {object} operator Инстанция оператора (графика)
     * @param {object} data Данные для генерации
     */
    constructor(operator, data) {
      // Запись в свойство
      this.#operator = operator;

      // Инициализация ссылки на ядро
      const _this = this;

      // Инициализация HTML-элемента-оболочки узлов
      if ((this.#shell = document.getElementById(this.#operator.id + '_nodes')) instanceof HTMLElement);
      else {
        // Не найден HTML-элемент-оболочки узлов

        // Инициализация HTML-элемента-оболочки узлов
        const shell = document.createElement('section');
        shell.id = this.#operator.id + '_nodes';
        shell.classList.add(...this.#operator.classes.node.shell);

        // Запись в документ
        this.#operator.shell.appendChild(shell);

        // Запись в свойство
        this.#shell = shell;
      }

      // Инициализация HTML-элемента узла
      const article = document.createElement('article');
      article.id = this.#operator.id + '_node_' + this.#operator.nodes.size;
      article.classList.add(..._this.operator.classes.node.element);
      article.style.animationName = article.id + '_animation';
      article.style.animationFillMode = 'forwards';
      article.style.animationDuration = this.#duration + 's';
      article.style.animationTimingFunction = this.#timing;
      if (typeof data.color === 'string') article.classList.add(data.color);
      if (typeof data.href === 'string') article.href = data.href;


      // Запись анимации "выделение обводкой" (чтобы не проигрывалась при открытии страницы)
      article.onmouseenter = fn => article.classList.add(..._this.#operator.classes.node.onmouseenter);

      // Инициализация заголовка
      const title = document.createElement('h4');
      title.classList.add(..._this.#operator.classes.node.title);
      title.innerText = data.title ?? '';

      // Запись в оболочку
      article.appendChild(title);

      // Инициализация описания
      const description = document.createElement('div');
      description.classList.add(..._this.#operator.classes.node.description.both, ..._this.#operator.classes.node.description.hidden);
      if (typeof data.popup === 'string') description.title = data.popup;

      // Запись анимации "выделение обводкой" (чтобы не проигрывалась при открытии страницы)
      description.onmouseenter = fn => description.classList.add(..._this.#operator.classes.node.onmouseenter);

      // Инициализация блокировки открытия описания в случае, если был перемещён узел
      title.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        title.onclick = (onclick) => (_this.show(), title.onclick = title.onmousemove = title.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);

        title.onmousemove = (onmousemove) => {
          // Если курсор движется более чем на 15 пикселей по вертикали или горизонтали, то блокировать открытие описания
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) (title.style.cursor = 'grabbing', title.onclick = (onclick) => (title.onclick = title.onmousemove = title.style.cursor = null, x = onclick.pageX, y = onclick.pageY, false));
          else title.onclick = (onclick) => (_this.show(), title.onclick = title.onmousemove = title.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);
        }
      };

      // Запись в оболочку
      article.appendChild(description);

      // Инициализация левой фигуры для обёртки текста
      const left = document.createElement('span');
      left.classList.add(..._this.#operator.classes.node.wrappers.both, ..._this.#operator.classes.node.wrappers.left);

      // Запись в описание
      description.appendChild(left);

      // Инициализация правой фигуры для обёртки текста
      const right = document.createElement('span');
      right.classList.add(..._this.#operator.classes.node.wrappers.both, ..._this.#operator.classes.node.wrappers.right);

      // Запись в описание
      description.appendChild(right);

      // Инициализация ссылки на источник
      const a = document.createElement('a');
      if (typeof data.link === 'object' && typeof data.link.name === 'string') a.innerText = data.link.name;
      if (typeof data.link === 'object' && typeof data.link.href === 'string') a.href = data.link.href;
      if (typeof data.link === 'object' && typeof data.link.class === 'object') a.classList.add(...data.link.class);
      if (typeof data.link === 'object' && typeof data.link.title === 'string') a.title = data.link.title;

      // Блокировка событий браузера (чтобы не мешать переноса узла)
      a.ondragstart = a.onselectstart = fn => false;

      // Инициализация блокировки перехода по ссылке в случае, если был перемещён узел
      a.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        a.onclick = (onclick) => (a.onclick = a.onmousemove = a.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);

        a.onmousemove = (onmousemove) => {
          // Если курсор движется более чем на 15 пикселей по вертикали или горизонтали, то блокировать переход по ссылке
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) (a.style.cursor = 'grabbing', a.onclick = (onclick) => (a.onclick = a.onmousemove = a.style.cursor = null, x = onclick.pageX, y = onclick.pageY, false));
          else a.onclick = (onclick) => (a.onclick = a.onmousemove = a.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);
        }
      };

      // Запись в описание
      description.appendChild(a);

      // Запись текста в описание
      const text = document.createElement('p');
      if (typeof data.description === 'string') text.innerText = data.description;

      // Запись в оболочку
      description.appendChild(text);

      if (typeof data.cover === 'string') {
        // Получено изображение-обложка

        // Инициализация изображения-обложки
        const cover = document.createElement('img');
        if (typeof cover.src === 'string') cover.src = data.cover;
        if (typeof cover.alt === 'string') cover.alt = data.title;
        cover.classList.add(..._this.#operator.classes.node.cover);

        // Запись в описание
        description.appendChild(cover);
      }

      // Запись в оболочку
      if (typeof data.append === 'HTMLCollection' || typeof data.append === 'HTMLElement') article.appendChild(data.append);

      // Инициализация кнопки закрытия
      const close = document.createElement('i');
      close.classList.add(..._this.#operator.classes.node.close.both, ..._this.#operator.classes.node.close.hidden);

      // Запись блокировки закрытия описания в случае, если был перемещён узел
      close.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        close.onclick = (onclick) => (_this.hide(), close.onclick = close.onmousemove = close.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);

        close.onmousemove = (onmousemove) => {
          // Если курсор движется более чем на 15 пикселей по вертикали или горизонтали, то блокировать закрытие описания
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) (close.style.cursor = 'grabbing', close.onclick = (onclick) => (close.onclick = close.onmousemove = close.style.cursor = null, x = onclick.pageX, y = onclick.pageY, false));
          else close.onclick = (onclick) => (_this.hide(), close.onclick = close.onmousemove = close.style.cursor = null, x = onclick.pageX, y = onclick.pageY, true);
        }
      };

      // Запись в оболочку
      article.appendChild(close);

      // Запись в документ
      this.#shell.appendChild(article);

      // Запись диаметра описания в зависимости от размера заголовка (чтобы вмещался)
      description.style.width = description.style.height = (a.offsetWidth === 0 ? 50 : a.offsetWidth) * 3 + 'px';

      // Запись отступа заголовка (чтобы был по центру описания)
      a.style.left = description.offsetWidth / 2 - a.offsetWidth / 2 + 'px';

      // Запись в свойство
      this.#element = article;

      // Инициализация
      this.init();

      /**
       * Показать описание
       */
      this.show = fn => {
        // Отображение описания
        description.classList.add(..._this.#operator.classes.node.description.shown);
        description.classList.remove(..._this.#operator.classes.node.description.hidden);

        // Отображение кнопки закрытия
        close.classList.add(..._this.#operator.classes.node.close.shown);
        close.classList.remove(..._this.#operator.classes.node.close.hidden);

        // Сдвиг кнопки закрытия описания
        close.style.top = close.style.right = -(((description.offsetWidth - article.offsetWidth) / 4) + description.offsetWidth / 8) + 'px';

        // Размер кнопки закрытия описания
        close.style.scale = 1.3;

        // Прозрачность кнопки закрытия описания (плавное появление)
        close.style.opacity = 1;

        // Расположение выше остальных узлов
        article.style.zIndex = close.style.zIndex = 1000;

        // Инициализация сдвига отталкивания и притяжения соединённых узлов
        _this.#shift = description.offsetWidth - article.offsetWidth;

        // Сброс данных потока
        _this.reset();

        // Обработка сдвига
        _this.move();
      }

      /**
       * Скрыть описание
       */
      this.hide = fn => {
        // Скрытие описания
        description.classList.add(..._this.#operator.classes.node.description.hidden);
        description.classList.remove(..._this.#operator.classes.node.description.shown);

        // Скрытие кнопки закрытия
        close.classList.add(..._this.#operator.classes.node.close.hidden);
        close.classList.remove(..._this.#operator.classes.node.close.shown);

        // Удаление всех изменённых аттрибутов
        close.style.top = close.style.right = article.style.zIndex = close.style.zIndex = close.style.scale = close.style.opacity = null;

        // Деинициализация сдвига отталкивания и притяжения соединённых узлов
        _this.#shift = 0;

        // Сброс данных потока
        _this.reset();

        // Обработка сдвига
        _this.move();
      }

      // Запись в реестр
      this.#operator.nodes.add(this);

      // Инициализация координат центров
      const horizontal = this.#operator.shell.offsetWidth / 2 - this.#diameter / 2;
      const vertical = this.#operator.shell.offsetHeight / 2 - this.#diameter / 2;

      // Инициализация начальных координат
      this.element.style.left = this.#movement.from.x = horizontal + (0.5 - Math.random()) * 500 + 'px';
      this.element.style.top = this.#movement.from.y = vertical + (0.5 - Math.random()) * 500 + 'px';

      // Перемещение
      this.move(horizontal + (0.5 - Math.random()) * 500, vertical + (0.5 - Math.random()) * 500);
    }

    init(increase = 0) {
      // Запись в свойство
      this.#increase = increase;

      // Инициализация диаметра
      if (this.#increase !== 0) this.#diameter += this.#addition ** this.#increase;

      // Инициализация размера HTML-элемента
      this.element.style.width = this.element.style.height = this.#diameter + 'px';

      // Инициализация описания
      const description = this.element.getElementsByClassName('description')[0];

      // Запись отступа описания (чтобы был по центру узла)
      description.style.marginLeft = description.style.marginTop = (this.element.offsetWidth - description.offsetWidth) / 2 + 'px';
    }

    /**
     * Переместить узел
     *
     * @param {*} x Координата X (относительно левого верхнего края)
     * @param {*} y Координата Y (относительно левого верхнего края)
     *
     * @return {bool} Статус выполнения
     */
    move(x, y) {
      if (!this.actions.move.active) return false;

      // Инициализация конечных координат
      (this.#movement.to.x ??= this.#element.offsetLeft, this.#movement.to.y ??= this.#element.offsetTop);

      // Проверка входящих параметров
      if (typeof x !== 'number' || typeof y !== 'number') (x = this.#movement.to.x, y = this.#movement.to.y);

      // Округление координат
      (x = Math.round(x), y = Math.round(y));

      if (this.#movement.status !== 'completed') {
        // Не завершено движение

        // Запись начальных координат
        this.#movement.from = { x: this.#element.offsetLeft, y: this.#element.offsetTop };

        // Запись наблюдателя для проверки того, что движение было завершено
        if (this.#movement.observer === null) this.#movement.observer = setInterval(fn => {
          if (this.#element.offsetLeft === this.#movement.to.x && this.#element.offsetTop === this.#movement.to.y) {
            // Завершено движение

            // Запись координат
            (this.element.style.left = this.#movement.to.x + 'px', this.element.style.top = this.#movement.to.y + 'px');

            // Удаление координат движения
            this.#movement.from = this.#movement.to;

            // Запись статуса
            this.#movement.status = 'completed';

            // Удаление анимации (для того, чтобы запустить её с начала)
            if (this.#animation instanceof HTMLElement) setTimeout((this.#animation.remove(), this.#animation = undefined), this.#throttle);

            // Сброс счётчиков
            this.actions.pushing.current = this.actions.pulling.current = 0;

            // Десинхронизация узла с его соединениями
            for (const connection of this.#inputs) connection.desynchronize(this);
            for (const connection of this.#outputs) connection.desynchronize(this);

            // Сброс данных потока
            this.reset();

            // Удаление наблюдателя
            (clearInterval(this.#movement.observer), this.#movement.observer = null);
          }
        }, 10);
      }

      // Запись статуса
      this.#movement.status = 'moving';

      // Запись конечных координат движения
      this.#movement.to = { x, y };

      if (typeof this.#animation === 'undefined') {
        // Не найден HTML-элемент с анимацией

        // Инициализация HTML-элемента с анимацией
        const style = document.createElement('style');
        style.id = this.element.id + '_animation';
        style.classList.add(...this.operator.classes.node.animation);

        // Запись в документ
        this.#element.appendChild(style);

        // Запись в свойство
        this.#animation = style;
      }

      // Запись анимации
      this.#animation.innerHTML = `@keyframes ${this.#animation.id} {0% { left: ${this.#movement.from.x}px; top: ${this.#movement.from.y}px; } 100% { left: ${this.#movement.to.x}px; top: ${this.#movement.to.y}px; }}`;

      // Инициализация буфера реестра узлов
      const registry = new Set(this.#operator.nodes);

      if (this.pushings && !this.pushings.has(this)) {
        // Активно отталкивание

        // Обработка отталкивания
        for (const connection of this.outputs) (registry.delete(connection.to), this.pushing(new Set([connection.to])));
        for (const connection of this.inputs) (registry.delete(connection.from), this.pushing(new Set([connection.from])));
      }

      if (this.pullings && !this.pullings.has(this)) {
        // Активно притягивание

        // Обработка притягивания
        for (const connection of this.outputs) (registry.delete(connection.to), this.pulling(new Set([connection.to])));
        for (const connection of this.inputs) (registry.delete(connection.from), this.pulling(new Set([connection.from])));
      }

      // Обработка отталкивания остальных узлов
      if (this.pushings) this.pushing(registry);

      // Синхронизация узла с его соединениями
      for (const connection of this.outputs) connection.synchronize(this);
      for (const connection of this.inputs) connection.synchronize(this);
    }

    /**
     * Обработать отталкивания
     *
     * @param {*} nodes
     * @param {*} add
     * @param {*} distance
     *
     * @returns
     */
    pushing(nodes = [], add, distance = 100) {
      // Проверка на активность отталкивания целевого узла
      if (!this.#operator.actions.pushing || !this.actions.pushing.active) return false;

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      for (const node of registry) {
        // Перебор обрабатываемых узлов

        if (this.actions.move.unlimit) {
          // Перемещается мышью узел

          // Запись о том, что узел перемещается мышью (каскадно)
          node.actions.move.unlimit = true;
        } else {
          // Не перемещается мышью узел

          // Проверка на превышение ограничения по числу итераций для отталкивания у целевого узла
          if (++this.actions.pushing.current > this.actions.pushing.max) return false;

          // Проверка на превышение ограничения по числу итераций для отталкивания у целевого узла
          if (++node.actions.pushing.current > node.actions.pushing.max) continue;
        }

        // Проверка на активность отталкивания у целевого узла
        if (!this.#operator.actions.pushing || !this.actions.pushing.active) return false;

        // Проверка на активность отталкивания у обрабатываемого узла
        if (!node.#operator.actions.pushing || !node.actions.pushing.active) continue;

        // Защита от повторной обработки обрабатываемого узла
        if (typeof this.pushings === 'object' && this.pushings.has(node)) continue;
        else this.pushings.add(node);

        // Инициализация вектора между узлами
        const between = new Victor(node.element.offsetLeft - this.element.offsetLeft, node.element.offsetTop - this.element.offsetTop);

        // Вычисление разницы между необходимым расстоянием и текущим
        const difference = (this.diameter + node.diameter) / 2 + distance + this.shift + node.shift + (typeof add === 'number' ? add : 0) - between.length();

        // Узлы преодолели расстояние отталкивания?
        if (difference <= 0) continue;

        // Реинициализация реестра обработанных узлов и запись целевого узла
        node.pushings = new Set([this]);

        // Инициализация вектора целевой позиции для перемещения
        const target = new Victor(difference, difference);

        // Инициализация вектора новой позиции обрабатываемого узла
        const vector = new Victor(node.element.offsetLeft, node.element.offsetTop).add(target.rotate(between.angle() - target.angle()));

        // Перемещение
        node.move(vector.x, vector.y);
      }
    }

    /**
     * Обработать притягивания
     *
     * @param {*} nodes
     * @param {*} add
     * @param {*} distance
     *
     * @returns
     */
    pulling(nodes = [], add, distance = 150) {
      // Проверка на активность притягивания целевого узла
      if (!this.#operator.actions.pulling || !this.actions.pulling.active) return false;

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      for (const node of registry) {
        // Перебор обрабатываемых узлов

        if (this.actions.move.unlimit) {
          // Перемещается мышью узел

          // Запись о том, что узел перемещается мышью (каскадно)
          node.actions.move.unlimit = true;
        } else {
          // Не перемещается мышью узел

          // Проверка на превышение ограничения по числу итераций для притягивания у целевого узла
          if (++this.actions.pulling.current > this.actions.pulling.max) return false;

          // Проверка на превышение ограничения по числу итераций для притягивания у целевого узла
          if (++node.actions.pulling.current > node.actions.pulling.max) continue;
        }

        // Проверка на активность отталкивания у целевого узла
        if (!this.#operator.actions.pulling || !this.actions.pulling.active) return false;

        // Проверка на активность отталкивания у обрабатываемого узла
        if (!node.#operator.actions.pulling || !node.actions.pulling.active) continue;

        // Защита от повторной обработки целевого узла
        if (typeof this.pullings === 'object' && this.pullings.has(node)) continue;
        else this.pullings.add(node);

        // Инициализация вектора между узлами
        const between = new Victor(node.element.offsetLeft - this.element.offsetLeft, node.element.offsetTop - this.element.offsetTop);

        // Вычисление разницы между необходимым расстоянием и текущим
        const difference = (node.diameter + this.diameter) / 2 + distance + this.shift + node.shift + (typeof add === 'number' ? add : 0) - between.length();

        // Узлы преодолели расстояние отталкивания?
        if (difference > 0) continue;

        // Реинициализация реестра обработанных узлов и запись целевого узла
        node.pullings = new Set([this]);

        // Инициализация вектора целевой позиции для перемещения
        const target = new Victor(difference, difference);

        // Инициализация координат обрабатываемого узла
        const vector = new Victor(node.element.offsetLeft, node.element.offsetTop).add(target.rotate(between.angle() - target.angle()).invert());

        // Перемещение узла
        node.move(vector.x, vector.y);
      }
    }

    /**
     * Сброс данных потока
     */
    reset = fn => {
      // Реинициализация реестров обработанных узлов
      this.pushings = this.#operator.actions.pushing ? new Set() : null;
      this.pullings = this.#operator.actions.pulling ? new Set() : null;

      // Реинициализация счётчиков итераций
      this.actions.pushing.current = this.actions.pulling.current = 0;
    }
  };

  // Прочитать класс узла
  get node() { return this.#node }

  // Класс соединения
  #connection = class connection {
    // HTML-элемент-оболочка
    #shell;

    // Прочитать HTML-элемент-оболочку
    get shell() { return this.#shell }

    // HTML-элемент соединения
    #element;

    // Прочитать HTML-элемент соединения
    get element() { return this.#element }

    // Инстанция this.operator.node от которой начинается соединение
    #from;

    // Прочитать инстанцию this.operator.node от которой начинается соединение
    get from() { return this.#from }

    // Инстанция this.operator.node на которой заканчивается соединение
    #to;

    // Прочитать инстанцию this.operator.node на которой заканчивается соединение
    get to() { return this.#to }

    // Оператор
    #operator;

    // Прочитать оператора
    get operator() { return this.#operator }

    // Сессии синхронизации позиции узлов с соединениями
    #sessions = new Map;

    // Прочитать сессии синхронизации позиции узлов с соединениями
    get sessions() { return this.#sessions }

    // Координата X (основной узел)
    #x1

    // Прочитать координату X (основной узел)
    get x1() { return this.#x1 }

    // Координата Y (основной узел)
    #y1

    // Прочитать координату Y (основной узел)
    get y1() { return this.#y1 }

    // Координата X (связанный узел)
    #x2

    // Прочитать координату X (связанный узел)
    get x2() { return this.#x2 }

    // Координата X (связанный узел)
    #y2

    // Прочитать координату X (связанный узел)
    get y2() { return this.#y2 }

    /**
     * Конструктор соединения
     *
     * @param {object} operator Инстанция оператора (графика)
     * @param {object} from Инстанция узла от которого идёт соединение
     * @param {object} to Инстанция узла к которому идёт соединения
     */
    constructor(operator, from, to) {
      // Запись свойства
      this.#operator = operator;

      // Запись свойства
      this.#from = from;

      // Запись свойства
      this.#to = to;

      // Инициализация HTML-элемента-оболочки соединений
      if ((this.#shell = document.getElementById(this.#operator.id + '_connections')) instanceof SVGElement);
      else {
        // Не найден HTML-элемент-оболочки соединений

        // Инициализация HTML-элемента-оболочки соединений
        const shell = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        shell.id = this.#operator.id + '_connections';
        shell.classList.add(...this.#operator.classes.connection.shell);

        // Запись в документ
        this.#operator.shell.appendChild(shell);

        // Запись в свойство
        this.#shell = shell;
      }

      // Инициализация координат
      (this.#x1 = from.element.offsetLeft + from.element.offsetWidth / 2, this.#y1 = from.element.offsetTop + from.element.offsetHeight / 2, this.#x2 = to.element.offsetLeft + to.element.offsetWidth / 2, this.#y2 = to.element.offsetTop + to.element.offsetHeight / 2);

      // Инициализация оболочки
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      line.setAttribute('d', `M${this.x1} ${this.y1} L${this.x2} ${this.y2}`);
      line.setAttribute('stroke', 'grey');
      line.setAttribute('stroke-width', '8px');
      line.id = this.#operator.id + '_connection_' + this.#operator.connections.size;
      line.classList.add(...this.operator.classes.connection.element);
      line.setAttribute('data-from', from.element.id);
      line.setAttribute('data-to', to.element.id);

      // Запись в оболочку
      this.shell.append(line);

      // Запись в свойство
      this.#element = line;

      // Запись в реестр
      this.#operator.connections.add(this);
    }

    /**
     * Синхронизировать c узлом
     *
     * @param {node} node Инстанция узла (связанного с соединением)
     *
     * @todo
     * 1. Удаление интервала через определённое время
     */
    synchronize(node) {
      // Десинхронизация
      this.desynchronize(node);

      // Синхронизация
      if (node === this.from) this.#sessions.set(node.element.id, setInterval(fn => this.element.setAttribute('d', `M${this.#x1 = node.element.offsetLeft + node.element.offsetWidth / 2} ${this.#y1 = node.element.offsetTop + node.element.offsetHeight / 2} L${this.#x2} ${this.#y2}`)), 0);
      else if (node === this.to) this.#sessions.set(node.element.id, setInterval(fn => this.element.setAttribute('d', `M${this.#x1} ${this.#y1} L${this.#x2 = node.element.offsetLeft + node.element.offsetWidth / 2} ${this.#y2 = node.element.offsetTop + node.element.offsetHeight / 2}`)), 0);
    }

    /**
     * Десинхронизировать c узлом
     *
     * @param {node} node Инстанция узла (связанного с соединением)
     */
    desynchronize(node) {
      // Удаление интервала
      clearInterval(this.#sessions.get(node.element.id));
    }
  };

  // Прочитать класс соединения
  get connection() { return this.#connection }

  /**
   * Конструктор графика
   *
   * @param {HTMLElement|string} shell HTML-элемент-оболочка для графика, либо его идентификатор
   * @param {boolean} body Перенос работает на теле документа? (иначе на HTML-элементе-оболочке)
   * @param {boolean} move Активировать перемещение оболочки?
   */
  constructor(shell, body = true, move = true) {
    // Запись оболочки
    if (shell instanceof HTMLElement) this.#shell = shell;
    else if (typeof shell === 'string') this.#shell = document.getElementById(shell);

    // Проверка на инициализированность HTML-элемента-оболочки
    if (typeof this.#shell === undefined) return false;

    // Запись идентификатора
    this.#id = this.#shell.id;

    // Инициализация ссылки на обрабатываемый объект
    const _this = this;

    // Инициализация цели для переноса
    const target = body ? document.body : shell;

    if (move === true) {
      // Инициализировать функцию переноса оболочки?

      target.onmousedown = (onmousedown) => {
        // Начало переноса

        if (_this.actions.move.shell) {
          // Разрешено двигать оболочку

          // Запись иконки курсора
          target.style.cursor = 'move';

          // Инициализация координат
          const coords = _this.shell.getBoundingClientRect();
          const x = onmousedown.pageX - coords.left + scrollX;
          const y = onmousedown.pageY - coords.top + scrollY;

          // Инициализация HTML-элемента-оболочки соединений
          const connections = document.getElementById(_this.#id + '_connections');

          // Инициализация функции переноса полотна
          function move(onmousemove) {
            // Инициализация буфера
            let buffer;

            // Запись нового отступа от лева для HTML-элемента оболочки графика
            _this.shell.style.left = (buffer = onmousemove.pageX - x) + 'px';

            // Запись нового отступа от лева для HTML-элемента оболочки соединений
            connections.style.left = -buffer + 'px';

            // Запись аттрибута с координатами для HTML-элемента оболочки соединений
            connections.setAttribute('data-x', -buffer);

            // Запись нового отступа от верха для HTML-элемента оболочки графика
            _this.shell.style.top = (buffer = onmousemove.pageY - y) + 'px';

            // Запись нового отступа от верха для HTML-элемента оболочки соединений
            connections.style.top = -buffer + 'px';

            // Запись аттрибута с координатами для HTML-элемента оболочки соединений
            connections.setAttribute('data-y', -buffer);

            // Синхронизация
            for (const connection of _this.connections) (connection.synchronize(connection.from), connection.synchronize(connection.to));
          }

          // Запись слушателя события: "перенос полотна"
          target.onmousemove = move;
        }

        // Конец переноса (деинициализация)
        target.onmouseup = () => target.onmousemove = target.onmouseup = target.style.cursor = null;
      };

      // Блокировка событий браузера (чтобы не дёргалось)
      target.ondragstart = null;
    }
  }

  write = (data = {}) => {
    if (typeof data === 'object') {
      // Получен обязательный входной параметр в правильном типе

      // Инициализация узла
      const node = new this.node(this, data);

      // Инициализация ссылки на обрабатываемый объект
      const _this = this;

      // Запрет движения оболочки при наведении на узел (чтобы двигать узел)
      node.element.onmouseover = fn => _this.actions.move.shell = false;

      // Снятие запрета движения оболочки
      node.element.onmouseout = fn => _this.actions.move.shell = true;

      if (_this.actions.move.node) {
        // Разрешено перемещать узлы

        // Инициализация переноса узла
        node.element.onmousedown = (onmousedown) => {
          // Начало переноса узла

          // Инициализация буфера позиционирования
          const z = node.element.style.zIndex;

          // Позиционирование над остальными узлами
          node.element.style.zIndex = 5000;

          if (!_this.actions.move.shell) {
            // Запрещено двигать оболочку (чтобы не двигать узел и оболочку одновременно)

            // Инициализация координат
            const n = node.element.getBoundingClientRect();
            const s = _this.shell.getBoundingClientRect();

            // Запись слушателя события: "перенос узла"
            document.onmousemove = (onmousemove) => {
              // Сброс данных потока
              node.reset();

              // Запись статуса о том, что узел в данный момент перемещается
              node.actions.move.unlimit = true;

              // Перемещение узла
              node.move(onmousemove.pageX - (onmousedown.pageX - n.left + s.left + scrollX), onmousemove.pageY - (onmousedown.pageY - n.top + s.top + scrollY));
            };
          }

          // Конец переноса узла
          node.element.onmouseup = fn => {
            // Очистка обработчиков событий
            document.onmousemove = node.element.onmouseup = null;

            // Запись статуса о том, что узел в данный момент НЕ перемещается
            for (const node of _this.nodes) node.actions.move.unlimit = false;

            // Возвращение позиционирования
            node.element.style.zIndex = z;
          };
        };

        // Перещапись событий браузера (чтобы не дёргалось)
        node.element.ondragstart = null;
      }

      // Запись в реестр
      this.nodes.add(node);

      // Обработка взаимодействий с другими узлами
      node.move();

      return node;
    }
  };

  connect = (from, to) => {
    if (from instanceof this.node && to instanceof this.node) {
      // Получены обязательные входные параметры в правильном типе

      // Инициализация соединения
      const connection = new this.connection(this, from, to);

      // Запись соединений в реестры узлов
      from.outputs.add(connection);
      to.inputs.add(connection);

      // Запись в реестр ядра
      this.connections.add(connection);

      // Реинициализация узла-получателя
      to.init(1);

      // Синхронизация соединения с узлами
      connection.synchronize(from);
      connection.synchronize(to);

      return connection;
    }
  };
}

// Вызов события: "Библиотека загружена и готова к работе"
document.dispatchEvent(new CustomEvent('graph.loaded', { detail: { graph } }));
