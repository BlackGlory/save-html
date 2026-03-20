import { assert, isntUndefined } from '@blackglory/prelude'
import { Base64 } from 'js-base64'

chrome.action.onClicked.addListener(async tab => {
  const tabId = tab.id
  assert(isntUndefined(tabId), 'The tab id is undefined')

  const html = await getHTML(tabId)
  const title = await getTitle(tabId)
  const url = htmlToDataURL(html)
  const filename = title
                 ? convertToSafeFilename(`${title}.html`, ' ')
                 : undefined

  await chrome.downloads.download({
    url
  , filename
  , saveAs: true
  })
})

function getHTML(tabId: number): Promise<string> {
  return evalInTab<string>(tabId, () => {
    // https://github.com/puppeteer/puppeteer/blob/d68a7cf4b26d79e55760435fd0b742e2392d066f/packages/puppeteer-core/src/api/Frame.ts#L803-L815
    let content = ''

    for (const node of document.childNodes) {
      switch (node) {
        case document.documentElement: {
          content += document.documentElement.outerHTML

          break
        }
        default: {
          content += new XMLSerializer().serializeToString(node)
        }
      }
    }

    return content
  })
}

function getTitle(tabId: number): Promise<string> {
  return evalInTab<string>(tabId, () => document.title)
}

async function evalInTab<T>(tabId: number, fn: () => T): Promise<T> {
  const results = await chrome.scripting.executeScript({
    target: { tabId }
  , func: fn
  })

  const result = results[0].result
  assert(isntUndefined(result), 'The result is undefined')

  return result as T
}

function htmlToDataURL(html: string): string {
  return 'data:text/html;base64,' + Base64.encode(html)
}

function convertToSafeFilename(text: string, replaceText: string = '-') {
  const expressions = [
    /\\/g
  , /\//g
  , /\:/g
  , /\*/g
  , /\?/g
  , /\"/g
  , /\</g
  , /\>/g
  , /\|/g
  , /\s+/g
  , /\~/g
  ]

  return expressions
    .reduce((result, expression) => {
      return result.replace(expression, replaceText)
    }, text)
    .trim()
}
