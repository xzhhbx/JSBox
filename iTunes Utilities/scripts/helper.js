function getIcon(item) {
  showDownloading()
  if ($app.env == $env.action) {
    savePic(item.artworkUrl100.replaceAll("100x100", "1024x1024")).then(function (data) {
      if (data) {
        $ui.toast("Saved Success!", 1)
        delayClose(0.6)
      }
    })
  } else {
    $quicklook.open({ url: item.artworkUrl100.replaceAll("100x100", "1024x1024") })
  }
}

async function getScreenshots(item) {
  showDownloading()
  $ui.loading(true)
  if ($app.env == $env.action) {
    let url_list = item.screenshotUrls.map(function (url) {
      return url.replaceAll(/\d+x\d+/, "2400x2400")
    })
    for(let i=0; i<url_list.length; i++) {
      await savePic(url_list[i]).then(function(data){
        if (data && i == url_list.length - 1) {
          $ui.loading(false)
          $ui.toast("Saved Success!", 1)
          delayClose(0.6)
        }
      })
    }
  } else {
    $quicklook.open({
      list: item.screenshotUrls.map(function (url) {
        return url.replaceAll(/\d+x\d+/, "2400x2400")
      })
    })
  }
}

async function getIpadScreenshots(item) {
  showDownloading()
  $ui.loading(true)
  if ($app.env == $env.action) {
    let url_list = item.ipadScreenshotUrls.map(function (url) {
      return url.replaceAll(/\d+x\d+/, "2400x2400")
    })
    for (let i = 0; i < url_list.length; i++) {
      await savePic(url_list[i]).then(function (data) {
        if (data && i == url_list.length - 1) {
          $ui.loading(false)
          $ui.toast("Saved Success!", 1)
          delayClose(0.6)
        }
      })
    }
  } else {
    $quicklook.open({
      list: item.ipadScreenshotUrls.map(function (url) {
        return url.replaceAll(/\d+x\d+/, "2400x2400")
      })
    })
  }
}

function getTodayWallpaper(url) {
  showDownloading()
  if ($app.env == $env.action) {
    savePic(url.replace(/\d+x\d+\.jpg/, "5000x5000.jpg")).then(function (data) {
      if (data) {
        $ui.toast("Saved Success!", 1)
        delayClose(0.6)
      }
    })
  } else {
    $quicklook.open({ url: url.replace(/\d+x\d+\.jpg/, "5000x5000.jpg") })
  }
}

function savePic(link) {
  let p = new Promise(function (resolve, reject) {
    $http.download({
      url: link,
      handler: function (resp) {
        $photo.save({
          data: resp.data,
          handler: function (success) {
            if (success) {
              resolve("success")
            } else {
              $ui.error("Saved Failed! Try Again.", 1)
              reject(false)
            }
          }
        })
      }
    })
  })
  return p
}

function shareMedia(item) {
  showDownloading()
  $ui.loading(true)
  $http.download({
    url: item.artworkUrl100.replaceAll("100x100", "1024x1024"),
    handler: function (resp) {
      $ui.loading(false)
      let description = ""
      let status = "Listening"
      if (item.kind && item.kind.match(/movie/)) {
        status = "Watching"
      }
      if (item.collectionType && item.collectionType.match(/Album/i)) {
        description = `${status}「${item.collectionName}」by「${item.artistName}」- iTunes Store ${item.collectionViewUrl}`
      } else {
        description = `${status}「${item.trackName}」by「${item.artistName}」- iTunes Store ${item.trackViewUrl}`
      }
      $share.sheet({
        item: [resp.data, description],
        handler: function (success) {
          if (success) {
            delayClose(0.6)
          }
        }
      })
    }
  })
}

function showPreview(item, country) {
  let preview = require('scripts/preview')
  preview.init(item, country)
}

function showVersionID(item) {
  let version = require('scripts/version')
  version.init(item)
}

function translateDetail(item) {
  let translate = require('scripts/translate')
  translate.init(item)
}

function showDetails(item) {
  require("scripts/detail").show(item)
}

function openAppStore(country, item) {
  $app.openURL(`https://itunes.apple.com/${country.code}/app/id${item.trackId}`)
}

function openCollection(item) {
  $app.openURL(item.collectionViewUrl)
}

function openArtistView(item) {
  $app.openURL(item.artistViewUrl)
}

function openTrackView(item) {
  $app.openURL(item.trackViewUrl)
}

function openPreview(item) {
  $ui.loading(true)
  if ($app.env == $env.action && !item.previewUrl.match(/video\.itunes\.apple\.com.+\.m4v/)) {
    $quicklook.open({ url: item.previewUrl })
  } else {
    //$app.openURL(item.previewUrl)
    $safari.open({
      url: item.previewUrl,
      entersReader: false,
    })
  }
}

function showDownloading() {
  $ui.toast($l10n("DOWNLOADING"))
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function () {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
        //$app.close()
      }
    }
  })
}

module.exports = {
  getIcon: getIcon,
  getScreenshots: getScreenshots,
  getIpadScreenshots: getIpadScreenshots,
  getTodayWallpaper: getTodayWallpaper,
  translateDetail: translateDetail,
  showDetails: showDetails,
  showPreview: showPreview,
  showVersionID: showVersionID,
  shareMedia: shareMedia,
  openAppStore: openAppStore,
  openCollection: openCollection,
  openArtistView: openArtistView,
  openTrackView: openTrackView,
  openPreview: openPreview,
  delayClose: delayClose
}