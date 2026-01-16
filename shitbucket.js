if (typeof browser === "undefined") {
    var browser = chrome;
}

const iconsPath = browser.runtime.getURL("icons/bb-favicon.png");

// Function to update favicon
const updateFavicon = () => {
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach(link => {
        if (link.href !== iconsPath) {
            link.href = iconsPath;
            link.type = 'image/png';
        }
    });

    // If no favicon link exists, create one
    if (links.length === 0) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = iconsPath;
        document.head.appendChild(link);
    }
};

// Initial favicon update
updateFavicon();

// Watch for favicon changes in <head>
const faviconObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
            updateFavicon();
        }
    }
});

faviconObserver.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href']
});

const targetNode = document.getElementById("root");

const config = { attributes: true, childList: true, subtree: true };

const brownGradient = 'linear-gradient(135deg, #4a3728 16.66%, #7d5a3c 16.66%, 33.33%, #a0522d 33.33%, 50%, #8b6f47 50%, 66.66%, #6b4423 66.66%, 83.33%, #5c4033 83.33%)';

const callback = (mutationList, observer) => {
    const container = document.querySelector("[data-testid='product-home-container']");

    if (!container) return;

    // Check if our custom content is already in place
    const hasCustomLogo = container.querySelector('.newLogoImage');
    const hasCustomText = container.textContent.includes('Shitbucket');

    // Only update if our custom content is missing (meaning Bitbucket replaced it)
    if (!hasCustomLogo || !hasCustomText) {
        container.innerHTML = `<div data-testid="product-home-logo"><div style="border-radius: 5px; padding: 5px; display: flex; justify-content: center; align-items: center; background: ${brownGradient};"><img src="${iconsPath}" class="newLogoImage"><span class="newLogoText rainbow-text-color">Shitbucket</span></div></div>`;
    }
};

const observer = new MutationObserver(callback);

observer.observe(targetNode, config);
