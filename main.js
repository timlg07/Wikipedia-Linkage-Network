const fs = require('fs')
const puppeteer = require('puppeteer')
const wikiurl = require('./wikiurl.js')
const config = require('./config.json')
const titles = require('./titles.json')

async function main() {
    const browser = await puppeteer.launch(config.browserconfig)
    const page = await browser.newPage()
    const refs = await fetchRefData(page)
    const data = createDataSets(refs)
    await browser.close()

    save('result.json', refs)
    save('network.json', data)
}

async function fetchRefData(page) {
    const titleCombinations = {}
    for (let language in titles) {
        for (let title of titles[language]) {
            const url = wikiurl.getUrl(language, title)
            const key = getWrappedTitle(getDisplayTitle(language, title))
            const out = await getLinkedTitles(url, page)
            titleCombinations[key] = out.map(getWrappedTitle)
        }
    }
    return titleCombinations
}

async function getLinkedTitles(url, page) {
    await page.goto(url)
    const wikirefQuery = `#mw-content-text a[href^='/wiki/']` // use #bodyContent to include categories at the footer as well
    const hrefs = await page.$$eval(wikirefQuery, elements => {
        const res = []
        elements.forEach(a => void res.push(a.href))
        return res
    })

    return (hrefs 
            // Parse url to title of the Wikipedia page
            .map(url => getDisplayTitle(
                wikiurl.getLang(url),
                wikiurl.getTitle(url)
            )) 
            // Filter out Wikipedia:, Datei:, Benutzer:, Hilfe:, and similar Links
            .filter(t => !t.includes(':'))
    )
}

function getDisplayTitle(language, title) {
    return `${title} [${language}]`
}

function getWrappedTitle(displayTitle, characterWrap = 10) {
    return displayTitle
    const words = displayTitle.split(/\s+/)
    const lines = []
    let currentLine = ''

    for (let word of words) {
        const wordParts = word.split('-')
        const lastIndex = wordParts.length - 1
        for (let i in wordParts) {
            currentLine += wordParts[i] + (i < lastIndex ? '-' : '')
            if (currentLine.length >= characterWrap) {
                lines.push(currentLine)
                currentLine = ''
            } 
        }
        currentLine += currentLine ? ' ' : ''
    }

    currentLine = currentLine.trim()
    if (currentLine) lines.push(currentLine)

    return lines.join('\n')
}

function createDataSets(refs) {
    const nodes = []
    const edges = []

    Object.keys(refs).forEach((t, i) => {
        nodes.push({
            id: i + 1,
            label: t,
            value: 1
        })
    })
    
    for (const [title, reflist] of Object.entries(refs)) {
        const from = nodes.find(n => n.label === title)?.id
        reflist
            .map(to => nodes.find(n => n.label === to)?.id)
            .filter(to => !!to)
            .forEach(to => {
                const edge = edges.find(e => e.from === from && e.to === to)
                if (edge) {
                    edge.value++
                } else {
                    edges.push({from, to, value: 1})
                }
            })
    }

    // set node values:
    edges.forEach(edge => nodes[edge.to - 1].value += edge.value)

    return {
        nodes: nodes,
        edges: edges
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