// scraperFunctions.js
const cheerio = require('cheerio');
const { fetchWithProxy } = require('./proxyConfig');










function decodeCloudflareEmail(encodedEmail) {
    const decodedEmail = [];
    const r = parseInt(encodedEmail.substr(0, 2), 16); // First 2 chars (hex) is the key

    for (let n = 2; n < encodedEmail.length; n += 2) {
        const code = parseInt(encodedEmail.substr(n, 2), 16) ^ r; // XOR with the key
        decodedEmail.push(String.fromCharCode(code)); // Convert to character
    }

    return decodedEmail.join(''); // Join the characters to form the email
}

















// Function to calculate the results based on the HTML content
async function calculateResults(url) {
    try {
        const htmlContent = await fetchWithProxy(url); // Fetch the page content
        const $ = cheerio.load(htmlContent); // Load HTML into Cheerio

        const resultsSpan = $('div.lm-h').find('span.bold.text-muted').text().trim();
        if (!resultsSpan) {
            throw new Error("Results information not found in the provided content.");
        }

        const match = resultsSpan.match(/Results (\d+) - (\d+) of (\d+)/);
        if (!match) {
            throw new Error("Unable to parse results span text.");
        }

        const [_, start, end, total] = match.map(Number); // Convert all matched groups to numbers
        const recordsPerPage = end - start + 1;
        const totalPages = Math.ceil(total / recordsPerPage);
        const currentPage = Math.ceil(end / recordsPerPage);

        return {
            currentPage,
            totalPages,
            totalRecords: total
        };
    } catch (error) {
        console.error("Error calculating results:", error);
        throw error;
    }
}















async function getListingLinksSinglePage(url) {
    try {
        // Fetch the HTML content using the proxy
        const response = await fetchWithProxy(url);
        const $ = cheerio.load(response); // Load the HTML into Cheerio

        // Extract listing links
        const listingLinks = [];
        $('div.lm-comp').each((i, el) => {
            const listLink = $(el).find('div.h4 a').attr('href');
            if (listLink) {
                listingLinks.push(listLink);
            }
        });

        return listingLinks; // Return the array of links
    } catch (error) {
        console.error('Error fetching or processing the page:', error.message);
        return []; // Return an empty array on error
    }
}


















async function scrapeSingleList(url) {
    const response = await fetchWithProxy(url); // Await the response
    const $ = cheerio.load(response); // Load the HTML into Cheerio

    // Extracting elements, adding empty strings if not found
    const name_w_address = $('h1#address').text().trim() || "";
    const no_of_reviews = $('div#profile-aggregate-rating span.avg').text() || "";
    const only_name = $('div#cp-name').text().trim() || "";
    const website_link = $('div#cp-website a').attr('href') || "";
    const starsCount = $('div#profile-aggregate-rating span.stars-container i.fas').length || 0;
    const complete_address = $('div#cp-street').text().trim() || "";
    const phoneNumber = $('div#cp-mainPhone-1 div.contact-data a.text-underline').text().trim() || "";
    const officeNumber = $('div#cp-mainPhone-2 div.contact-data a.text-underline').text().trim() || "";
    const website = $('div#cp-website div.contact-data-container a.text-underline').text().trim() || "";
    const encodedEmail = $('span.__cf_email__').attr('data-cfemail') || "";
    const email = encodedEmail ? decodeCloudflareEmail(encodedEmail) : "";
    const imageAddress = $('div#company-logo-container img.company-logo').attr('src') || "";

    const owner_verified_img = $('div#Special-Offer + div.row img').attr('src');
    const owner_verified_status = owner_verified_img === "https://www.yextstatic.com/cms/pl-synced/pl-synced.png" ? "Yes" : "No";

    const description = $('div#description + div.mx-lg-5 p.columns').text().trim() || "";

    const catnkeywords = [];
    $('#ulkw li.kw span').each((index, element) => {
        catnkeywords.push($(element).text().trim());
    });
    if (catnkeywords.length === 0) catnkeywords.push(""); // Ensure key is added even if array is empty

    const languages = [];
    $('#ullng li.lng span').each((index, element) => {
        const language = $(element).text().trim();
        languages.push(language);
    });
    if (languages.length === 0) languages.push(""); // Ensure key is added even if array is empty

    const paymentMethods = [];
    $('ul.list-unstyled li').each((index, element) => {
        const paymentMethod = $(element).find('small.d-block').text().trim();
        if (paymentMethod) { paymentMethods.push(paymentMethod); }
    });
    if (paymentMethods.length === 0) paymentMethods.push(""); // Ensure key is added even if array is empty

    // Returning the data as a dictionary (object)
    const listingData = {
        name_w_address,
        no_of_reviews,
        only_name,
        website_link,
        starsCount,
        complete_address,
        phoneNumber,
        officeNumber,
        website,
        email,
        imageAddress,
        owner_verified_status,
        description,
        catnkeywords,
        languages,
        paymentMethods
    };

    return listingData;
}




















(async () => {
    try {
        // mylist = await  getListingLinksSinglePage('https://www.cylex.us.com/s?q=&c=Port%20Angeles&z=9836&p=10&dst=&sUrl=&cUrl=port-angeles&hw=1');
        // console.log(mylist);

        // mylist = await  scrapeSingleList('https://www.cylex.us.com/company/holiday-inn-express-new-york-city---chelsea--an-ihg-hotel-25142027.html');
        // console.log(mylist);
        
        // const result = await calculateResults('https://www.cylex.us.com/s?q=&c=Port%20Angeles&z=9836&p=10&dst=&sUrl=&cUrl=port-angeles&hw=1');
        // console.log(result.currentPage);

    } catch (error) {
        console.error("Error occurred while scraping:", error);
    }
})();

module.exports = { calculateResults, getListingLinksSinglePage, scrapeSingleList };
