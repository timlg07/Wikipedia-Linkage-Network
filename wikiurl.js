function getWikipediaUrl(language, title) {
    let encodedTitle = encodeURIComponent(
        title.replace(/ /g, '_') // Wikipedia uses '_' instead of %20
    )
    return `https://${language}.wikipedia.org/wiki/${encodedTitle}`
}

function getWikipediaTitle(url) {
    const encodedTitle = url.replace(/^.*\/wiki\//i, '')
    return decodeURIComponent(
        encodedTitle.replace(/_/g, ' ') // Wikipedia uses '_' instead of %20
    )
}

function getWikipediaLanguage(url) {
    return /https?:\/\/(..)\.wikipedia.*/.exec(url)[1]
}

module.exports = {
    getUrl: getWikipediaUrl,
    getTitle: getWikipediaTitle,
    getLang: getWikipediaLanguage
}