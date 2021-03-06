var Pinyin = require('scripts/Pinyin')
var listView_idList = []

function saveItem(id, data) {
  var allItems = $cache.get("messages")
  allItems[id] = data
  $cache.set("messages", allItems)
}

function getItem(id) {
  var allItems = $cache.get("messages")
  return allItems[id]
}

function deleteItem(allItems, item_id) {
  delete allItems[item_id]
  $cache.set("messages", allItems)
  $delay(0.3, function() {
    updateItem(allItems, "init")
  })
}

function sendItem(from, id_index, id_from_notify) {
  var item_id = ""
  if (from == "list") {
    item_id = listView_idList[id_index]
  } else {
    item_id = id_from_notify
  }
  var allItems = $cache.get("messages")
  var item = allItems[item_id]
  $message.sms({
    recipients: item.phonelist.split(","),
    body: item.message,
    handler: function(result) {
      if (result) {
        if (from == "list") {
          deleteNotify(item_id)
        }
        deleteItem(allItems, item_id)
      }
    }
  })
  
}

function searchItem(query) {
  function isContain(element) {
    var rex = query.split("").join(".*")
    var patt = new RegExp("[\u4e00-\u9fa5]")
    var temp = ""
    if (patt.test(query)) {
      temp = element
    } else {
      temp = Pinyin.ConvertPinyin(element)
    }
    return new RegExp(rex,"i").test(temp)
  }
  var allItems = $cache.get("messages")
  var matchIds = []
  for (key in allItems) {
    var content = allItems[key].receiver + " " + allItems[key].message
    if (isContain(content)) {
      matchIds.push(String(allItems[key].id))
    }
  }
  updateItem(allItems, "search", matchIds)
}

function updateItem(messages, status, id_list) {
  var temp = []
  var items_id = []
  if (status == "search") {
    items_id = id_list
  } else {
    for (id in messages) {
      if (messages.hasOwnProperty(id)) {
        items_id.push(id)
      }
    }
  }
  items_id.sort(sortNumber)
  listView_idList = items_id

  if (items_id.length > 0) {
    for (var i = 0; i < items_id.length; i++) {

      var item = messages[items_id[i]]
      temp.push({
        content_receiver: {
          text: "Receiver : " + item.receiver
        },
        content_date: {
          text: "Date : " + new Date(item.date).toLocaleString().replace(/\:00$/, "")
        },
        content_message: {
          text: "Message : " + item.message
        },
        tapArea: {
          title: items_id[i]
        }
      })
    }
  } else {
    if (status == "init") {
      temp = [{
        content_receiver: {
          text: "\n\n"
        },
        content_message: {
          text: "Welcome!\n\nPlease tap here/+ to add item"
        },
        content_date: {
          text: ""
        },
        tapArea: {
          title: ""
        }
      }]
    } else {
      $ui.error("No match item!", 1)
    }
  }
  $("list").data = temp
}

function deleteNotify(item_id) {
  var allItems = $cache.get("messages")
  var nid = allItems[item_id].notify_id
  $push.cancel({id: nid})
}

function sortNumber(a,b) {
  return b - a
}

// Array.prototype.removeByValue = function(val) {
//   for(var i=0; i<this.length; i++) {
//     if(this[i] == val) {
//       this.splice(i, 1);
//       break;
//     }
//   }
// }

module.exports = {
  saveItem: saveItem,
  getItem: getItem,
  sendItem: sendItem,
  searchItem: searchItem,
  updateItem: updateItem,
  deleteItem: deleteItem,
  deleteNotify: deleteNotify
}