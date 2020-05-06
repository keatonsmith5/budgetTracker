
// TODO: open  indexedDB
const indexedDB =
window.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

// TODO: create an object store in the open db
request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

// TODO: log any indexedDB errors
request.onerror = function(event) {
  console.log(`Woops! ${ event.target.errorCode}`);
};

// TODO: add code so that any transactions stored in the db
// are sent to the backend if/when the user goes online
// Hint: learn about "navigator.onLine" and the "online" window event
function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store
        const store = transaction.objectStore("pending");

        // clear all items in your store
        store.clear();
      });
    }
  };
}

// TODO: add code to saveRecord so that it accepts a record object for a
// transaction and saves it in the db. This function is called in index.js
// when the user creates a transaction while offline.
function saveRecord(record) {
  // add your code here
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");
 
  // add record to your store with add method.
  store.add(record);
}

window.addEventListener("online", checkDatabase);
