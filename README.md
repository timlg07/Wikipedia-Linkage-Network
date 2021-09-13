# Wikipedia Linkage Network

Visualizes the linkage between a set of given Wikipedia pages as a graph.

Demo of a network: [tim-greller.de/data/wikinet](https://tim-greller.de/data/wikinet/)

## Usage

### 1. Install dependencies:
```
npm ci
```

### 2. Provide the titles and languages of the Wikipedia pages you want to analyze:
The JSON file [`titles.json`](./titles.json) should contain an object where:
 - the keys are Wikipedia language codes such as `en`
 - the values are arrays containing the titles of the Wikipedia pages
 
### 3. Start the script
```
npm start
```
This will execute a NodeJS process which will use puppeteer to fetch all links of the given Wikipedia pages and then writes the result to the [`result.json`](./result.json) and [`network.json`](./network.json) files.
After this, the `index.html` will be served and is available at a localhost address. If you go to this local address, the network graph will be generated and rendered in your browser.
