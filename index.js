const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function crawlWebsites(parameters) {
    const primaryCategory = parameters["Primary Category"] || "";
    const secondaryCategory = parameters["Secondary Category"] || "";
    const geography = parameters["Geography"] || "";
    const dateRange = parameters["Date Range"] || "";

    // Construct the search query based on input parameters
    const searchQuery = `${primaryCategory} ${secondaryCategory} ${geography} ${dateRange}`;

    // Use a search engine (e.g., Google) to perform the search
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    try {
        // Send an HTTP request to get the search results
        const response = await axios.get(searchUrl);

        // Parse the HTML content of the page
        const $ = cheerio.load(response.data);

        // Extract URLs from the search results
        const urls = [];
        $('a[href^="/url?q="]').each((index, element) => {
            const url = $(element).attr('href').replace('/url?q=', '');
            urls.push(url);
        });

        // Create CSV file with the URLs
        const outputFilename = 'output_urls.csv';
        const stream = fs.createWriteStream(outputFilename);
        const csvWriter = require('csv-writer').createObjectCsvWriter({
            path: outputFilename,
            header: [
                { id: 'URL', title: 'URL' },
                { id: 'Primary Category', title: 'Primary Category' },
                { id: 'Secondary Category', title: 'Secondary Category' },
                { id: 'Geography', title: 'Geography' },
                { id: 'Date Range', title: 'Date Range' }
            ]
        });

        // Write each URL along with the provided parameters
        const records = urls.map(url => ({
            URL: url,
            'Primary Category': primaryCategory,
            'Secondary Category': secondaryCategory,
            'Geography': geography,
            'Date Range': dateRange
        }));

        await csvWriter.writeRecords(records);
        console.log(`URLs successfully crawled and saved to ${outputFilename}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Example usage with a JSON object
const parameters = {
    "Primary Category": "Medical Journal",
    "Secondary Category": "Orthopedic",
    "Geography": "US",
    "Date Range": "2022"
};

crawlWebsites(parameters);
