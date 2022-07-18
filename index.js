const puppeteer = require('puppeteer')
const Webflow = require('webflow-api');
require('dotenv').config();

const SOURCE_WEBSITE = process.env.SOURCE_WEBSITE;
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const WEBFLOW_WEBSITE_ID = process.env.WEBFLOW_WEBSITE_ID;
const WEBFLOW_TRAINING_COLLECTION_ID = process.env.WEBFLOW_TRAINING_COLLECTION_ID;
const WEBFLOW_CATEGORIES_COLLECTION_ID = process.env.WEBFLOW_CATEGORIES_COLLECTION_ID;

const webflow = new Webflow({
    token: WEBFLOW_API_TOKEN,
})

async function scrape() {
    const browser = await puppeteer.launch({})
    const page = await browser.newPage()

    try {
        console.log('Browser opened')
        console.log('Get page')
        await page.goto(SOURCE_WEBSITE)
        console.log('Looking for selector')
        const element = await page.waitForSelector('#wyniki-dostawcow')
        console.log('Looking for trainings')
        let scrappedSet = await page.evaluate(element => {
            const trainings = element.querySelectorAll('[data-key]')
            return [...trainings].map(training => {
                const id = training.dataset.key
                const header = training.querySelector('.service-card-header ').innerText;
                const category = training.querySelector('.service-card-footer > div:nth-child(2)').childNodes[3].childNodes[3].innerText;
                const dateframe = training.querySelector('.service-card-footer > div:nth-child(4)').childNodes[3].innerText;
                const link = training.querySelector('.service-card > div > div:nth-child(2) > div > div > a:nth-child(1)').href
                return { id, header, category, dateframe, link }
            });
        }, element)
        console.log('Found trainings %o', scrappedSet)
        return scrappedSet
    } catch (error) {
        console.error('Unexpected error %s, %j', error, error)
    } finally {
        browser.close()
        console.log('Browser closed')
    }
}

async function update(data) {
    const response = await webflow.get(`/collections/${WEBFLOW_TRAINING_COLLECTION_ID}/items`)
    console.log(`/sites/${WEBFLOW_WEBSITE_ID}/collections %o`, response)
    return
}

async function run() {
    // const scrapedSet = await scrape()
    await update()

    // Source data
    // - Scrape the content
    // - Pull values from content
    // - Sanitize content

    // Modify collection
    // - Pull collection items from website
    // - Match collection items by key
    // - Filter new collection items
    // - Filter collection items to update
    // - Filter collection items to archive
    // - Add new collection items
    // - Update existing collection items
    // - Archive expired or not existing collections
}

try {
    run()
} catch (error) {
    console.error('Unexpected error %s, %j', error, error)
} finally {
}