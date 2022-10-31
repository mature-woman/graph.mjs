"use strict";

/**
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 */
class graph {
  // Оболочка (instanceof HTMLElement)
  shell = document.getElementById("graph");

  // Реестр узлов
  nodes = new Set();

  // Реестр соединений
  connections = new Set();

  // Класс узла
  node = class node {
    // Реестр входящих соединений
    inputs = new Map();

    // Реестр исходящих соединений
    outputs = new Map();

    // HTML-элемент
    element;

    // Параметры генерации
    #diameter = 100;
    #increase = 5;

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
      this.element = article;

      // Запись в документ
      graph.shell.appendChild(article);

      // Инициализация
      this.init();
    }

    init() {
      // Инициализация размера
      this.element.style.width = this.element.style.height =
        this.#diameter + this.#increase * this.inputs.size + "px";
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

          // Инициализация функции переноса
          function move(e) {
            // Запись нового отступа от верха
            _this.shell.style.top = e.pageY - y + "px";

            // Запись нового отступа от лева
            _this.shell.style.left = e.pageX - x + "px";
          }

          // Перенос
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

            // Инициализация функции переноса
            function move(onmousemove) {
              // Запись нового отступа от верха
              node.element.style.top =
                onmousemove.pageY -
                (onmousedown.pageY - n.top + s.top + pageYOffset) +
                "px";

              // Запись нового отступа от лева
              node.element.style.left =
                onmousemove.pageX -
                (onmousedown.pageX - n.left + s.left + pageXOffset) +
                "px";

              for (const [connection, target] of node.outputs) {
                // Перебор исходящих соединений

                // Инициализация координат для линии
                const x1 = parseInt(node.element.style.left);
                const y1 = parseInt(node.element.style.top);

                // Запись новой координаты по горизонтали
                connection.children[0].setAttribute(
                  "x1",
                  (isNaN(x1) ? 0 : x1) + node.element.offsetWidth / 2
                );

                // Запись новой координаты по вертикали
                connection.children[0].setAttribute(
                  "y1",
                  (isNaN(y1) ? 0 : y1) + node.element.offsetHeight / 2
                );
              }

              for (const [connection, target] of node.inputs) {
                // Перебор входящих соединений

                // Инициализация координат для линии
                const x2 = parseInt(node.element.style.left);
                const y2 = parseInt(node.element.style.top);

                // Запись новой координаты по горизонтали
                connection.children[0].setAttribute(
                  "x2",
                  (isNaN(x2) ? 0 : x2) + node.element.offsetWidth / 2
                );

                // Запись новой координаты по вертикали
                connection.children[0].setAttribute(
                  "y2",
                  (isNaN(y2) ? 0 : y2) + node.element.offsetHeight / 2
                );
              }
            }

            // Перенос
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
      to.init();

      return svg;
    }
  };
}
