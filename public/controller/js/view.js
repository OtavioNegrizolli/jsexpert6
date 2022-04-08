
export default class View {

    constructor() {
        this.btn_start = document.getElementById('start');
        this.btn_stop = document.getElementById('stop');

        this.ignoreButtons = new Set(['unassigned']);

        this.buttons = () => Array.from(document.querySelectorAll('button'));

        async function onBtnClick() { }
        this.onBtnClick = onBtnClick;
    }

    onLoad() {
        this.changeCommandButtonsVisibility()
        this.btn_start.onclick = this.onStartClicked.bind(this);
    }

    changeCommandButtonsVisibility(hide = true) {
        Array.from(document.querySelectorAll('[name=command]')).forEach( (btn) =>
        {
            const fn = hide? 'add': 'remove';
            btn.classList[fn]('unassigned');
            function onClickReset() {}
            btn.onclick = onClickReset;
        });
    }

    configureOnBtnClick(fn) {
        this.onBtnClick = fn;
    }

    async onStartClicked({
        srcElement: {
            innerText
        }
    }) {
        const btnText = innerText;
        await this.onBtnClick(btnText);
        this.toggleStreamButton(true);
        this.changeCommandButtonsVisibility(false);
        this.buttons().filter(
            btn => this.notIsUnassignedButton(btn)
        )
        .forEach(
            this.setupBtnAction.bind(this)
        );
    }

    setupBtnAction(btn) {
        const text = btn.innerText.toLowerCase();
        if (text.includes('start')) return;

        if (text.includes('stop'))
            btn.onclick = this.onStopBtn.bind(this);
        else
            btn.onclick = this.onCommandClick.bind(this);
    }

    async onCommandClick(btn) {
        const { srcElement: {
            classList,
            innerText
        }} = btn;

        await this.onBtnClick(innerText);
    }

    onStopBtn({
        srcElement: {
            innerText
        }
    }) {
        this.toggleStreamButton(false);
        this.changeCommandButtonsVisibility();
        return this.onBtnClick(innerText);
    }

    notIsUnassignedButton(btn) {
        const classList= Array.from(btn.classList);
        return !(!!classList.find(buttonCssClass => this.ignoreButtons.has(buttonCssClass)));
    }

    toggleStreamButton(active) {
        if (active) {
            this.btn_start.classList.add('hidden');
            this.btn_stop.classList.remove('hidden');
        }
        else
        {
            this.btn_stop.classList.add('hidden');
            this.btn_start.classList.remove('hidden');
        }
    }
}
