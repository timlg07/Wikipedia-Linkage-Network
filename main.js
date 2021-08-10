const fs = require('fs')
const puppeteer = require('puppeteer')
const {Network} = require('vis-network')
const wikiurl = require('./wikiurl.js')
const config = require('./config.json')
const titles = require('./titles.json')

;(async function main() {
    const browser = await puppeteer.launch(config.browserconfig)
    const page = await browser.newPage()
    const data = await fetchNetwork(page, 'de')
    await browser.close()

    fs.writeFile(
        "result.json",
        JSON.stringify(data, null, 4),
        'utf8',
        err => { if(err) throw err }
    )
})()

async function fetchNetwork(page, language) {
    const titleCombinations = {}
    for (let title of titles[language]) {
        const url = wikiurl.getUrl(language, title)
        await page.goto(url)
        const wikirefQuery = `#mw-content-text a[href^='/wiki/']` // use #bodyContent to include categories at the footer as well
        const hrefs = await page.$$eval(wikirefQuery, elements => {
            const res = []
            elements.forEach(a => void res.push(a.href))
            return res
        })
        const linkedTitles = hrefs
                .map(wikiurl.getTitle) // Parse url to title of the Wikipedia page
                .filter(t => !t.includes(':')) // Filter out Wikipedia:, Datei:, Benutzer:, Hilfe:, and similar Links
        titleCombinations[title] = linkedTitles
    }
    return titleCombinations
}