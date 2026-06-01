import puppeteer from '../node_modules/.pnpm/puppeteer-core@23.11.1/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 920, deviceScaleFactor: 1 })
await page.goto('http://localhost:3000/actualites/agenda-a-la-une/fete-de-la-biodiversite', {
  waitUntil: 'networkidle0',
  timeout: 90000,
})
await page.screenshot({ path: 'scripts/bio-hero.png', clip: { x: 0, y: 0, width: 1280, height: 920 } })
await browser.close()
console.log('OK')
