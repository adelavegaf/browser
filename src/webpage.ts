import puppeteer = require('puppeteer');

export class Webpage {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async generatePDF() {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(this.url, {waitUntil: 'networkidle2'});
    const pdf = await page.pdf({format: 'A4'});
    await browser.close();
    return pdf;
  }
}