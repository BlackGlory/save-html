browser.browserAction.onClicked.addListener(async tab => {
  const tabId = tab.id!
  const html = await getHTML(tabId)
  const title = await getTitle(tabId)
  const blob = htmlToBlob(html)
  const url = URL.createObjectURL(blob)
  try {
    await browser.downloads.download({
      url
    , filename: title ? `${title}.html` : undefined
    , saveAs: true
    })
  } finally {
    URL.revokeObjectURL(url)
  }
})

function getHTML(tabId: number): Promise<string> {
  return evaluate<string>(tabId, `
    (() => {
      // https://github.com/puppeteer/puppeteer/blob/d8932ca18722cb97811577277e4d7e3add250d10/src/common/DOMWorld.ts#L226-L231
      let retVal = ''
      if (document.doctype) {
        retVal = new XMLSerializer().serializeToString(document.doctype)
      }
      if (document.documentElement) {
        retVal += document.documentElement.outerHTML
      }
      return retVal
    })()
  `)
}

function getTitle(tabId: number): Promise<string> {
  return evaluate<string>(tabId, 'document.title')
}

async function evaluate<T>(tabId: number, code: string): Promise<T> {
  const results = await browser.tabs.executeScript(tabId, { code })
  return results[0]
}

function htmlToBlob(html: string): Blob {
  return new Blob([html], { type: 'text/html' })
}
