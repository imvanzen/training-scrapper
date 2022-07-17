const puppeteer = require('puppeteer')
const Webflow = require('webflow-api');
require('dotenv').config();

async function scrape() {
    const browser = await puppeteer.launch({})
    const page = await browser.newPage()

    try {
        console.log('Browser opened')
        console.log('Get page')
        await page.goto(process.env.SOURCE_WEBSITE)
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
    const webflow = new Webflow({
        token: process.env.WEBFLOW_API_TOKEN,
    });
    webflow.info().then((info) => console.log(info));
}

async function run() {
    const scrapedSet = await scrape()
    await update(scrapedSet)
}

run()