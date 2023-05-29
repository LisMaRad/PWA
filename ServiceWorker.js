const staticMealPlan = "meal-gen-site"
const assets = [
    "/"
]

// self.addEventListener("install", installEvent => {
//     installEvent.waitUntil(
//         caches.open(staticMealPlan).then(cache => {
//             return cache.addAll(assets)
//         })
//     )
// })

const filesUpdate = cache => {
    const stack = [];
    assets.forEach(file => stack.push(
        cache.add(file).catch(_=>console.error(`can't load ${file} to cache`))
    ));
    return Promise.all(stack);
};
self.addEventListener("install", function (event) {
    console.log("[ServiceWorker] Install");

    event.waitUntil(caches.open(staticMealPlan).then(filesUpdate));
});

// self.addEventListener("fetch", fetchEvent => {
//     fetchEvent.respondWith(
//         caches.match(fetchEvent.request).then(res => {
//             return res || fetch(fetchEvent.request)
//         })
//     )
// })

self.addEventListener("fetch", (event) => {
    console.log(`Handling fetch event for ${event.request.url}`);

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log("Found response in cache:", response);
                return response;
            }
            console.log("No response found in cache. About to fetch from network…");

            return fetch(event.request)
                .then((response) => {
                    console.log("Response from network is:", response);

                    return response;
                })
                .catch((error) => {
                    console.error(`Fetching failed: ${error}`);
                    throw error;
                });
        })
    );
});