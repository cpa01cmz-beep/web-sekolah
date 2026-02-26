/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'akademia-v1'
const STATIC_ASSETS = ['/', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networked = fetch(event.request)
          .then(response => {
            const clone = response.clone()
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone)
              })
            }
            return response
          })
          .catch(() => cached)
        return cached || networked
      })
    )
  }
})

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
