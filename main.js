const fs = require('fs')
const puppeteer = require('puppeteer')
const wikiurl = require('./wikiurl.js')
const config = require('./config.json')
const titles = require('./titles.json')

async function main() {
    const browser = await puppeteer.launch(config.browserconfig)
    const page = await browser.newPage()
    const refs = await fetchRefData(page, 'de')
    const data = createDataSets(refs)
    await browser.close()

    save('result.json', refs)
    save('network.json', data)
}

async function fetchRefData(page, language) {
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

function createDataSets(refs) {
    const nodes = []
    const edges = []

    Object.keys(refs).forEach((t, i) => {
        nodes.push({
            id: i + 1,
            label: t
        })
    })
    
    for (const [title, reflist] of Object.entries(refs)) {
        const from = nodes.find(n => n.label === title)?.id
        const tos = reflist
                .map(t => nodes.find(n => n.label === t)?.id)
                .filter(t => t !== undefined)
        tos.forEach(to => void edges.push({from, to}))
    }

    console.log(nodes)
    console.log(edges)

    return {
        nodes: nodes,//new vis.DataSet(nodes),
        edges: edges//new vis.DataSet(edges)
    }
}

function save(filename, data) {
    fs.writeFile(
        filename,
        JSON.stringify(data, null, 4),
        'utf8',
        err => { if(err) throw err }
    )
}

main()