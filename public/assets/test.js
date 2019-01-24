var data = [{ "count": 8, "dayMonth": "11.1", "type": "9050" }, { "count": 22, "dayMonth": "14.1", "type": "9050" }, { "count": 22, "dayMonth": "15.1", "type": "9050" }, { "count": 46, "dayMonth": "16.1", "type": "9050" }, { "count": 32, "dayMonth": "17.1", "type": "9050" }, { "count": 30, "dayMonth": "18.1", "type": "9050" }, { "count": 32, "dayMonth": "21.1", "type": "9050" }, { "count": 27, "dayMonth": "22.1", "type": "9050" }, { "count": 43, "dayMonth": "23.1", "type": "9050" }, { "count": 22, "dayMonth": "24.1", "type": "9050" }, { "count": 26, "dayMonth": "11.1", "type": "9210" }, { "count": 56, "dayMonth": "14.1", "type": "9210" }, { "count": 50, "dayMonth": "15.1", "type": "9210" }, { "count": 38, "dayMonth": "16.1", "type": "9210" }, { "count": 57, "dayMonth": "17.1", "type": "9210" }, { "count": 53, "dayMonth": "18.1", "type": "9210" }, { "count": 54, "dayMonth": "21.1", "type": "9210" }, { "count": 75, "dayMonth": "22.1", "type": "9210" }, { "count": 56, "dayMonth": "23.1", "type": "9210" }, { "count": 24, "dayMonth": "24.1", "type": "9210" }];


var today = new Date();
today.getDate();
today.getMonth();

const labels = [];
const datasets = [
    {
        label: 'Ordens de Venda',
        backgroundColor: mUtil.getColor('success'),
        data: [],
    },
    {
        label: 'Cotacoes',
        backgroundColor: '#f3f3fb',
        data: []
    }];

for (let index = 0; index < 12; index++) {
    const date = today.getDate() - index + '.' + today.getMonth();

    if (test = data.find(x => (x.dayMonth === date, x.type === '9210').count)) {
        datasets[0].data.push(test);
    } else {
        datasets[0].data.push(0);

    }
    if ((test = data.find(x => (x.dayMonth === date, x.type === "9050").count))) {
        datasets[1].data.push(test);
    } else {
        datasets[1].data.push(0);
    }
    labels.push(date.replace(/\./g, '/'))

}

const chartData = { labels, datasets };