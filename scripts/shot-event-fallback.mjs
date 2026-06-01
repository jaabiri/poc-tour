import puppeteer from '../node_modules/.pnpm/puppeteer-core@23.11.1/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'

const URL = 'http://localhost:3000/actualites/agenda-a-la-une/rencontres-petite-enfance-2026'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SHOTS = [
  { name: 'fb-desktop-1280', width: 1280, height: 1000 },
  { name: 'fb-tablet-768', width: 768, height: 1100 },
  { name: 'fb-mobile-375', width: 375, height: 1200 },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})
try {
  for (const s of SHOTS) {
    const page = await browser.newPage()
    await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: 1 })
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
    // Désactive les animations pour une capture stable.
    await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' })
    await page.screenshot({ path: `scripts/${s.name}.png`, fullPage: true })
    console.log('OK', s.name)
    await page.close()
  }
} finally {
  await browser.close()
}
