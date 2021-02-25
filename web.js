const fs = require('fs');
const puppeteer = require('puppeteer');

function extractItems() {
  const extractedElements = document.querySelector("#products-container").childNodes;
  const items = [];
  for (let element of extractedElements) {
    items.push(element.innerText);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch(e) { }
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  // Navigate to the demo page.
  await page.goto('https://dutchie.com/dispensaries/spiritleaf-stittsville/menu/?sortBy=brand');

  // Scroll and extract items from the page.
  const items = await scrapeInfiniteScrollItems(page, extractItems, 100000);

  // Save extracted items to a file.
  //fs.writeFileSync('./dutc.txt', items.join('\n') + '\n');
  fs.writeFile('dutchie.json',JSON.stringify(items, null, 2),(err)=>{
    if(err){console.log(err)}
    else{console.log('Saved Successfully!')}
})
  // Close the browser.
  await browser.close();
})();