export default class Service {

    constructor({ url }) {
        this.url = url;
    }

    async makeRequest(data) {
        console.log(data);
        const result = await fetch(this.url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result.json();
    }
}
