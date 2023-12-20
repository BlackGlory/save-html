import { assert, isntUndefined } from '@blackglory/prelude'
import { Base64 } from 'js-base64'

chrome.action.onClicked.addListener(async tab => {
  const tabId = tab.id!
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
    // https://github.com/puppeteer/puppeteer/blob/d8932ca18722cb97811577277e4d7e3add250d10/src/common/DOMWorld.ts#L226-L231
    let retVal = ''
    if (document.doctype) {
      retVal = new XMLSerializer().serializeToString(document.doctype)
    }
    if (document.documentElement) {
      retVal += document.documentElement.outerHTML
    }
    return retVal
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
  const banned = [
    /\\/mg
  , /\//mg
  , /\:/mg
  , /\*/mg
  , /\?/mg
  , /\"/mg
  , /\</mg
  , /\>/mg
  , /\|/mg
  , /\n/mg
  , /\~/mg
  ]
  return banned.reduce((ret, exp) => ret.replace(exp, replaceText), text)
}
