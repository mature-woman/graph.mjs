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
  nodes = new Set();

  // Реестр соединений
  connections = new Set();

  // Класс узла
  node = class node {
    // Реестр входящих соединений
    #inputs = new Map();

    // Реестр входящих соединений
    get inputs() {
      return this.#inputs;
    }

    // Реестр исходящих соединений
    #outputs = new Map();

    // Реестр исходящих соединений
    get outputs() {
      return this.#outputs;
    }

    // Оператор
    #operator;

    // Оператор
    get operator() {
      return this.#operator;
    }

    // HTML-элемент
    #element;

    // HTML-элемент
    get element() {
      return this.#element;
    }

    // Наблюдатель
    #observer = null;

    // Наблюдатель
    get observer() {
      return this.#observer;
    }

    // Реестр запрещённых к изменению параметров
    #block = new Set(["events"]);

    // Реестр запрещённых к изменению параметров
    get block() {
      return this.#block;
    }

    // Параметры генерации
    #diameter = 100;
    #increase = 5;

    // Параметры генерации
    get diameter() {
      return this.#diameter;
    }
    get increase() {
      return this.#increase;
    }

    constructor(data, graph) {
      // Инициализация оболочки
      const article = document.createElement("article");
      article.id = graph.nodes.size;
      article.classList.add("node", "unselectable");
      article.style.top =
        graph.shell.offsetHeight / 2 -
        this.#diameter / 2 +
        (0.5 - Math.random()) * 500 +
        "px";
      article.style.left =
        graph.shell.offsetWidth / 2 -
        this.#diameter / 2 +
        (0.5 - Math.random()) * 500 +
        "px";

      if (typeof data.title === "string") {
        // Найден заголовок узла

        // Инициализация заголовка
        const title = document.createElement("h4");
        title.innerText = data.title;

        // Запись в оболочку
        article.appendChild(title);
      }

      // Запись в свойство
      this.#element = article;

      // Запись в свойство
      this.#operator = graph;

      // Запись в документ
      graph.shell.appendChild(article);

      // Инициализация
      this.init();
    }

    init(increase = 0) {
      // Изменение диаметра
      if (increase !== 0) this.#diameter += this.#increase * increase;

      // Инициализация размера элемента
      this.element.style.width = this.element.style.height =
        this.#diameter + "px";

      // Инициализация ссылки на ядро
      const _this = this;

      // Инициализация наблюдателя
      this.#observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          if (mutation.type === "attributes") {
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

      // this.style.left = x + 'px';
      // this.style.top = y + 'px';
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

      return this;
    }

    move(x, y) {
      // Запись отступов
      this.element.style.left = x + "px";
      this.element.style.top = y + "px";

      // Запись аттрибутов с координатами
      this.element.setAttribute("data-graph-x", x);
      this.element.setAttribute("data-graph-y", y);

      for (const [connection, target] of this.outputs) {
        // Перебор исходящих соединений

        // Инициализация координат для линии
        const x1 = parseInt(this.element.style.left);
        const y1 = parseInt(this.element.style.top);

        // Запись новой координаты по горизонтали
        connection.children[0].setAttribute(
          "x1",
          (isNaN(x1) ? 0 : x1) + this.element.offsetWidth / 2
        );

        // Запись новой координаты по вертикали
        connection.children[0].setAttribute(
          "y1",
          (isNaN(y1) ? 0 : y1) + this.element.offsetHeight / 2
        );
      }

      for (const [connection, target] of this.inputs) {
        // Перебор входящих соединений

        // Инициализация координат для линии
        const x2 = parseInt(this.element.style.left);
        const y2 = parseInt(this.element.style.top);

        // Запись новой координаты по горизонтали
        connection.children[0].setAttribute(
          "x2",
          (isNaN(x2) ? 0 : x2) + this.element.offsetWidth / 2
        );

        // Запись новой координаты по вертикали
        connection.children[0].setAttribute(
          "y2",
          (isNaN(y2) ? 0 : y2) + this.element.offsetHeight / 2
        );
      }

      // Обработка столкновений
      this.collision(this.operator.nodes);
    }

    collision(nodes) {
      // Инициализация буфера реестра узлов
      const buffer = new Set(nodes);

      // Удаление текущего узла из буфера
      buffer.delete(this);

      // Удаление текущего узла из буфера
      buffer.delete(this);

      // Обработка коллизии
      for (const node of buffer) {
        // Перебор узлов в реестре

        // Инициализация вектора между узлами
        let between;

        // Инициализация ускорения
        let increase = 0;

        // Инициализация количества итераций
        let iterations = 300;

        do {
          // Произошла коллизия (границы кругов перекрылись)

          // Инициализация координат целевого узла
          let x1 = parseInt(node.element.style.left);
          x1 = (isNaN(x1) ? 0 : x1) + node.element.offsetWidth / 2;
          let y1 = parseInt(node.element.style.top);
          y1 = (isNaN(y1) ? 0 : y1) + node.element.offsetHeight / 2;

          // Инициализация координат обрабатываемого узла
          let x2 = parseInt(this.element.style.left);
          x2 = (isNaN(x2) ? 0 : x2) + this.element.offsetWidth / 2;
          let y2 = parseInt(this.element.style.top);
          y2 = (isNaN(y2) ? 0 : y2) + this.element.offsetHeight / 2;

          // Реинициализация вектора между узлами
          between = new victor(x1 - x2, y1 - y2);

          // Проверка на столкновение узлов
          if (
            between.length() > node.diameter / 2 + this.diameter / 2 ||
            --iterations === 0
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

          // Перемещение узла с которым произошло столкновение
          node.move(vector.x, vector.y);
        } while (between.length() <= node.diameter / 2 + this.diameter / 2);
      }
    }
  };

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
      const node = new this.node(data, this);

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
              // Перемещение
              node.move(
                onmousemove.pageX -
                  (onmousedown.pageX - n.left + s.left + pageXOffset),
                onmousemove.pageY -
                  (onmousedown.pageY - n.top + s.top + pageYOffset)
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

      // Инициализация оболочки
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = this.connections.size;
      svg.classList.add("connection");
      svg.setAttribute("data-from", from.element.id);
      svg.setAttribute("data-to", to.element.id);

      // Инициализация координат для линии
      let x1 = parseInt(from.element.style.left);
      x1 = isNaN(x1) ? 0 : x1;
      let y1 = parseInt(from.element.style.top);
      y1 = isNaN(y1) ? 0 : y1;
      let x2 = parseInt(to.element.style.left);
      x2 = isNaN(x2) ? 0 : x2;
      let y2 = parseInt(to.element.style.top);
      y2 = isNaN(y2) ? 0 : y2;

      // Инициализация оболочки
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", x1 + from.element.offsetWidth / 2);
      line.setAttribute("y1", y1 + from.element.offsetHeight / 2);
      line.setAttribute("x2", x2 + to.element.offsetWidth / 2);
      line.setAttribute("y2", y2 + to.element.offsetHeight / 2);
      line.setAttribute("stroke", "grey");
      line.setAttribute("stroke-width", "8px");

      // Запись в оболочку
      svg.append(line);

      // Запись в документ
      this.shell.appendChild(svg);

      // Запись соединений в реестры узлов
      from.outputs.set(svg, to);
      to.inputs.set(svg, from);

      // Запись в реестр ядра
      this.connections.add([from, to]);

      // Реинициализация узла-получателя
      to.init(1);

      return svg;
    }
  };
}

document.dispatchEvent(
  new CustomEvent("graph.loaded", {
    detail: { graph }
  })
);
