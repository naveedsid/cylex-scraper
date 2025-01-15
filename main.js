const { fetchWithProxy } = require('./proxyConfig');
const { calculateResults, getListingLinksSinglePage, scrapeSingleList } = require('./scrapeFunctions');
const { appendDataToCSV } = require('./csvWriter');

const path = require('path'); // For handling file paths

async function scrapeMultiplePages(url, no_of_pages) {
    try {
        const { currentPage, totalPages, totalRecords } = await calculateResults(url);
        console.log(`Current Page: ${currentPage}, Total Pages: ${totalPages}, Total Records: ${totalRecords}`);

        const scrapedDataFilePath = path.join(__dirname, 'scraped_data.csv'); // CSV file path

        let currentUrl = url;

        for (let page = 0; page < no_of_pages; page++) {
            console.log(`Scraping page ${currentPage + page}...`);

            const singlePageLinksList = await getListingLinksSinglePage(currentUrl);
            console.log(`Found ${singlePageLinksList.length} links on page ${currentPage + page}.`);

            for (const link of singlePageLinksList) {
                try {
                    const details = await scrapeSingleList(link);
                    
                    // Append each scraped detail to CSV
                    appendDataToCSV(scrapedDataFilePath, [details]);
                    console.log(`Scraped and saved details for: ${link}`);
                } catch (err) {
                    console.error(`Error scraping link ${link}:`, err.message);
                }
            }

            // Update the URL for the next page
            const nextPage = currentPage + page + 1;
            currentUrl = url.replace(/p=\d+/, `p=${nextPage}`);
        }

        console.log("Scraping complete.");
    } catch (error) {
        console.error("Error in scrapeMultiplePages:", error.message);
    }
}
module.exports = { scrapeMultiplePages };
// (async () => {
//     try {
//         await scrapeMultiplePages('https://www.cylex.us.com/s?q=&c=Port%20Angeles&z=9836&p=10&dst=&sUrl=&cUrl=port-angeles&hw=1', 2);
//     } catch (error) {
//         console.error("Error occurred while scraping:", error);
//     }
// })();
