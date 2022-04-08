export default class Controller
{
    constructor({view,  service})
    {
        this.view = view;
        this.serive = service;
    }

    static initialize(dependeces)
    {
        const controller  = new Controller(dependeces)
        controller.onLoad();
        return controller;
    }

    async commandReceived(text) {
        return this.serive.makeRequest({
            command: text
        });
    }

    onLoad() {
        this.view.configureOnBtnClick(this.commandReceived.bind(this))
        this.view.onLoad();
    }
}
