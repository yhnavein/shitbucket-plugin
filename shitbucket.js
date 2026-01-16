if (typeof browser === "undefined") {
    var browser = chrome;
}

const iconsPath = browser.runtime.getURL("icons/bb-favicon.png");

let link = document.querySelector("link[rel~='icon']");
if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
}
link.href = iconsPath;

const targetNode = document.getElementById("root");

const config = { attributes: true, childList: true, subtree: true };

const brownGradient = 'linear-gradient(135deg, #4a3728 16.66%, #7d5a3c 16.66%, 33.33%, #a0522d 33.33%, 50%, #8b6f47 50%, 66.66%, #6b4423 66.66%, 83.33%, #5c4033 83.33%)';

const callback = (mutationList, observer) => {
    let shouldUpdate = true;
    for (const mutation of mutationList) {
        const testId = mutation.target.getAttribute?.("data-testid");
        if (testId === 'product-home-container') {
            shouldUpdate = false;
        }
    }
    if (shouldUpdate) {
        const container = document.querySelector("[data-testid='product-home-container']");

        if (container) {
            container.innerHTML = `<div data-testid="product-home-logo"><div style="border-radius: 5px; padding: 5px; display: flex; justify-content: center; align-items: center; background: ${brownGradient};"><img src="${iconsPath}" class="newLogoImage"><span class="newLogoText rainbow-text-color">Shitbucket</span></div></div>`;
        }
    }
};

const observer = new MutationObserver(callback);

observer.observe(targetNode, config);
