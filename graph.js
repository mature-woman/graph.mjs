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
      }
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
    collision: false,
    pushing: true,
    pulling: true
  }

  // Класс узла
  #node = class node {
    // Реестр входящих соединений
    #inputs = new Set();

    // Прочитать реестр входящих соединений
    get inputs() {
      return this.#inputs;
    }

    // Реестр исходящих соединений
    #outputs = new Set();

    // Прочитать реестр исходящих соединений
    get outputs() {
      return this.#outputs;
    }

    // Оператор
    #operator;

    // Прочитать оператора
    get operator() {
      return this.#operator;
    }

    // HTML-элемент-оболочка
    #shell;

    // Прочитать HTML-элемент-оболочка
    get shell() {
      return this.#shell;
    }

    // HTML-элемент
    #element;

    // Прочитать HTML-элемент
    get element() {
      return this.#element;
    }

    // Наблюдатель
    #observer = null;

    // Прочитать наблюдатель
    get observer() {
      return this.#observer;
    }

    // Реестр запрещённых к изменению параметров
    #block = new Set(['events']);

    // Прочитать реестр запрещённых к изменению параметров
    get block() {
      return this.#block;
    }

    // Диаметр узла
    #diameter = 100;

    // Прочитать диаметр узла
    get diameter() {
      return this.#diameter;
    }

    // Степень увеличения диаметра
    #increase = 0;

    // Прочитать степень увеличения диаметра
    get increase() {
      return this.#increase;
    }

    // Величина степени увеличения диаметра
    #addition = 12;

    // Прочитать величину степени увеличения диаметра
    get addition() {
      return this.#addition;
    }

    // Величина степени увеличения притягивания и отталкивания
    #shift = 0;

    // Прочитать величину степени увеличения притягивания и отталкивания
    get shift() {
      return this.#shift;
    }

    // Глобальный счётчик итераций
    iteration = 0;

    // Ограничение максимального количества всех итераций
    limit = 3000;

    /**
     * Обработка событий
     *
     * max - максимум итераций в процессе
     * current - текущая итерация в процессе
     * flow - максимум итераций в потоке
     */
    actions = {
      collision: {
        active: false,
        max: 100,
        current: 0,
        flow: {
          medium: 30,
          hard: 300
        }
      },
      pushing: {
        active: true,
        max: 100,
        current: 0,
        flow: {
          medium: 30,
          hard: 300
        }
      },
      pulling: {
        active: false,
        max: 100,
        current: 0,
        flow: {
          medium: 30,
          hard: 300
        }
      }
    };

    /**
     * Столкновения
     *
     * Реестр узлов которые обработали столкновения с целевым узлом в потоке
     */
    collisions = new Set;

    /**
     * Отталкивания
     *
     * Реестр узлов которые обработали столкновения с целевым узлом в потоке
     */
    pushings = new Set;

    /**
     * Притягивания
     *
     * Реестр узлов которые обработали притягивание с целевым узлом в потоке
     */
    pullings = new Set;

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
      if (typeof data.color === 'string') article.classList.add(data.color);
      article.classList.add(..._this.operator.classes.node.element);
      if (typeof data.href === 'string') {
        article.href = data.href;
      }

      // Запись анимации "выделение обводкой" (чтобы не проигрывалась при открытии страницы)
      article.onmouseenter = fn => {
        // Запись класса с анимацией
        article.classList.add(..._this.#operator.classes.node.onmouseenter);
      };

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
      description.onmouseenter = fn => {
        // Запись класса с анимацией
        description.classList.add(..._this.#operator.classes.node.onmouseenter);
      };

      // Запись блокировки открытия описания в случае, если был перемещён узел
      title.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        // Запись события открытия описания
        title.onclick = (onclick) => {
          // Отображение описания
          _this.show();

          // Удаление событий
          title.onclick = title.onmousemove = null;

          // Реинициализация координат
          x = onclick.pageX;
          y = onclick.pageY;

          // Удаление иконки курсора
          title.style.cursor = null;

          return true;
        }

        title.onmousemove = (onmousemove) => {
          // Курсор сдвинут более чем на 15 пикселей?
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) {
            // Запись иконки курсора
            title.style.cursor = 'grabbing';

            // Запись события для переноса узла
            title.onclick = (onclick) => {
              // Удаление событий
              title.onclick = title.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              title.style.cursor = null;

              return false;
            }
          } else {
            // Запись события открытия описания
            title.onclick = (onclick) => {
              // Отображение описания
              _this.show();

              // Удаление событий
              title.onclick = title.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              title.style.cursor = null;

              return true;
            };
          }
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
      a.ondragstart = a.onselectstart = fn => { return false };

      // Запись блокировки перехода по ссылке в случае, если был перемещён узел
      a.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        // Запись события открытия описания
        a.onclick = (onclick) => {
          // Удаление событий
          a.onclick = a.onmousemove = null;

          // Реинициализация координат
          x = onclick.pageX;
          y = onclick.pageY;

          // Удаление иконки курсора
          a.style.cursor = null;

          return true;
        }

        a.onmousemove = (onmousemove) => {
          // Курсор сдвинут более чем на 15 пикселей?
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) {
            // Запись иконки курсора
            a.style.cursor = 'grabbing';

            // Запись события для переноса узла
            a.onclick = (onclick) => {
              // Удаление событий
              a.onclick = a.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              a.style.cursor = null;

              return false;
            }
          } else {
            // Запись события открытия описания
            a.onclick = (onclick) => {
              // Удаление событий
              a.onclick = a.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              a.style.cursor = null;

              return true;
            };
          }
        }
      };

      // Запись в описание
      description.appendChild(a);

      // Запись текста в описание
      const text = document.createElement('p');
      if (typeof data.description === 'string') text.innerText = data.description;

      // Запись в оболочку
      description.appendChild(text);

      if (
        typeof data.cover === 'string'
      ) {
        // Получено изображение-обложка

        // Инициализация изображения-обложки
        const cover = document.createElement('img');
        if (typeof cover.src === 'string') cover.src = data.cover;
        if (typeof cover.alt === 'string') cover.alt = data.title;
        cover.classList.add(..._this.#operator.classes.node.cover);

        // Запись в описание
        description.appendChild(cover);
      }

      if (
        typeof data.append === 'HTMLCollection' ||
        typeof data.append === 'HTMLElement'
      ) {
        // Получены другие HTML-элементы

        // Запись в оболочку
        article.appendChild(data.append);
      }

      // Инициализация кнопки закрытия
      const close = document.createElement('i');
      close.classList.add(..._this.#operator.classes.node.close.both, ..._this.#operator.classes.node.close.hidden);

      // Запись блокировки закрытия в случае, если был перемещён узел
      close.onmousedown = (onmousedown) => {
        // Инициализация координат
        let x = onmousedown.pageX;
        let y = onmousedown.pageY;

        // Запись события открытия описания
        close.onclick = (onclick) => {
          // Скрытие описания
          _this.hide();

          // Удаление событий
          close.onclick = close.onmousemove = null;

          // Реинициализация координат
          x = onclick.pageX;
          y = onclick.pageY;

          // Удаление иконки курсора
          close.style.cursor = null;

          return true;
        }

        close.onmousemove = (onmousemove) => {
          // Курсор сдвинут более чем на 15 пикселей?
          if (Math.abs(x - onmousemove.pageX) > 15 || Math.abs(y - onmousemove.pageY) > 15) {
            // Запись иконки курсора
            close.style.cursor = 'grabbing';

            // Запись события для переноса узла
            close.onclick = (onclick) => {
              // Удаление событий
              close.onclick = close.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              close.style.cursor = null;

              return false;
            }
          } else {
            // Запись события открытия описания
            close.onclick = (onclick) => {
              // Скрытие описания
              _this.hide();

              // Удаление событий
              close.onclick = close.onmousemove = null;

              // Реинициализация координат
              x = onclick.pageX;
              y = onclick.pageY;

              // Удаление иконки курсора
              close.style.cursor = null;

              return true;
            };
          }
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
        _this.move(null, null, true);
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
        _this.move(null, null, true);
      }

      // Запись в реестр
      this.#operator.nodes.add(this);

      // Сброс данных потока
      this.reset();

      // Перемещение
      this.move(
        this.#operator.shell.offsetWidth / 2 -
        this.#diameter / 2 +
        (0.5 - Math.random()) * 500,
        this.#operator.shell.offsetHeight / 2 -
        this.#diameter / 2 +
        (0.5 - Math.random()) * 500
      );
    }

    init(increase = 0) {
      // Запись в свойство
      this.#increase = increase;

      // Инициализация диаметра
      if (this.#increase !== 0)
        this.#diameter += this.#addition ** this.#increase;

      // Инициализация размера HTML-элемента
      this.element.style.width = this.element.style.height =
        this.#diameter + 'px';

      // Инициализация описания
      const description = this.element.getElementsByClassName('description')[0];

      // Запись отступа описания (чтобы был по центру узла)
      description.style.marginLeft = description.style.marginTop = (this.element.offsetWidth - description.offsetWidth) / 2 + 'px';

      // Инициализация ссылки на ядро
      const _this = this;

      // Инициализация наблюдателя
      this.#observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            // Перехвачено изменение аттрибута

            // Запись параметра в инстанцию бегущей строки
            _this.configure(mutation.attributeName);
          }
        }
      });

      // Активация наблюдения
      this.observer.observe(this.element, {
        attributes: true,
        attributeOldValue: true
      });
    }

    /**
     * Переместить узел
     *
     * @param {*} x Координата X (относительно левого верхнего края)
     * @param {*} y Координата Y (относительно левого верхнего края)
     * @param {*} hard Увеличить количество итераций для процесса?
     */
    move(x, y, hard = false) {
      // Проверка входящих параметров
      if (typeof x !== 'number') x = this.element.getAttribute('data-x') ?? 0;
      else {
        // Запись отступа
        this.element.style.left = x + 'px';

        // Запись аттрибута с координатой
        this.element.setAttribute('data-x', x);
      }

      if (typeof y !== 'number') y = this.element.getAttribute('data-y') ?? 0;
      else {
        // Запись отступа
        this.element.style.top = y + 'px';

        // Запись аттрибута с координатой
        this.element.setAttribute('data-y', y);
      }

      // Обработка столкновений
      if (this.collisions && !this.collisions.has(this)) this.collision(this.#operator.nodes, hard);

      // Инициализация буфера реестра узлов
      const registry = new Set(this.#operator.nodes);

      if (this.pushings && !this.pushings.has(this)) {
        // Активно отталкивание

        for (const connection of this.outputs) {
          // Перебор исходящих соединений

          // Ограничение выполнения
          if (++this.actions.pushing.current >= this.actions.pushing.max) break;

          // Удаление из буфера реестра узлов
          registry.delete(connection.to);

          // Обработка отталкивания
          this.pushing(new Set([connection.to]), 0, hard);
        }

        for (const connection of this.inputs) {
          // Перебор входящих соединений

          // Ограничение выполнения
          if (++this.actions.pushing.current >= this.actions.pushing.max) break;

          // Удаление из буфера реестра узлов
          registry.delete(connection.from);

          // Обработка отталкивания
          this.pushing(new Set([connection.from]), 0, hard);
        }
      }

      if (this.pullings && !this.pullings.has(this)) {
        // Активно притягивание

        for (const connection of this.outputs) {
          // Перебор исходящих соединений

          // Ограничение выполнения
          if (++this.actions.pulling.current >= this.actions.pulling.max) break;

          // Удаление из буфера реестра узлов
          registry.delete(connection.to);

          // Обработка притягивания
          this.pulling(new Set([connection.to]), 0, hard);
        }

        for (const connection of this.inputs) {
          // Перебор входящих соединений

          // Ограничение выполнения
          if (++this.actions.pulling.current >= this.actions.pulling.max) break;

          // Удаление из буфера реестра узлов
          registry.delete(connection.from);

          // Обработка притягивания
          this.pulling(new Set([connection.from]), 0, hard);
        }
      }

      // Обработка отталкивания остальных узлов
      if (this.pushings) this.pushing(registry, 0, hard);

      // Синхронизация местоположения исходящих соединений
      for (const connection of this.outputs) connection.synchronize(this);

      // Синхронизация местоположения входящих соединений
      for (const connection of this.inputs) connection.synchronize(this);
    }

    /**
     * Обработать столкновения
     *
     * @param {*} nodes
     * @param {*} hard
     *
     * @returns
     */
    collision(nodes, hard = false) {
      // Проверка на активность столкновения
      if (!this.#operator.actions.collision || !this.actions.collision.active) return false;

      // Проверка на превышение ограничения по числу итераций у целевого узла
      if (++this.iteration >= this.limit) return (this.iteration = 0, false);

      // Инициализация счётчика итераций
      let iterations = 0;

      // Инициализация универсального буфера
      let buffer;

      // Инициализация оператора
      const operator = this;

      /**
       * Столкнуть
       *
       * @param {*} node
       *
       * @returns {boolean} Узлы преодолели расстояние отталкивания?
       */
      function move(node) {
        // Проверка на активность столкновения обрабатываемого узла
        if (!node.#operator.actions.collision || !node.actions.collision.active) return false;

        // Защита от повторной обработки обрабатываемого узла
        if (typeof operator.collisions === 'object' && operator.collisions.has(node)) return false;

        // Проверка на превышение ограничения по числу итераций у целевого узла
        if (++operator.iteration >= operator.limit) return (operator.iteration = 0, false);

        // Инициализация координат целевого узла
        const x1 = (isNaN((buffer = parseInt(node.element.style.left))) ? 0 : buffer) + node.element.offsetWidth / 2;
        const y1 = (isNaN((buffer = parseInt(node.element.style.top))) ? 0 : buffer) + node.element.offsetHeight / 2;

        // Инициализация координат обрабатываемого узла
        const x2 = (isNaN((buffer = parseInt(operator.element.style.left))) ? 0 : buffer) + operator.element.offsetWidth / 2;
        const y2 = (isNaN((buffer = parseInt(operator.element.style.top))) ? 0 : buffer) + operator.element.offsetHeight / 2;

        // Инициализация вектора между узлами
        const between = new Victor(x1 - x2, y1 - y2);

        // Узлы преодолели расстояние столкновения? (ограничение выполнения)
        if (
          between.length() > node.diameter / 2 + operator.diameter / 2 ||
          ++iterations > (hard ? operator.actions.collision.flow.hard : operator.actions.collision.flow.medium)
        ) return false;

        // Реинициализация реестра обработанных узлов и запись целевого узла
        node.collisions = node.#operator.actions.collision ? new Set([operator]) : null;

        // Реинициализация счётчиков итераций
        node.actions.collision.current = 0;

        // Инициализация координат вектора (узла с которым произошло столкновение)
        let vector = new Victor(x1, y1)
          .add(new Victor(between.x, between.y).norm().unfloat())
          .subtract(new Victor(node.element.offsetWidth / 2, node.element.offsetHeight / 2));

        // Перемещение узла
        node.move(vector.x, vector.y);

        // Вход в рекурсию
        move(node);
      }

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      // Обработка столкновения с узлами
      for (const node of registry) if (++this.actions.collision.current < this.actions.collision.max) move(node);
    }

    /**
     * Обработать отталкивания
     *
     * @param {*} nodes
     * @param {*} add
     * @param {*} hard
     * @param {*} distance
     *
     * @returns
     */
    pushing(nodes = [], add, hard = false, distance = 100) {
      // Проверка на активность отталкивания целевого узла
      if (!this.#operator.actions.pushing || !this.actions.pushing.active) return false;

      // Инициализация счётчика итераций
      let iterations = 0;

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      for (const node of registry) {
        // Перебор обрабатываемых узлов

        // Проверка на превышение ограничения по числу итераций у целевого узла
        if (++this.iteration >= this.limit) return (this.iteration = 0, false);

        // Проверка на превышение ограничения по числу итераций для отталкивания у обрабатываемого узла
        if (++node.actions.pushing.current > node.actions.pushing.max) continue;

        // Проверка на активность отталкивания обрабатываемого узла
        if (!node.#operator.actions.pushing || !node.actions.pushing.active) continue;

        // Защита от повторной обработки обрабатываемого узла
        if (typeof this.pushings === 'object' && this.pushings.has(node)) continue;

        // Инициализация координат целевого узла
        const x1 = node.element.offsetLeft + node.element.offsetWidth / 2;
        const y1 = node.element.offsetTop + node.element.offsetHeight / 2;

        // Инициализация координат обрабатываемого узла
        const x2 = this.element.offsetLeft + this.element.offsetWidth / 2;
        const y2 = this.element.offsetTop + this.element.offsetHeight / 2;

        // Инициализация вектора между узлами
        const between = new Victor(x1 - x2, y1 - y2);

        // Вычисление разницы между необходимым расстоянием и текущим
        const difference = (node.diameter + this.diameter) / 2 + distance + this.shift + node.shift + (this.diameter + node.diameter) / 2 ** (this.increase + node.increase) + (typeof add === 'number' ? add : 0) - between.length();

        // Узлы преодолели расстояние отталкивания?
        if (difference <= 0 || ++iterations > (hard ? this.actions.pushing.flow.hard : this.actions.pushing.flow.medium)) continue;

        // Реинициализация реестра обработанных узлов и запись целевого узла
        node.pushings = node.#operator.actions.pushing ? new Set([this]) : null;

        // Реинициализация счётчиков итераций
        node.actions.pushing.current = 0;

        // Инициализация расстояния сдвига
        const offset = new Victor(difference, difference);

        // Инициализация координат обрабатываемого узла
        const vector = new Victor(x1, y1)
          .add(offset.rotate(between.angle() - offset.angle()))
          .subtract(new Victor(node.element.offsetWidth / 2, node.element.offsetHeight / 2));

        // Перемещение
        node.move(vector.x, vector.y);
      }
    }

    /**
     * Обработать притягивания
     *
     * @param {*} nodes
     * @param {*} add
     * @param {*} hard
     * @param {*} distance
     *
     * @returns
     */
    pulling(nodes = [], add, hard = false, distance = 150) {
      // Проверка на активность притягивания целевого узла
      if (!this.#operator.actions.pulling || !this.actions.pulling.active) return false;

      // Инициализация счётчика итераций
      let iterations = 0;

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      for (const node of registry) {
        // Перебор обрабатываемых узлов

        // Проверка на превышение ограничения по числу итераций у целевого узла
        if (++this.iteration >= this.limit) return (this.iteration = 0, false);

        // Проверка на превышение ограничения по числу итераций для отталкивания у обрабатываемого узла
        if (++node.actions.pulling.current > node.actions.pulling.max) continue;

        // Проверка на активность притягивания у обрабатываемого узла
        if (!node.#operator.actions.pulling || !node.actions.pulling.active) continue;

        // Защита от повторной обработки обрабатываемого узла
        if (typeof this.pullings === 'object' && this.pullings.has(node)) continue;

        // Инициализация координат целевого узла
        const x1 = node.element.offsetLeft + node.element.offsetWidth / 2;
        const y1 = node.element.offsetTop + node.element.offsetHeight / 2;

        // Инициализация координат обрабатываемого узла
        const x2 = this.element.offsetLeft + this.element.offsetWidth / 2;
        const y2 = this.element.offsetTop + this.element.offsetHeight / 2;

        // Инициализация вектора между узлами
        const between = new Victor(x1 - x2, y1 - y2);

        // Вычисление разницы между необходимым расстоянием и текущим
        const difference = (node.diameter + this.diameter) / 2 + distance + this.shift + node.shift + (this.diameter + node.diameter) / 2 ** (this.increase + node.increase) + (typeof add === 'number' ? add : 0) - between.length();

        console.log(difference);

        // Узлы преодолели расстояние отталкивания?
        if (difference > 0 || ++iterations > (hard ? this.actions.pulling.flow.hard : this.actions.pulling.flow.medium)) continue;

        // Реинициализация реестра обработанных узлов и запись целевого узла
        node.pullings = node.#operator.actions.pulling ? new Set([this]) : null;

        // Реинициализация счётчиков итераций
        node.actions.pulling.current = 0;

        // Инициализация расстояния сдвига
        const offset = new Victor(difference, difference);

        // Инициализация координат обрабатываемого узла
        const vector = new Victor(x1, y1)
          .add(offset.rotate(between.angle() - offset.angle()).invert())
          .subtract(new Victor(node.element.offsetWidth / 2, node.element.offsetHeight / 2));

        // Перемещение узла
        node.move(vector.x, vector.y);
      }
    }

    configure(attribute) {
      // Инициализация названия параметра
      const parameter = (/^data-(\w+)$/.exec(attribute) ?? [, null])[1];

      if (typeof parameter === 'string') {
        // Параметр найден

        // Проверка на разрешение изменения
        if (this.#block.has(parameter)) return;

        // Инициализация значения параметра
        const value = this.element.getAttribute(attribute);

        if (typeof value !== undefined || typeof value !== null) {
          // Найдено значение

          // Запрошено изменение координаты: x
          if (parameter === 'x') this.element.style.left = value + 'px';

          // Запрошено изменение координаты: y
          if (parameter === 'y') this.element.style.top = value + 'px';

          // Инициализация буфера для временных данных
          let buffer;

          // Запись параметра
          this[parameter] = isNaN((buffer = parseFloat(value)))
            ? value === 'true'
              ? true
              : value === 'false'
                ? false
                : value
            : buffer;
        }
      }
    }

    /**
     * Сброс данных потока
     */
    reset = fn => {
      // Реинициализация реестров обработанных узлов
      this.collisions = this.#operator.actions.collision ? new Set() : null;
      this.pushings = this.#operator.actions.pushing ? new Set() : null;
      this.pullings = this.#operator.actions.pulling ? new Set() : null;

      // Реинициализация счётчиков итераций
      this.actions.collision.current = this.actions.pushing.current = this.actions.pulling.current = 0;
    }
  };

  // Прочитать класс узла
  get node() {
    return this.#node;
  }

  // Класс соединения
  #connection = class connection {
    // HTML-элемент-оболочка
    #shell;

    // Прочитать HTML-элемент-оболочку
    get shell() {
      return this.#shell;
    }

    // HTML-элемент соединения
    #element;

    // Прочитать HTML-элемент соединения
    get element() {
      return this.#element;
    }

    // Инстанция this.operator.node от которой начинается соединение
    #from;

    // Прочитать инстанцию this.operator.node от которой начинается соединение
    get from() {
      return this.#from;
    }

    // Инстанция this.operator.node на которой заканчивается соединение
    #to;

    // Прочитать инстанцию this.operator.node на которой заканчивается соединение
    get to() {
      return this.#to;
    }

    // Оператор
    #operator;

    // Прочитать оператора
    get operator() {
      return this.#operator;
    }

    // Сессии синхронизации позиции узлов с соединениями
    #sessions = new Map;

    // Прочитать сессии синхронизации позиции узлов с соединениями
    get sessions() {
      return this.#sessions;
    }

    // Координата X (основной узел)
    #x1

    // Прочитать координату X (основной узел)
    get x1() {
      return this.#x1;
    }

    // Координата Y (основной узел)
    #y1

    // Прочитать координату Y (основной узел)
    get y1() {
      return this.#y1;
    }

    // Координата X (связанный узел)
    #x2

    // Прочитать координату X (связанный узел)
    get x2() {
      return this.#x2;
    }

    // Координата X (связанный узел)
    #y2

    // Прочитать координату X (связанный узел)
    get y2() {
      return this.#y2;
    }

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

      // Инициализация универсального буфера
      let buffer;

      // Инициализация координат
      this.#x1 = (isNaN((buffer = parseInt(from.element.style.left))) ? 0 : buffer) + from.element.offsetWidth / 2;
      this.#y1 = (isNaN((buffer = parseInt(from.element.style.top))) ? 0 : buffer) + from.element.offsetHeight / 2;
      this.#x2 = (isNaN((buffer = parseInt(to.element.style.left))) ? 0 : buffer) + to.element.offsetWidth / 2;
      this.#y2 = (isNaN((buffer = parseInt(to.element.style.top))) ? 0 : buffer) + to.element.offsetHeight / 2;

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
     * Синхронизировать местоположение со связанным узлом
     *
     * @param {node} node Инстанция узла (связанного с соединением)
     */
    synchronize(node) {
      // Удаление интервала
      clearInterval(this.#sessions.get(node.element.id));

      // Инициализация интервала
      this.#sessions.set(node.element.id, setInterval(fn => {
        if (node === this.from) {
          // Исходящее соединение

          // Инициализация координат
          this.#x1 = node.element.offsetLeft + node.element.offsetWidth / 2;
          this.#y1 = node.element.offsetTop + node.element.offsetHeight / 2;
        } else if (node === this.to) {
          // Входящее соединение

          // Инициализация координат
          this.#x2 = node.element.offsetLeft + node.element.offsetWidth / 2;
          this.#y2 = node.element.offsetTop + node.element.offsetHeight / 2;
        } else return;

        // Запись координат
        this.element.setAttribute('d', `M${this.x1} ${this.y1} L${this.x2} ${this.y2}`);
      }, 0));
    }
  };

  // Прочитать класс соединения
  get connection() {
    return this.#connection;
  }

  // Разрешено перемещать узлы?
  #move = true;

  // Разрешено перемещать камеру? (svg-элементы-соединения - рёбра)
  #camera = true;

  /**
   * Конструктор графика
   *
   * @param {HTMLElement|string} shell HTML-элемент-оболочка для графика, либо его идентификатор
   * @param {boolean} body Перенос работает на теле документа? (иначе на HTML-элементе-оболочке)
   * @param {boolean} camera Активировать перемещение камеры?
   */
  constructor(shell, body = true, camera = true) {
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

    // Перемещение камеры
    if (camera === true) {
      target.onmousedown = function (onmousedown) {
        // Начало переноса

        if (_this.#camera) {
          // Разрешено двигать камеру (оболочку)

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

            for (const connection of _this.connections) {
              // Перебор соединений

              // Синхронизация
              connection.synchronize(connection.from);
              connection.synchronize(connection.to);
            }
          }

          // Запись слушателя события: "перенос полотна"
          target.onmousemove = move;
        }

        // Конец переноса
        target.onmouseup = function () {
          target.onmousemove = null;
          target.onmouseup = null;

          // Запись иконки курсора
          target.style.cursor = null;
        };
      };

      // Блокировка событий браузера (чтобы не дёргалось)
      target.ondragstart = null;
    }
  }

  write = function (data = {}) {
    if (typeof data === 'object') {
      // Получен обязательный входной параметр в правильном типе

      // Инициализация узла
      const node = new this.node(this, data);

      // Инициализация ссылки на обрабатываемый объект
      const _this = this;

      // Запрет движения камеры при наведении на узел (чтобы двигать узел)
      node.element.onmouseover = function (e) {
        _this.#camera = false;
      };

      // Снятие запрета движения камеры
      node.element.onmouseout = function (e) {
        _this.#camera = true;
      };

      if (this.#move) {
        // Разрешено перемещать узлы

        // Инициализация переноса узла
        node.element.onmousedown = function (onmousedown) {
          // Начало переноса

          // Инициализация буфера позиционирования
          const z = node.element.style.zIndex;

          // Позиционирование над остальными узлами
          node.element.style.zIndex = 5000;

          // Блокировка анимации
          node.element.style.transition = 'unset';

          if (!_this.#camera) {
            // Запрещено двигать камеру (оболочку)

            // Инициализация координат
            const n = node.element.getBoundingClientRect();
            const s = _this.shell.getBoundingClientRect();

            // Инициализация функции переноса узла
            function move(onmousemove) {
              // Сброс данных потока
              node.reset();

              for (const connection of node.outputs) {
                // Перебор исходящих соединений

                // Синхронизация местоположения
                for (const _connection of connection.to.inputs) _connection.synchronize(connection.to);
                for (const _connection of connection.to.outputs) _connection.synchronize(connection.to);
              }

              for (const connection of node.inputs) {
                // Перебор входящих соединений

                // Синхронизация местоположения
                for (const _connection of connection.from.inputs) _connection.synchronize(connection.from);
                for (const _connection of connection.from.outputs) _connection.synchronize(connection.from);
              }

              // Перемещение узла
              node.move(
                onmousemove.pageX -
                (onmousedown.pageX - n.left + s.left + scrollX),
                onmousemove.pageY -
                (onmousedown.pageY - n.top + s.top + scrollY)
              );
            }

            // Запись слушателя события: "перенос узла"
            document.onmousemove = move;
          }

          // Конец переноса
          node.element.onmouseup = function () {
            // Очистка обработчиков событий
            document.onmousemove = null;
            node.element.onmouseup = null;

            // Разблокировка анимации
            node.element.style.transition = null;

            // Возвращение позиционирования
            node.element.style.zIndex = z;
          };
        };

        // Перещапись событий браузера (чтобы не дёргалось)
        node.element.ondragstart = null;
      }

      // Запись в реестр
      this.nodes.add(node);

      return node;
    }
  };

  connect = function (from, to) {
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

      return connection;
    }
  };
}

document.dispatchEvent(
  new CustomEvent('graph.loaded', {
    detail: { graph }
  })
);
