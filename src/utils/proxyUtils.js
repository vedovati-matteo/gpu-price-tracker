// https://proxyscrape.com/free-proxy-list

async function getProxies() {
    const url = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=protocolipport&format=json';
    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return data.proxies.map(proxy => {
            return proxy.proxy;
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

module.exports = {
    getProxies
};