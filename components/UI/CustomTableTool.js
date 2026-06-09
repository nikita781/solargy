
export default class MyCustomTableTool {
    static get toolbox() {
        return {
            title: 'Моя Таблица',
            icon: '<svg width="17" height="18" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M15 5H2C1.44772 5 1 4.55228 1 4V2C1 1.44772 1.44772 1 2 1H15C15.5523 1 16 1.44772 16 2V4C16 4.55228 15.5523 5 15 5Z"/><path fill="currentColor" d="M15 10H2C1.44772 10 1 9.55228 1 9V7C1 6.44772 1.44772 6 2 6H15C15.5523 6 16 6.44772 16 7V9C16 9.55228 15.5523 10 15 10Z"/><path fill="currentColor" d="M15 15H2C1.44772 15 1 14.5523 1 14V12C1 11.4477 1.44772 11 2 11H15C15.5523 11 16 11.4477 16 12V14C16 14.5523 15.5523 15 15 15Z"/></svg>',
        };
    }

    constructor({ data, api, config }) {
        this.api = api;
        this._data = data || {};

        this.rows = this._data.content ? this._data.content.length : (config?.rows || 2);
        this.cols = this._data.content ? this._data.content[0].length : (config?.cols || 2);

        this._content = this._data.content || this._createEmptyTable(this.rows, this.cols);
    }

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

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('mycustom-table-wrapper');

        this.table = document.createElement('table');
        this.table.classList.add('mycustom-table');

        this._content.forEach((rowData, rowIndex) => {
            const tr = document.createElement('tr');

            rowData.forEach((cellData, colIndex) => {
                const td = document.createElement('td');
                td.classList.add('mycustom-table-cell');

                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell-div');
                cellDiv.contentEditable = true;

                if (cellData.type === 'image' && cellData.data?.file?.url) {
                    cellDiv.innerHTML = `<img src="${cellData.data.file.url}" alt="cell-img" />`;
                } else {
                    cellDiv.innerHTML = cellData.data?.text || '';
                }

                this.addPlusButton(td);

                td.appendChild(cellDiv);
                tr.appendChild(td);
            });

            this.table.appendChild(tr);
        });

        this.wrapper.appendChild(this.table);
        return this.wrapper;
    }

    addPlusButton(cell) {
        const plusBtn = document.createElement('button');
        plusBtn.innerText = '+';
        plusBtn.classList.add('mytable-plus-btn');

        const dropdown = document.createElement('div');
        dropdown.classList.add('mytable-dropdown');
        dropdown.style.display = 'none';

        const insertImgItem = document.createElement('div');
        insertImgItem.innerText = 'Вставить фото';
        insertImgItem.classList.add('mytable-dropdown-item');
        insertImgItem.addEventListener('click', () => {
            const url = prompt('Введите URL картинки');
            if (url) {
                const cellDiv = cell.querySelector('.cell-div');
                if (cellDiv) {
                    cellDiv.innerHTML = `<img src="${url}" alt="cell-img" />`;
                }
            }
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(insertImgItem);

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (evt) => {
            if (!cell.contains(evt.target)) {
                dropdown.style.display = 'none';
            }
        });

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

    save(blockContent) {
        const rows = blockContent.querySelectorAll('tr');
        const content = [];

        rows.forEach((tr) => {
            const rowData = [];
            const cells = tr.querySelectorAll('td');
            cells.forEach((td) => {
                const cellDiv = td.querySelector('.cell-div');
                if (!cellDiv) {
                    rowData.push({
                        type: 'paragraph',
                        data: { text: '' },
                    });
                    return;
                }
                const img = cellDiv.querySelector('img');
                if (img) {
                    rowData.push({
                        type: 'image',
                        data: {
                            file: { url: img.src },
                        },
                    });
                } else {
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

    validate(savedData) {
        if (!savedData || !savedData.content || !savedData.content.length) {
            return false;
        }
        return true;
    }
}
