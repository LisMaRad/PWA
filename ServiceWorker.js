const staticMealPlan = "meal-gen-site"
const assets = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/app.js",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticMealPlan).then(cache => {
            return cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})