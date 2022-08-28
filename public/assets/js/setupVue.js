const { reactive, ref, watch } = Vue;
const { loadModule } = window['vue3-sfc-loader'];

const sfcLoaderOpts = {
    moduleCache: {
        vue: Vue
    },
    getFile(url) {
        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
    },
    addStyle(styleStr) {
        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
    log(type, ...args) {
        console.log(type, ...args);
    }
}