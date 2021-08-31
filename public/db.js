let db;

const request = indexedDB.open("budget-app", 1);

request.onupgradeneeded = evt => {
    const db = evt.target.result;
    db.createObjectStore("offline", { autoIncrement: true });
};

request.onsuccess = evt => {
    db = evt.target.result;
    if (navigator.onLine) {
        reviewDB();
    }
};

request.onerror = (evt) => {
    console.log("Error " + evt.target.errorCode);
};



const reviewDB = () => {
    const transaction = db.transaction(["offline"], "readwrite");

    const bgtStore = transaction.objectStore("offline");

    const getAll = bgtStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["offline"], "readwrite");
                    const bgtStore = transaction.objectStore("offline");
                    bgtStore.clear();
                    alert("Transactions made offline have been uploaded!");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

const saveRecord = (rec) =>{
    const transaction = db.transaction(["offline"], "readwrite");
    const storeDB = transaction.objectStore("offline");
    storeDB.add(rec);
}

window.addEventListener('online', reviewDB);