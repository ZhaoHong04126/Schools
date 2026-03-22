const CACHE_NAME = 'CampusKing_v3.8.1-beta_'; 

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.html',
    './manifest.json',
	'./css/base.css',
	'./css/layout.css',
	'./css/components.css',
	'./css/landing.css',
	'./css/auth.css',
	'./css/dashboard.css',
	'./css/calendar.css',
	'./css/settings.css',
    '/css/feedback-admin.css',
	'./js/firebase.js',
	'./js/state.js',
	'./js/ui.js',
	'./js/course.js',
	'./js/grade.js',
	'./js/data.js',
	'./js/semester.js',
	'./js/auth.js',
	'./js/main.js',
	'./js/calendar.js',
	'./js/accounting.js',
	'./js/anniversary.js',
	'./js/lottery.js',
	'./js/homework.js',
	'./js/gradecalc.js',
    './js/selfstudy.js',
    './js/feedback.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );

});


self.addEventListener('notificationclick', function(event) {
    // 點擊後自動關閉該則手機通知
    event.notification.close();

    // 讓瀏覽器打開或聚焦到我們的 App
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // 檢查 App 是否已經在背景開啟了，如果是就把它切換到前景
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf('/') !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            // 如果 App 完全沒開，就開一個新的視窗 (首頁)
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});