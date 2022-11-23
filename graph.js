import victor from "https://cdn.skypack.dev/victor@1.1.0";

("use strict");

/**
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 */
class graph {
  // Оболочка (instanceof HTMLElement)
  #shell = document.getElementById("graph");
  get shell() {
    return this.#shell;
  }

  // Реестр узлов
  #nodes = new Set();
  get nodes() {
    return this.#nodes;
  }

  // Реестр соединений
  #connections = new Set();
  get connections() {
    return this.#connections;
  }

  // Класс узла
  #node = class node {
    // Реестр входящих соединений
    #inputs = new Set();
    get inputs() {
      return this.#inputs;
    }

    // Реестр исходящих соединений
    #outputs = new Set();
    get outputs() {
      return this.#outputs;
    }

    // Оператор
    #operator;
    get operator() {
      return this.#operator;
    }

    // HTML-элемент
    #element;
    get element() {
      return this.#element;
    }

    // Наблюдатель
    #observer = null;
    get observer() {
      return this.#observer;
    }

    // Реестр запрещённых к изменению параметров
    #block = new Set(["events"]);
    get block() {
      return this.#block;
    }

    // Диаметр узла
    #diameter = 100;
    get diameter() {
      return this.#diameter;
    }

    // Степень увеличения диаметра
    #increase = 0;
    get increase() {
      return this.#increase;
    }

    // Величина степени увеличения диаметра
    #addition = 12;
    get addition() {
      return this.#addition;
    }

    // Счётчик итераций
    iteration = 0;

    // Ограничение максимального количества итераций за вызов
    limit = 3000;

    // Обработка событий
    actions = {
      collision: true,
      pushing: true,
      pulling: true
    };

