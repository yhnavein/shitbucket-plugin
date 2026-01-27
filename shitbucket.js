// biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: Not my code
if (typeof browser === "undefined") {
  // biome-ignore lint/correctness/noInnerDeclarations: Not my code
  var browser = chrome;
}

const faviconPath = browser.runtime.getURL("icons/bb-favicon.png");
const pooPath = browser.runtime.getURL("icons/poo.png");

// Function to update favicon
const updateFavicon = () => {
  const links = document.querySelectorAll("link[rel*='icon']");
  links.forEach(link => {
    if (link.href !== faviconPath) {
      link.href = faviconPath;
      link.type = 'image/png';
    }
  });

  // If no favicon link exists, create one
  if (links.length === 0) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconPath;
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

const callback = (_mutationList, _observer) => {
  const container = document.querySelector("[data-testid='product-home-container']");

  if (!container) {
    // In the new version, they introduced a new Navbar structure, so it may mean that user has new UI enabled.
    // You, because they use Tailwind now, this is the only way to find the logo link.
    const logoLink = document.querySelector("a[aria-label='Bitbucket']");
    if (logoLink) {
      // Check if our custom content is already in place to avoid infinite loop
      const hasCustomLogo = logoLink.querySelector('.newLogoImage');

      // Only update if our custom content is missing
      if (!hasCustomLogo) {
        logoLink.innerHTML = `<div id="poobucket" style="margin-left: 8px;"><img src="${pooPath}" class="newLogoImage"><span class="newLogoText rainbow-text-color">Shitbucket</span></div>`;
      }
    }
    return;
  }

  // Check if our custom content is already in place
  const hasCustomLogo = container.querySelector('.newLogoImage');
  const hasCustomText = container.textContent.includes('Shitbucket');

  // Only update if our custom content is missing (meaning Bitbucket replaced it)
  if (!hasCustomLogo || !hasCustomText) {
    container.innerHTML = `<div data-testid="product-home-logo"><div id="poobucket"><img src="${pooPath}" class="newLogoImage"><span class="newLogoText rainbow-text-color">Shitbucket</span></div></div>`;
  }
};

const observer = new MutationObserver(callback);

observer.observe(targetNode, config);
