// biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: Not my code
if (typeof browser === "undefined") {
  // biome-ignore lint/correctness/noInnerDeclarations: Not my code
  var browser = chrome;
}

const faviconPath = browser.runtime.getURL("icons/bb-favicon.png");
const pooPath = browser.runtime.getURL("icons/poo.png");
let isUpdatingMyPrAvatarLink = false;
let isEnhancementUpdateQueued = false;

const getCurrentUser = () => {
  const bootstrapMeta = document.querySelector("meta#bb-bootstrap[data-current-user]");
  if (!bootstrapMeta) {
    return null;
  }

  const currentUserRaw = bootstrapMeta.getAttribute("data-current-user");
  if (!currentUserRaw) {
    return null;
  }

  try {
    const user = JSON.parse(currentUserRaw);
    return {
      uuid: user.uuid,
      avatarUrl: user.avatarUrl || user.avatarUrl2x || null
    };
  } catch {
    return null;
  }
};

const normalizeUuid = (uuid) => {
  if (!uuid || typeof uuid !== "string") {
    return null;
  }

  const trimmedUuid = uuid.trim();
  if (!trimmedUuid) {
    return null;
  }

  if (trimmedUuid.startsWith("{") && trimmedUuid.endsWith("}")) {
    return trimmedUuid;
  }

  return `{${trimmedUuid}}`;
};

const getMyPullRequestsUrl = (pullRequestsLinkHref, userUuid) => {
  if (!pullRequestsLinkHref || !userUuid) {
    return null;
  }

  const baseUrl = new URL(pullRequestsLinkHref, window.location.origin);
  if (baseUrl.pathname.includes("/workspace/pull-requests/")) {
    return null;
  }

  baseUrl.searchParams.set("user_filter", "ALL");
  baseUrl.searchParams.set("author", userUuid);
  return `${baseUrl.pathname}${baseUrl.search}`;
};

const ensureMyPullRequestsAvatarLink = () => {
  if (isUpdatingMyPrAvatarLink) {
    return;
  }

  const sideNav = document.querySelector("[data-testid='global-side-nav-test-id']");
  if (!sideNav) {
    return;
  }

  const user = getCurrentUser();
  const normalizedUuid = normalizeUuid(user?.uuid);
  if (!normalizedUuid || !user?.avatarUrl) {
    return;
  }

  isUpdatingMyPrAvatarLink = true;

  try {
    const pullRequestsLinks = Array.from(sideNav.querySelectorAll("a[href*='/pull-requests/']"));
    for (const pullRequestsLink of pullRequestsLinks) {
      const myPullRequestsUrl = getMyPullRequestsUrl(pullRequestsLink.getAttribute("href"), normalizedUuid);
      if (!myPullRequestsUrl) {
        continue;
      }

      const rowContainer = pullRequestsLink.parentElement;
      if (!rowContainer) {
        continue;
      }

      rowContainer.style.position = "relative";

      let avatarLink = rowContainer.querySelector(".shitbucket-my-pr-avatar-link");
      if (!avatarLink) {
        avatarLink = document.createElement("a");
        avatarLink.className = "shitbucket-my-pr-avatar-link";
        avatarLink.target = "_self";
        avatarLink.rel = "noopener noreferrer";
        avatarLink.draggable = false;
        avatarLink.setAttribute("aria-label", "My pull requests");

        const avatarImage = document.createElement("img");
        avatarImage.className = "shitbucket-my-pr-avatar-image";
        avatarImage.alt = "My pull requests";
        avatarImage.loading = "lazy";
        avatarImage.decoding = "async";
        avatarImage.referrerPolicy = "no-referrer";
        avatarLink.appendChild(avatarImage);

        rowContainer.appendChild(avatarLink);
      }

      if (avatarLink.getAttribute("href") !== myPullRequestsUrl) {
        avatarLink.setAttribute("href", myPullRequestsUrl);
      }

      const avatarImage = avatarLink.querySelector("img");
      if (avatarImage && avatarImage.getAttribute("src") !== user.avatarUrl) {
        avatarImage.setAttribute("src", user.avatarUrl);
      }
    }
  } finally {
    isUpdatingMyPrAvatarLink = false;
  }
};

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

const targetNode = document.getElementById("root") || document.body || document.documentElement;

const config = { childList: true, subtree: true };

const applyEnhancements = () => {
  ensureMyPullRequestsAvatarLink();

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

const scheduleEnhancementsUpdate = () => {
  if (isEnhancementUpdateQueued) {
    return;
  }

  isEnhancementUpdateQueued = true;
  window.requestAnimationFrame(() => {
    isEnhancementUpdateQueued = false;
    applyEnhancements();
  });
};

scheduleEnhancementsUpdate();

const observer = new MutationObserver(scheduleEnhancementsUpdate);

if (targetNode) {
  observer.observe(targetNode, config);
}
