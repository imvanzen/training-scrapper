const puppeteer = require('puppeteer')
const Webflow = require('webflow-api');
require('dotenv').config();

async function scrape() {
    const browser = await puppeteer.launch({})
    const page = await browser.newPage()

    try {
        console.log('Browser opened')
        console.log('Get page')
        await page.goto('https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/szukaj?nazwaUslugi=&identyfikatorProjektu=&rodzaj=&formaSwiadczenia=&kkz=0&kkzLista=&kuz=0&kuzLista=&nabycieKwalifikacji=0&kategoria=&dataRozpoczeciaUslugi=&dataZakonczeniaUslugi=&ocena=0%2C5&cenaZaGodzine=0&cenaBruttoZaUslugeOd=&cenaBruttoZaUslugeDo=&cenaBruttoOd=&cenaBruttoDo=&mozliwoscDofinansowania=0&miejsceSzkolenia=&miejscowoscId=&promienZasiegu=15&dostawcyUslug=&dostawcyUslug%5B%5D=126910&per-page=100&order=score')
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