// MyCustomTableTool.js

/**
 * Полностью независимый плагин для EditorJS, который создаёт таблицу
 * и в каждой ячейке позволяет вставить текст или картинку.
 */
export default class MyCustomTableTool {
    /**
     * Название и иконка для тулбара EditorJS
     */
    static get toolbox() {
        return {
            title: 'Моя Таблица',
            // Примитивная иконка (можете заменить на свою)
            icon: '<svg width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M15 5H2C1.44772 5 1 4.55228 1 4V2C1 1.44772 1.44772 1 2 1H15C15.5523 1 16 1.44772 16 2V4C16 4.55228 15.5523 5 15 5Z"/><path fill="currentColor" d="M15 10H2C1.44772 10 1 9.55228 1 9V7C1 6.44772 1.44772 6 2 6H15C15.5523 6 16 6.44772 16 7V9C16 9.55228 15.5523 10 15 10Z"/><path fill="currentColor" d="M15 15H2C1.44772 15 1 14.5523 1 14V12C1 11.4477 1.44772 11 2 11H15C15.5523 11 16 11.4477 16 12V14C16 14.5523 15.5523 15 15 15Z"/></svg>',
        };
    }

    /**
     * Конструктор. Получаем начальные данные (data), API редактора (api) и config.
     */
    constructor({ data, api, config }) {
        this.api = api;
        // Сохранённая структура
        this._data = data || {};

        // Количество строк и столбцов по умолчанию, если нет сохранённых данных
        this.rows = this._data.content ? this._data.content.length : (config?.rows || 2);
        this.cols = this._data.content ? this._data.content[0].length : (config?.cols || 2);

        // Если были сохранённые данные, используем их
        // Если нет — создаём пустую структуру
        this._content = this._data.content || this._createEmptyTable(this.rows, this.cols);
    }

    /**
     * Создаём пустую структуру таблицы.
     * Каждая ячейка — массив блоков, по умолчанию [ { type: 'paragraph', data: { text: '' } } ]
     */
    _createEmptyTable(rows, cols) {
        const content = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({
                    type: 'paragraph',
                    data: {
                        text: '',
                    },
                });
            }
            content.push(row);
        }
        return content;
    }

    /**
     * Метод, который EditorJS вызывает, чтобы вставить наш блок в DOM
     * Здесь мы строим <div> с <table>, наполняем ячейки
     */
    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('mycustom-table-wrapper');

        this.table = document.createElement('table');
        this.table.classList.add('mycustom-table');

        // Рендерим строки
        this._content.forEach((rowData, rowIndex) => {
            const tr = document.createElement('tr');

            rowData.forEach((cellData, colIndex) => {
                const td = document.createElement('td');
                td.classList.add('mycustom-table-cell');

                // Создаём контейнер для редактирования
                // Можно сделать contentEditable = true
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell-div');
                cellDiv.contentEditable = true;

                // Если это изображение
                if (cellData.type === 'image' && cellData.data?.file?.url) {
                    // Вставляем <img>
                    cellDiv.innerHTML = `<img src="${cellData.data.file.url}" alt="cell-img" />`;
                } else {
                    // Считаем, что это параграф
                    cellDiv.innerHTML = cellData.data?.text || '';
                }

                // Плюсик с выпадающим меню
                this.addPlusButton(td);

                td.appendChild(cellDiv);
                tr.appendChild(td);
            });

            this.table.appendChild(tr);
        });

        this.wrapper.appendChild(this.table);
        return this.wrapper;
    }

    /**
     * Простейшая кнопка «+» в углу ячейки с меню «Вставить фото»
     */
    addPlusButton(cell) {
        // Кнопка
        const plusBtn = document.createElement('button');
        plusBtn.innerText = '+';
        plusBtn.classList.add('mytable-plus-btn');

        // Менюшка
        const dropdown = document.createElement('div');
        dropdown.classList.add('mytable-dropdown');
        dropdown.style.display = 'none';

        // Пункт "Вставить фото"
        const insertImgItem = document.createElement('div');
        insertImgItem.innerText = 'Вставить фото';
        insertImgItem.classList.add('mytable-dropdown-item');
        insertImgItem.addEventListener('click', () => {
            const url = prompt('Введите URL картинки');
            if (url) {
                // Заменяем контент ячейки на <img>
                const cellDiv = cell.querySelector('.cell-div');
                if (cellDiv) {
                    cellDiv.innerHTML = `<img src="${url}" alt="cell-img" />`;
                }
            }
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(insertImgItem);

        // Добавляем логику открытия/закрытия
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (evt) => {
            if (!cell.contains(evt.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Стилизация позиции
        cell.style.position = 'relative';
        plusBtn.style.position = 'absolute';
        plusBtn.style.top = '4px';
        plusBtn.style.right = '4px';

        dropdown.style.position = 'absolute';
        dropdown.style.top = '28px';
        dropdown.style.right = '4px';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.background = '#fff';
        dropdown.style.padding = '4px 8px';
        dropdown.style.zIndex = '1000';

        cell.appendChild(plusBtn);
        cell.appendChild(dropdown);
    }

    /**
     * EditorJS вызывает save(), когда нужно сохранить данные блока
     * Мы пробегаем все ячейки, смотрим, что в них — текст или <img>
     */
    save(blockContent) {
        // Находим все <tr>
        const rows = blockContent.querySelectorAll('tr');
        const content = [];

        rows.forEach((tr) => {
            const rowData = [];
            const cells = tr.querySelectorAll('td');
            cells.forEach((td) => {
                const cellDiv = td.querySelector('.cell-div');
                if (!cellDiv) {
                    // Если ячейки нет, создаём пустой параграф
                    rowData.push({
                        type: 'paragraph',
                        data: { text: '' },
                    });
                    return;
                }
                const img = cellDiv.querySelector('img');
                if (img) {
                    // Сохраняем как блок типа image
                    rowData.push({
                        type: 'image',
                        data: {
                            file: { url: img.src },
                        },
                    });
                } else {
                    // Сохраняем как параграф
                    rowData.push({
                        type: 'paragraph',
                        data: {
                            text: cellDiv.innerHTML.trim(),
                        },
                    });
                }
            });
            content.push(rowData);
        });

        return { content };
    }

    /**
     * Валидация данных — есть ли хотя бы одна строка
     */
    validate(savedData) {
        if (!savedData || !savedData.content || !savedData.content.length) {
            return false;
        }
        return true;
    }
}
