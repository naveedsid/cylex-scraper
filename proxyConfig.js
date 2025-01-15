const qs = require('querystring');
const rp = require('request-promise');

const apiKey = 'YOUR_API_KEY_FROM_SCRAPEOPS.IO';
const baseProxyUrl = 'https://proxy.scrapeops.io/v1/';

async function fetchWithProxy(url) {
    if (!url) {
        throw new Error('URL is required for fetching with proxy.');
    }

    const proxyParams = {
        api_key: apiKey,
        url: url
    };
    const proxyUrl = baseProxyUrl + '?' + qs.stringify(proxyParams);

    const requestOptions = {
        uri: proxyUrl,
        timeout: 120000
    };

    // Return the response
    const response = await rp(requestOptions);
    return response; // Return plain HTML response
}

module.exports = { fetchWithProxy };