    constructor(operator, data) {
      // Инициализация HTML-элемента узла
      const a = document.createElement("a");
      a.id = operator.nodes.size;
      a.classList.add("node", "unselectable");
      if (typeof data.href === "string") a.href = data.href;

      if (typeof data.title === "string") {
        // Найден заголовок узла

        // Инициализация заголовка
        const title = document.createElement("h4");
        title.innerText = data.title;

        // Запись в оболочку
        a.appendChild(title);
      }

      // Запись в документ
      operator.shell.appendChild(a);

      // Запись в свойство
      this.#element = a;

      // Запись в свойство
      this.#operator = operator;

      // Инициализация
      this.init();

      // Перемещение
      this.move(
        operator.shell.offsetWidth / 2 -
          this.#diameter / 2 +
          (0.5 - Math.random()) * 500,
        operator.shell.offsetHeight / 2 -
          this.#diameter / 2 +
          (0.5 - Math.random()) * 500,
        true,
        true,
        true
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
        this.#diameter + "px";

      // Инициализация ссылки на ядро
      const _this = this;

      // Инициализация наблюдателя
      this.#observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          if (mutation.type === "attributes") {
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

    move(x, y, collision = false, pushing = false, pulling = false) {
      // Запись отступов
      this.element.style.left = x + "px";
      this.element.style.top = y + "px";

      // Запись аттрибутов с координатами
      this.element.setAttribute("data-graph-x", x);
      this.element.setAttribute("data-graph-y", y);

      // Инициализация реестров узлов
      if (collision === true) collision = new Set();
      if (pushing === true) pushing = new Set();
      if (pulling === true) pulling = new Set();

      // Обработка столкновений
      if (collision && !collision.has(this))
        this.collision(this.operator.nodes, collision);

      // Инициализация буфера реестра узлов
      const registry = new Set(this.operator.nodes);

      if (pushing && !pushing.has(this)) {
        // Активно отталкивание

        // Инициализация счётчика циклов
        let iterations = 50;

        for (const connection of this.inputs) {
          // Перебор входящих соединений

          // Ограничение выполнения
          if (--iterations <= 0) break;

          // Защита от повторной обработки
          if (pushing.has(connection.from)) continue;

          // Удаление из буфера реестра узлов
          registry.delete(connection.from);

          // Обработка отталкивания
          this.pushing(new Set([connection.from]), pushing);
        }

        // Реинициализация счётчика циклов
        iterations = 50;

        for (const connection of this.outputs) {
          // Перебор исходящих соединений

          // Ограничение выполнения
          if (--iterations <= 0) break;

          // Защита от повторной обработки
          if (pushing.has(connection.to)) continue;

          // Удаление из буфера реестра узлов
          registry.delete(connection.to);

          // Обработка отталкивания
          this.pushing(new Set([connection.to]), pushing);
        }
      }

      if (pulling && !pulling.has(this)) {
        // Активно притягивание

        // Инициализация счётчика циклов
        let iterations = 50;

        for (const connection of this.inputs) {
          // Перебор входящих соединений

          // Ограничение выполнения
          if (--iterations <= 0) break;

          // Защита от повторной обработки
          if (pulling.has(connection.from)) continue;

          // Удаление из буфера реестра узлов
          registry.delete(connection.from);

          // Обработка притягивания
          this.pulling(new Set([connection.from]), pulling);
        }

        // Реинициализация счётчика циклов
        iterations = 50;

        for (const connection of this.outputs) {
          // Перебор входящих соединений

          // Ограничение выполнения
          if (--iterations <= 0) break;

          // Защита от повторной обработки
          if (pulling.has(connection.to)) continue;

          // Удаление из буфера реестра узлов
          registry.delete(connection.to);

          // Обработка притягивания
          this.pulling(new Set([connection.to]), pulling);
        }
      }

      // Обработка отталкивания остальных узлов
      if (pushing) this.pushing(registry, pushing);

      // Синхронизация местоположения исходящих соединений
      for (const connection of this.outputs) connection.sync(this);

      // Синхронизация местоположения входящих соединений
      for (const connection of this.inputs) connection.sync(this);
    }

    collision(nodes, involved) {
      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      // Обработка столкновения с узлами
      for (const node of registry) {
        // Перебор узлов в реестре

        // Защита от повторной обработки узла
        if (involved.has(node)) continue;

        // Инициализация вектора между узлами
        let between;

        // Инициализация ускорения
        let increase = 0;

        // Инициализация максимального количества итераций
        let iterations = 30;

        do {
          // Произошла коллизия (границы кругов перекрылись)

          if (++this.iteration >= this.limit) {
            // Превышено ограничение по числу итераций

            // Сброс счётчика итераций
            this.iteration = 0;

            // Конец выполнения
            break;
          }

          if (++node.iteration >= node.limit) {
            // Превышено ограничение по числу итераций

            // Сброс счётчика итераций
            node.iteration = 0;

            // Конец выполнения
            break;
          }

          // Инициализация универсального буфера
          let buffer;

          // Инициализация координат целевого узла
          let x1 =
            (isNaN((buffer = parseInt(node.element.style.left))) ? 0 : buffer) +
            node.element.offsetWidth / 2;
          let y1 =
            (isNaN((buffer = parseInt(node.element.style.top))) ? 0 : buffer) +
            node.element.offsetHeight / 2;

          // Инициализация координат обрабатываемого узла
          let x2 =
            (isNaN((buffer = parseInt(this.element.style.left))) ? 0 : buffer) +
            this.element.offsetWidth / 2;
          let y2 =
            (isNaN((buffer = parseInt(this.element.style.top))) ? 0 : buffer) +
            this.element.offsetHeight / 2;

          // Реинициализация вектора между узлами
          between = new victor(x1 - x2, y1 - y2);

          // Узлы преодолели расстояние столкновения?
          if (
            !node.actions.collision ||
            between.length() > node.diameter / 2 + this.diameter / 2 ||
            --iterations <= 0
          )
            break;

          // Инициализация координат вектора (узла с которым произошло столкновение)
          let vector = new victor(x1, y1)
            .add(new victor(between.x, between.y).norm().unfloat())
            .subtract(
              new victor(
                node.element.offsetWidth / 2,
                node.element.offsetHeight / 2
              )
            );

          if (node.actions.collision) {
            // Активно столкновение узлов

            // Запрещение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = this.actions.collision = this.actions.pushing = this.actions.pulling = false;

            // Запись узлов в реестр задействованных узлов
            involved.add(this);

            // Перемещение узла
            node.move(vector.x, vector.y, involved, involved, involved);

            // Разрешение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = this.actions.collision = this.actions.pushing = this.actions.pulling = true;
          }

          // Проверка на столкновение узлов
        } while (
          node.actions.collision &&
          between.length() <= node.diameter / 2 + this.diameter / 2
        );
      }
    }

    pushing(nodes, involved, add) {
      if (++this.iteration >= this.limit) {
        // Превышено ограничение по числу итераций

        // Сброс счётчика итераций
        this.iteration = 0;

        // Отмена выполнения
        return;
      }

      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      // Инициализация ссылки на ядро
      const _this = this;

      // Увеличение дистанции для проверки
      const distance = 100;

      // Обработка отталкивания узлов
      for (const node of registry) {
        // Перебор узлов в буфере реестра

        // Защита от повторной обработки узла
        if (involved.has(node)) continue;

        // Инициализация вектора между узлами
        let between;

        // Инициализация максимального количества итераций
        let iterations = 30;

        function move() {
          if (++node.iteration >= node.limit) {
            // Превышено ограничение по числу итераций

            // Сброс счётчика итераций
            node.iteration = 0;

            // Отмена выполнения
            return;
          }

          // Инициализация универсального буфера
          let buffer;

          // Инициализация координат целевого узла
          let x1 =
            (isNaN((buffer = parseInt(node.element.style.left))) ? 0 : buffer) +
            node.element.offsetWidth / 2;
          let y1 =
            (isNaN((buffer = parseInt(node.element.style.top))) ? 0 : buffer) +
            node.element.offsetHeight / 2;

          // Инициализация координат обрабатываемого узла
          let x2 =
            (isNaN((buffer = parseInt(_this.element.style.left)))
              ? 0
              : buffer) +
            _this.element.offsetWidth / 2;
          let y2 =
            (isNaN((buffer = parseInt(_this.element.style.top))) ? 0 : buffer) +
            _this.element.offsetHeight / 2;

          // Реинициализация вектора между узлами
          between = new victor(x1 - x2, y1 - y2);

          // Инициализация увеличения
          let increase =
            (node.diameter + _this.diameter) /
            2 ** (_this.increase + node.increase);

          // Узлы преодолели расстояние отталкивания?
          if (
            !node.actions.pushing ||
            between.length() >
              (node.diameter + _this.diameter) / 2 +
                distance +
                increase +
                (typeof add === "number" ? add : 0) ||
            --iterations <= 0
          )
            return;

          // Инициализация координат вектора (узла с которым произошло столкновение)
          let vector = new victor(x1, y1)
            .add(new victor(between.x, between.y).norm().unfloat())
            .subtract(
              new victor(
                node.element.offsetWidth / 2,
                node.element.offsetHeight / 2
              )
            );

          if (node.actions.pushing) {
            // Активно притягивание узла

            // Запрещение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = _this.actions.collision = _this.actions.pushing = _this.actions.pulling = false;

            // Запись узлов в реестр задействованных узлов
            involved.add(_this);

            // Перемещение узла
            node.move(vector.x, vector.y, involved, involved, involved);

            // Разрешение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = _this.actions.collision = _this.actions.pushing = _this.actions.pulling = true;
          }

          // Проверка расстояния
          if (
            node.actions.pushing &&
            between.length() <=
              (node.diameter + _this.diameter) / 2 +
                distance +
                increase +
                (typeof add === "number" ? add : 0)
          )
            setTimeout(move, between.length() / 100);
        }

        // Повторная обработка (вход в рекурсию)
        if (node.actions.pushing) move();
      }
    }

    pulling(nodes, involved, add) {
      // Инициализация буфера реестра узлов
      const registry = new Set(nodes);

      // Удаление текущего узла из буфера
      registry.delete(this);

      // Инициализация ссылки на ядро
      const _this = this;

      // Увеличение дистанции для проверки
      const distance = 150;

      // Обработка притягивания узлов
      for (const node of registry) {
        // Перебор узлов в буфере реестра

        // Защита от повторной обработки узла
        if (involved.has(node)) continue;

        // Инициализация вектора между узлами
        let between;

        // Инициализация максимального количества итераций
        let iterations = 30;

        function move() {
          if (++_this.iteration >= _this.limit) {
            // Превышено ограничение по числу итераций

            // Сброс счётчика итераций
            _this.iteration = 0;

            // Конец выполнения
            return;
          }

          if (++node.iteration >= node.limit) {
            // Превышено ограничение по числу итераций

            // Сброс счётчика итераций
            node.iteration = 0;

            // Конец выполнения
            return;
          }

          // Инициализация универсального буфера
          let buffer;

          // Инициализация координат целевого узла
          let x1 =
            (isNaN((buffer = parseInt(node.element.style.left))) ? 0 : buffer) +
            node.element.offsetWidth / 2;
          let y1 =
            (isNaN((buffer = parseInt(node.element.style.top))) ? 0 : buffer) +
            node.element.offsetHeight / 2;

          // Инициализация координат обрабатываемого узла
          let x2 =
            (isNaN((buffer = parseInt(_this.element.style.left)))
              ? 0
              : buffer) +
            _this.element.offsetWidth / 2;
          let y2 =
            (isNaN((buffer = parseInt(_this.element.style.top))) ? 0 : buffer) +
            _this.element.offsetHeight / 2;

          // Реинициализация вектора между узлами
          between = new victor(x1 - x2, y1 - y2);

          // Инициализация увеличения
          let increase =
            (node.diameter + _this.diameter) /
            2 ** (_this.increase + node.increase);

          // Узлы преодолели расстояние притягивания?
          if (
            !node.actions.pulling ||
            between.length() <=
              (node.diameter + _this.diameter) / 2 +
                distance +
                increase +
                (typeof add === "number" ? add : 0) ||
            --iterations <= 0
          )
            return;

          // Инициализация координат вектора (узла с которым произошло столкновение)
          let vector = new victor(x1, y1)
            .add(new victor(between.x, between.y).norm().invert().unfloat())
            .subtract(
              new victor(
                node.element.offsetWidth / 2,
                node.element.offsetHeight / 2
              )
            );

          if (node.actions.pulling) {
            // Активно притягивание узлов

            // Запрещение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = _this.actions.collision = _this.actions.pushing = _this.actions.pulling = false;

            // Запись узлов в реестр задействованных узлов
            involved.add(_this);

            // Перемещение узла
            node.move(vector.x, vector.y, involved, involved, involved);

            // Разрешение столкновения, притягивания и отталкивания целевого узла и обрабатываемого узла (другими узлами)
            node.actions.collision = node.actions.pushing = node.actions.pulling = _this.actions.collision = _this.actions.pushing = _this.actions.pulling = true;
          }

          if (
            node.actions.pulling &&
            between.length() >
              (node.diameter + _this.diameter) / 2 +
                distance +
                increase +
                (typeof add === "number" ? add : 0)
          )
            return setTimeout(
              move,
              between.length() / 10 - between.length() / 10
            );
        }

        // Повторная обработка (вход в рекурсию)
        if (node.actions.pulling) move();
      }
    }

    configure(attribute) {
      // Инициализация названия параметра
      const parameter = (/^data-graph-(\w+)$/.exec(attribute) ?? [, null])[1];

      if (typeof parameter === "string") {
        // Параметр найден

        // Проверка на разрешение изменения
        if (this.#block.has(parameter)) return;

        // Инициализация значения параметра
        const value = this.element.getAttribute(attribute);

        if (typeof value !== undefined || typeof value !== null) {
          // Найдено значение

          // Запрошено изменение координаты: x
          if (parameter === "x") this.element.style.left = value + "px";

          // Запрошено изменение координаты: y
          if (parameter === "y") this.element.style.top = value + "px";

          // Инициализация буфера для временных данных
          let buffer;

          // Запись параметра
          this[parameter] = isNaN((buffer = parseFloat(value)))
            ? value === "true"
              ? true
              : value === "false"
              ? false
              : value
            : buffer;
        }
      }
    }
  };

  // Класс узла
  get node() {
    return this.#node;
  }

  // Класс соединения
  #connection = class connection {
    // HTML-элемент
    #element;

    // HTML-элемент
    get element() {
      return this.#element;
    }

    // Инстанция node от которой начинается соединение
    #from;

    // Инстанция node от которой начинается соединение
    get from() {
      return this.#from;
    }

    // Инстанция node на которой заканчивается соединение
    #to;

    // Инстанция node на которой заканчивается соединение
    get to() {
      return this.#to;
    }

    // Оператор
    #operator;

    // Оператор
    get operator() {
      return this.#operator;
    }

    constructor(operator, from, to) {
      // Запись свойства
      this.#operator = operator;

      // Запись свойства
      this.#from = from;

      // Запись свойства
      this.#to = to;

      // Инициализация оболочки
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = operator.connections.size;
      svg.classList.add("connection");
      svg.setAttribute("data-from", from.element.id);
      svg.setAttribute("data-to", to.element.id);

      // Инициализация универсального буфера
      let buffer;

      // Инициализация оболочки
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute(
        "x1",
        (isNaN((buffer = parseInt(from.element.style.left))) ? 0 : buffer) +
          from.element.offsetWidth / 2
      );
      line.setAttribute(
        "y1",
        (isNaN((buffer = parseInt(from.element.style.top))) ? 0 : buffer) +
          from.element.offsetHeight / 2
      );
      line.setAttribute(
        "x2",
        (isNaN((buffer = parseInt(to.element.style.left))) ? 0 : buffer) +
          to.element.offsetWidth / 2
      );
      line.setAttribute(
        "y2",
        (isNaN((buffer = parseInt(to.element.style.top))) ? 0 : buffer) +
          to.element.offsetHeight / 2
      );
      line.setAttribute("stroke", "grey");
      line.setAttribute("stroke-width", "8px");

      // Запись свойства
      this.#element = svg;

      // Запись в оболочку
      svg.append(line);

      // Запись в документ
      operator.shell.appendChild(svg);
    }

    /**
     * Синхронизировать местоположение со связанным узлом
     *
     * @param {node} node Инстанция узла (связанного с соединением)
     */
    sync(node) {
      // Инициализация названий аттрибутов
      let x = "x",
        y = "y";

      if (node === this.from) {
        // Исходящее соединение

        // Запись названий аттрибутов
        x += 1;
        y += 1;
      } else if (node === this.to) {
        // Входящее соединение

        // Запись названий аттрибутов
        x += 2;
        y += 2;
      } else return;

      // Инициализация универсального буфера
      let buffer;

      // Запись отступа (координаты по горизонтали)
      this.element.children[0].setAttribute(
        x,
        (isNaN((buffer = parseInt(node.element.style.left))) ? 0 : buffer) +
          node.element.offsetWidth / 2
      );

      // Запись отступа (координаты по вертикали)
      this.element.children[0].setAttribute(
        y,
        (isNaN((buffer = parseInt(node.element.style.top))) ? 0 : buffer) +
          node.element.offsetHeight / 2
      );
    }
  };

  // Класс соединения
  get connection() {
    return this.#connection;
  }

  #move = true;
  #camera = true;

  constructor(shell, camera = true) {
    // Запись оболочки
    if (shell instanceof HTMLElement) this.shell = shell;

    // Инициализация ссылки на обрабатываемый объект
    const _this = this;

    // Перемещение камеры
    if (camera === true) {
      this.shell.onmousedown = function (e) {
        // Начало переноса

        if (_this.#camera) {
          // Разрешено двигать камеру (оболочку)

          // Инициализация координат
          const coords = _this.shell.getBoundingClientRect();
          const x = e.pageX - coords.left + pageXOffset;
          const y = e.pageY - coords.top + pageYOffset;

          // Инициализация функции переноса полотна
          function move(onmousemove) {
            // Запись нового отступа от лева
            _this.shell.style.left = onmousemove.pageX - x + "px";

            // Запись нового отступа от верха
            _this.shell.style.top = onmousemove.pageY - y + "px";
          }

          // Запись слушателя события: "перенос полотна"
          document.onmousemove = move;
        }

        // Конец переноса
        _this.shell.onmouseup = function () {
          document.onmousemove = null;
          _this.shell.onmouseup = null;
        };
      };

      // Перещапись событий браузера (чтобы не дёргалось)
      _this.shell.ondragstart = null;
    }
  }

  write = function (data = {}) {
    if (typeof data === "object") {
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

        node.element.onmousedown = function (onmousedown) {
          // Начало переноса

          // Позиционирование над остальными узлами
          node.element.style.zIndex = 550;

          if (!_this.#camera) {
            // Запрещено двигать камеру (оболочку)

            // Инициализация координат
            const n = node.element.getBoundingClientRect();
            const s = _this.shell.getBoundingClientRect();

            // Инициализация функции переноса узла
            function move(onmousemove) {
              // Запись обработки столкновений и отталкивания
              node.actions.collision = node.actions.pushing = node.actions.pulling = false;

              // Перемещение
              node.move(
                onmousemove.pageX -
                  (onmousedown.pageX - n.left + s.left + pageXOffset),
                onmousemove.pageY -
                  (onmousedown.pageY - n.top + s.top + pageYOffset),
                true,
                true,
                true
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

            // Запись обработки столкновений и отталкивания
            node.actions.collision = node.actions.pushing = node.actions.pulling = true;

            // Позиционирование вместе остальными узлами
            node.element.style.zIndex = 500;
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
  new CustomEvent("graph.loaded", {
    detail: { graph }
  })
);
