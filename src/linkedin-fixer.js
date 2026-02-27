// LinkedIn Fixer
// Blocks auto-play videos and injects darker mode CSS

// Suppress chrome-extension://invalid/ errors from LinkedIn's detection code
(function() {
  // Intercept fetch calls to prevent chrome-extension://invalid/ requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Block any requests to chrome-extension://invalid/
    if (typeof url === 'string' && url.includes('chrome-extension://invalid')) {
      // Return a rejected promise to fail silently
      return Promise.reject(new Error('Blocked invalid extension URL'));
    }
    if (url instanceof Request && url.url.includes('chrome-extension://invalid')) {
      return Promise.reject(new Error('Blocked invalid extension URL'));
    }
    return originalFetch.apply(this, arguments);
  };

  // Intercept XMLHttpRequest to prevent chrome-extension://invalid/ requests
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    // Block any requests to chrome-extension://invalid/
    if (typeof url === 'string' && url.includes('chrome-extension://invalid')) {
      // Open to a data URL instead to fail silently
      return originalOpen.call(this, method, 'data:text/plain,', ...rest);
    }
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  // Intercept Image loads
  const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    set: function(value) {
      // Block chrome-extension://invalid/ image loads
      if (typeof value === 'string' && value.includes('chrome-extension://invalid')) {
        return; // Don't set the src
      }
      return originalImageSrc.set.call(this, value);
    },
    get: function() {
      return originalImageSrc.get.call(this);
    }
  });

  // Suppress console errors related to chrome-extension://invalid/
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    if (errorString.includes('chrome-extension://invalid/')) {
      return; // Suppress this specific error
    }
    originalConsoleError.apply(console, args);
  };
})();

class LinkedInFixer {
  constructor() {
    this.settings = {
      blockVideos: false,
      darkerMode: false
    };
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        linkedinBlockVideos: false,
        linkedinDarkerMode: false
      });

      this.settings.blockVideos = settings.linkedinBlockVideos;
      this.settings.darkerMode = settings.linkedinDarkerMode;

      if (this.settings.blockVideos) {
        this.blockVideos();
      }

      if (this.settings.darkerMode) {
        this.injectDarkerMode();
      }
    } catch (error) {
      console.log('[De-Slop LinkedIn Fixer] Could not load settings:', error.message);
    }
  }

  blockVideos() {
    // Block auto-play videos with defensive error handling
    const blockVideo = (video) => {
      try {
        // Check if video still exists in DOM
        if (!video || !video.isConnected) return;

        video.pause();
        video.muted = true;
        video.autoplay = false;
        video.setAttribute('data-deslop-blocked', 'true');

        // Hide video container
        let container = video.closest('.feed-shared-update-v2__content, .feed-shared-inline-video, .feed-shared-native-video');
        if (container && container.isConnected) {
          container.style.display = 'none';
        }
      } catch (e) {
        // Silently fail if video element is no longer accessible
      }
    };

    // Block existing videos using idle callback for less intrusive timing
    const blockExistingVideos = () => {
      try {
        document.querySelectorAll('video').forEach(blockVideo);
      } catch (e) {
        console.warn('[De-Slop LinkedIn Fixer] Error blocking existing videos:', e.message);
      }
    };

    if (window.requestIdleCallback) {
      requestIdleCallback(blockExistingVideos);
    } else {
      setTimeout(blockExistingVideos, 0);
    }

    // Debounce mutation observer to reduce frequency
    let debounceTimer;
    const debouncedVideoCheck = (mutations) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'VIDEO') {
                  blockVideo(node);
                }
                const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                videos.forEach(blockVideo);
              }
            });
          });
        } catch (e) {
          // Silently handle errors during mutation processing
        }
      }, 100);
    };

    // Watch for new videos
    const observer = new MutationObserver(debouncedVideoCheck);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[De-Slop LinkedIn Fixer] Video blocking enabled');
  }

  injectDarkerMode() {
    // First, try to add LinkedIn's native dark mode class with defensive timing
    const applyDarkClasses = () => {
      try {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        // Add LinkedIn's dark class to trigger their built-in dark theme
        if (htmlElement) htmlElement.classList.add('theme--dark', 'dark');
        if (bodyElement) bodyElement.classList.add('theme--dark', 'dark');
      } catch (e) {
        console.warn('[De-Slop LinkedIn Fixer] Error applying dark classes:', e.message);
      }
    };

    // Use idle callback for less intrusive timing
    if (window.requestIdleCallback) {
      requestIdleCallback(applyDarkClasses);
    } else {
      setTimeout(applyDarkClasses, 0);
    }

    // Then override with even darker values
    const style = document.createElement('style');
    style.id = 'deslop-linkedin-darker-mode';
    style.textContent = `
      /* De-Slop LinkedIn Darker Mode - Override LinkedIn's CSS Variables */

      html.dark, body.dark, :root, body {
        /* Canvas/Background colors */
        --color-canvas: #000000 !important;
        --color-canvas-tint: #0a0a0a !important;
        --color-canvas-mobile: #000000 !important;
        --color-background-canvas: #000000 !important;
        --color-background-canvas-mobile: #000000 !important;
        --color-background-canvas-tint: #0a0a0a !important;
        --color-background-canvas-dark: #000000 !important;
        --color-background-container: #0a0a0a !important;
        --color-background-container-tint: #0a0a0a !important;
        --color-background-container-dark-tint: #0a0a0a !important;

        /* Surface colors */
        --color-surface: #0a0a0a !important;
        --color-surface-tint: #101010 !important;

        /* Container colors */
        --color-container-primary: #1a1a1a !important;
        --color-container-secondary: rgba(255, 255, 255, 0.04) !important;
        --color-container-tertiary: rgba(255, 255, 255, 0.02) !important;

        /* Text colors */
        --color-text: rgba(255, 255, 255, 0.95) !important;
        --color-text-hover: rgba(255, 255, 255, 1) !important;
        --color-text-active: rgba(255, 255, 255, 1) !important;
        --color-text-secondary: rgba(255, 255, 255, 0.7) !important;
        --color-text-secondary-hover: rgba(255, 255, 255, 0.9) !important;
        --color-text-secondary-active: rgba(255, 255, 255, 0.9) !important;
        --color-text-disabled: rgba(255, 255, 255, 0.4) !important;
        --color-text-solid: #f2f2f2 !important;
        --color-text-solid-hover: #f2f2f2 !important;
        --color-text-solid-active: #f2f2f2 !important;
        --color-text-solid-secondary: #cfcfcf !important;
        --color-text-solid-secondary-hover: #f2f2f2 !important;
        --color-text-solid-secondary-active: #f2f2f2 !important;
        --color-text-low-emphasis: rgba(255, 255, 255, 0.6) !important;
        --color-text-low-emphasis-on-dark: rgba(255, 255, 255, 0.6) !important;
        --color-text-on-dark: rgba(255, 255, 255, 0.95) !important;
        --color-text-on-dark-disabled: rgba(255, 255, 255, 0.4) !important;

        /* Icon colors */
        --color-icon: rgba(255, 255, 255, 0.85) !important;
        --color-icon-hover: rgba(255, 255, 255, 0.95) !important;
        --color-icon-active: rgba(255, 255, 255, 1) !important;
        --color-icon-disabled: rgba(255, 255, 255, 0.4) !important;
        --color-icon-nav: rgba(255, 255, 255, 0.8) !important;
        --color-icon-nav-disabled: rgba(255, 255, 255, 0.4) !important;
        --color-icon-nav-selected: rgba(255, 255, 255, 1) !important;
        --color-icon-on-dark: rgba(255, 255, 255, 0.95) !important;

        /* Border/Divider colors */
        --color-divider: rgba(255, 255, 255, 0.12) !important;
        --color-divider-solid: #1a1a1a !important;
        --color-border: rgba(255, 255, 255, 0.15) !important;
        --color-border-faint: rgba(255, 255, 255, 0.08) !important;
        --color-border-low-emphasis: rgba(255, 255, 255, 0.3) !important;
        --color-border-on-dark: rgba(255, 255, 255, 0.15) !important;
        --color-border-active: rgba(255, 255, 255, 0.3) !important;
        --color-surface-border: rgba(255, 255, 255, 0.12) !important;

        /* Button colors */
        --color-button-container-secondary: rgba(255, 255, 255, 0.04) !important;
        --color-button-container-secondary-hover: rgba(255, 255, 255, 0.08) !important;
        --color-button-container-secondary-active: rgba(255, 255, 255, 0.12) !important;
        --color-button-container-secondary-border: rgba(255, 255, 255, 0.3) !important;
        --color-button-container-tertiary: rgba(255, 255, 255, 0.02) !important;
        --color-button-container-tertiary-hover: rgba(255, 255, 255, 0.06) !important;
        --color-button-container-tertiary-active: rgba(255, 255, 255, 0.1) !important;
        --color-button-label-secondary: rgba(255, 255, 255, 0.85) !important;
        --color-button-label-secondary-hover: rgba(255, 255, 255, 0.95) !important;
        --color-button-label-tertiary: rgba(255, 255, 255, 0.85) !important;
        --color-button-label-tertiary-hover: rgba(255, 255, 255, 0.95) !important;
        --color-button-icon-secondary: rgba(255, 255, 255, 0.85) !important;
        --color-button-icon-secondary-hover: rgba(255, 255, 255, 0.95) !important;
        --color-button-icon-tertiary: rgba(255, 255, 255, 0.85) !important;
        --color-button-icon-tertiary-hover: rgba(255, 255, 255, 0.95) !important;

        /* Input colors */
        --color-input-container: rgba(255, 255, 255, 0.04) !important;
        --color-input-container-hover: rgba(255, 255, 255, 0.08) !important;
        --color-input-container-active: rgba(255, 255, 255, 0.12) !important;
        --color-input-container-border: rgba(255, 255, 255, 0.3) !important;
        --color-input-container-border-hover: rgba(255, 255, 255, 0.5) !important;
        --color-input-label: rgba(255, 255, 255, 0.85) !important;
        --color-input-value: rgba(255, 255, 255, 0.95) !important;
        --color-input-hint: rgba(255, 255, 255, 0.6) !important;
        --color-input-icon: rgba(255, 255, 255, 0.85) !important;

        /* Label colors */
        --color-label: rgba(255, 255, 255, 0.85) !important;
        --color-label-hover: rgba(255, 255, 255, 0.95) !important;
        --color-label-active: rgba(255, 255, 255, 1) !important;

        /* Link colors - neutral instead of blue */
        --color-link: rgba(255, 255, 255, 0.9) !important;
        --color-link-hover: rgba(255, 255, 255, 1) !important;
        --color-link-active: rgba(255, 255, 255, 1) !important;
        --color-link-visited: rgba(255, 255, 255, 0.7) !important;
        --color-link-visited-hover: rgba(255, 255, 255, 0.9) !important;
        --color-link-visited-active: rgba(255, 255, 255, 0.9) !important;

        /* Brand colors - remove blue */
        --color-brand: rgba(255, 255, 255, 0.9) !important;
        --color-brand-alt: rgba(255, 255, 255, 0.9) !important;
        --color-action: rgba(255, 255, 255, 0.85) !important;
        --color-action-active: rgba(255, 255, 255, 1) !important;

        /* Container brand colors - neutral */
        --color-container-primary: rgba(255, 255, 255, 0.15) !important;
        --color-container-primary-hover: rgba(255, 255, 255, 0.2) !important;
        --color-container-primary-active: rgba(255, 255, 255, 0.25) !important;
        --color-container-brand: rgba(255, 255, 255, 0.15) !important;
        --color-container-brand-hover: rgba(255, 255, 255, 0.2) !important;
        --color-container-brand-active: rgba(255, 255, 255, 0.25) !important;

        /* Icon brand colors - neutral */
        --color-icon-brand: rgba(255, 255, 255, 0.85) !important;
        --color-icon-brand-hover: rgba(255, 255, 255, 0.95) !important;
        --color-icon-brand-active: rgba(255, 255, 255, 1) !important;

        /* Button primary colors - neutral white instead of blue */
        --color-button-container-primary: rgba(255, 255, 255, 0.15) !important;
        --color-button-container-primary-hover: rgba(255, 255, 255, 0.2) !important;
        --color-button-container-primary-active: rgba(255, 255, 255, 0.25) !important;
        --color-button-container-primary-border: rgba(255, 255, 255, 0.3) !important;
        --color-button-container-primary-border-hover: rgba(255, 255, 255, 0.4) !important;
        --color-button-container-primary-border-active: rgba(255, 255, 255, 0.5) !important;
        --color-button-label-primary: rgba(255, 255, 255, 0.95) !important;
        --color-button-label-primary-hover: rgba(255, 255, 255, 1) !important;
        --color-button-label-primary-active: rgba(255, 255, 255, 1) !important;
        --color-button-icon-primary: rgba(255, 255, 255, 0.95) !important;
        --color-button-icon-primary-hover: rgba(255, 255, 255, 1) !important;
        --color-button-icon-primary-active: rgba(255, 255, 255, 1) !important;

        /* Text brand colors - neutral */
        --color-text-brand: rgba(255, 255, 255, 0.95) !important;
        --color-text-brand-hover: rgba(255, 255, 255, 1) !important;
        --color-text-brand-active: rgba(255, 255, 255, 1) !important;

        /* Background colors - remove blue tints */
        --color-background-new: rgba(255, 255, 255, 0.05) !important;
        --color-background-none-action-active: rgba(255, 255, 255, 0.08) !important;
        --color-surface-new: rgba(255, 255, 255, 0.05) !important;
        --color-surface-new-hover: rgba(255, 255, 255, 0.08) !important;
        --color-surface-new-active: rgba(255, 255, 255, 0.1) !important;
        --color-container-new: rgba(255, 255, 255, 0.15) !important;
        --color-container-new-border: rgba(255, 255, 255, 0.3) !important;

        /* Shadow colors */
        --color-shadow: rgba(0, 0, 0, 0.8) !important;
        --color-shadow-border: rgba(0, 0, 0, 0.6) !important;
        --color-scrim: rgba(0, 0, 0, 0.7) !important;
        --color-background-scrim: rgba(0, 0, 0, 0.7) !important;
        --color-background-scrim-dark: rgba(0, 0, 0, 0.9) !important;
      }

      /* Additional fixes for elements that don't use variables */

      /* Force black backgrounds on everything */
      body,
      html,
      #global-nav,
      .scaffold-layout,
      .scaffold-layout__main,
      .scaffold-layout__content,
      .scaffold-finite-scroll,
      .scaffold-finite-scroll__content,
      main,
      [role="main"],
      .application-outlet,
      .mn-community-summary,
      .mn-invitations-preview,
      .mn-grow-cta,
      .artdeco-tabs,
      .mn-settings-panel,
      [class*="mn-"],
      .org-top-card,
      .org-page-details,
      .jobs-search-box,
      .jobs-search-results-list,
      .scaffold-layout-container,
      .scaffold-layout-container__content,
      #main {
        background-color: #000000 !important;
      }

      /* Force all divs, sections, and containers to have dark backgrounds */
      div:not([class*="image"]):not([class*="photo"]):not([class*="icon"]),
      section,
      aside,
      header:not(.global-nav),
      footer {
        background-color: inherit !important;
      }

      /* Feed posts and cards - very dark gray */
      .feed-shared-update-v2,
      .artdeco-card,
      .pvs-list__paged-list-item,
      article,
      [data-id*="urn:li:activity"],
      .feed-shared-update-v2__content,
      .feed-shared-update-v2__description-wrapper,
      .comments-comment-item,
      .artdeco-modal__content,
      .artdeco-dropdown__content,
      .mn-community-summary__card,
      .mn-invitations-preview__card,
      .discover-entity-card,
      .discover-entity-type-card,
      .entity-result,
      .reusable-search__entity-result-list,
      .jobs-search-results__list-item,
      .org-top-card-primary-content,
      .org-top-card-secondary-content,
      [class*="card"],
      .pvs-entity,
      .pvs-header {
        background-color: #0a0a0a !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* ALL dropdown menus - give them solid backgrounds */
      .artdeco-dropdown__content,
      .artdeco-dropdown,
      .global-nav__me-content,
      .global-nav__app-launcher-menu-content,
      .search-global-typeahead__overlay,
      [class*="artdeco-dropdown__content"],
      [class*="dropdown"][class*="content"],
      [class*="global-nav"][class*="content"],
      .artdeco-modal__content,
      .artdeco-card.artdeco-dropdown,
      .ember-view.artdeco-dropdown__content,
      .ember-view[class*="dropdown"],
      div[class*="dropdown__content"],
      div[id*="ember"][class*="dropdown"] {
        background-color: #0a0a0a !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8) !important;
      }

      /* Dropdown menu items */
      .artdeco-dropdown__item,
      .artdeco-dropdown__content a,
      .artdeco-dropdown__content button,
      .artdeco-dropdown__content li {
        background-color: transparent !important;
        color: rgba(255, 255, 255, 0.9) !important;
      }

      /* Dropdown items hover */
      .artdeco-dropdown__item:hover,
      .artdeco-dropdown__content a:hover,
      .artdeco-dropdown__content button:hover,
      .artdeco-dropdown__content li:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 1) !important;
      }

      /* All text should be light */
      body, body *:not(img):not(svg) {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      /* Headings and important text */
      h1, h2, h3, h4, h5, h6,
      strong, b,
      .feed-shared-actor__name,
      .feed-shared-actor__title,
      .update-components-actor__name {
        color: rgba(255, 255, 255, 0.95) !important;
      }

      /* Secondary text */
      .feed-shared-actor__sub-description,
      .feed-shared-actor__meta,
      .update-components-actor__description,
      .t-12, .t-black--light,
      small {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      /* Buttons - neutral */
      button,
      .artdeco-button,
      [role="button"] {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      button:hover,
      .artdeco-button:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }

      /* Primary buttons */
      .artdeco-button--primary,
      button.artdeco-button--primary {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 1) !important;
      }

      .artdeco-button--primary:hover {
        background-color: rgba(255, 255, 255, 0.25) !important;
      }

      /* Links - visible but not blue */
      a {
        color: rgba(255, 255, 255, 0.85) !important;
      }

      a:hover {
        color: rgba(255, 255, 255, 1) !important;
      }

      /* Inputs and textareas */
      input,
      textarea,
      .ql-editor,
      [contenteditable="true"] {
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      /* Navigation */
      .global-nav,
      .global-nav__content {
        background-color: #0a0a0a !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      /* Navigation menu items - transparent backgrounds */
      .global-nav__me,
      .global-nav__primary-link,
      .global-nav__primary-link-me-menu-trigger,
      .global-nav__me-photo,
      .artdeco-dropdown__trigger,
      .global-nav__primary-link-text,
      .global-nav__icon {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* Sidebars */
      .scaffold-layout__sidebar,
      aside {
        background-color: #000000 !important;
      }

      /* Images - no background, slight dimming */
      img:not([role="none"]) {
        filter: brightness(0.85) !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      /* Image containers - transparent backgrounds */
      .feed-shared-image,
      .feed-shared-image__container,
      .feed-shared-image__image-link,
      .ivm-image-view-model,
      .ivm-view-attr__img-wrapper,
      .update-components-image,
      .EntityPhoto,
      .EntityPhoto-square-1,
      .EntityPhoto-square-2,
      .EntityPhoto-square-3,
      .EntityPhoto-square-4,
      .EntityPhoto-circle-1,
      .EntityPhoto-circle-2,
      picture,
      [class*="EntityPhoto"],
      [class*="LitKwVv"],
      [class*="BEypRN"],
      [class*="SNemYb"],
      [class*="AnHTEf"] {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* Profile photos/avatars - no background */
      .presence-entity__image,
      .EntityPhoto-circle,
      .feed-shared-actor__avatar,
      .feed-shared-actor__avatar-image,
      .ivm-image-view-model__img-wrapper,
      [data-test-icon] img,
      .pv-top-card__photo-wrapper,
      .profile-photo-edit,
      .profile-photo-edit__edit-btn,
      .profile-photo-edit__preview,
      .profile-photo-edit__edit-icon-container {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* Text elements that shouldn't have backgrounds */
      [class*="inline-show-more-text"],
      .inline-show-more-text,
      .feed-shared-inline-show-more-text,
      [class*="FpZUYh"] {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* SVG icons - transparent background, light color */
      svg {
        color: rgba(255, 255, 255, 0.85) !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      svg path[fill="currentcolor"],
      svg path[fill="currentColor"],
      svg [fill="currentcolor"],
      svg [fill="currentColor"] {
        fill: currentcolor !important;
      }

      /* Icon containers - no background */
      .artdeco-icon,
      .app-aware-link__icon,
      .feed-shared-social-action-bar__action-icon,
      [class*="icon-"],
      [data-test-icon],
      [role="img"]:not(img) {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* Override inline styles */
      [style*="color: #000"],
      [style*="color: black"],
      [style*="color: rgb(0, 0, 0)"],
      [style*="color: rgb(0,0,0)"] {
        color: rgba(255, 255, 255, 0.95) !important;
      }

      [style*="background-color: #fff"],
      [style*="background-color: white"],
      [style*="background-color: rgb(255, 255, 255)"],
      [style*="background-color: rgb(255,255,255)"] {
        background-color: #0a0a0a !important;
      }

      /* Dividers and borders */
      hr,
      .artdeco-divider,
      [role="separator"] {
        border-color: rgba(255, 255, 255, 0.1) !important;
        background-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* Lists and tabs */
      ul, ol,
      .artdeco-list,
      .reusable-search-simple-insight,
      [class*="list"],
      .artdeco-tabs__tab,
      .artdeco-tabpanel {
        background-color: transparent !important;
      }

      /* Make sure active/selected states are visible */
      .artdeco-tabs__tab--selected,
      .active,
      [aria-selected="true"] {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-bottom-color: rgba(255, 255, 255, 0.5) !important;
      }

      /* Empty states and placeholders */
      .empty-state,
      [class*="empty"],
      [class*="placeholder"] {
        background-color: transparent !important;
        color: rgba(255, 255, 255, 0.6) !important;
      }

      /* Messaging pages - comprehensive support */
      .msg-overlay-list-bubble,
      .msg-overlay-bubble-header,
      .msg-overlay-list-bubble__content,
      .msg-conversation-listitem,
      .msg-conversations-container,
      .msg-thread,
      .msg-s-message-list,
      .msg-s-message-list__container,
      .msg-s-message-list-content,
      .msg-s-event-listitem,
      .messaging-main,
      .msg-overlay-container,
      [class*="msg-"] {
        background-color: #000000 !important;
      }

      /* Message bubbles */
      .msg-s-message-group,
      .msg-s-message-group__message,
      .msg-s-event-listitem__message-bubble {
        background-color: #0a0a0a !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* Conversation list items */
      .msg-conversation-listitem,
      .msg-conversation-card,
      .msg-conversation-card__row {
        background-color: #0a0a0a !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* Active/selected conversation */
      .msg-conversation-listitem--active,
      .msg-conversation-card--active {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* Message compose box */
      .msg-form,
      .msg-form__contenteditable,
      .msg-form__msg-content-container,
      .msg-form__footer {
        background-color: #0a0a0a !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      /* Message text */
      .msg-s-event-listitem__body,
      .msg-s-message-group__profile-link,
      .msg-s-message-group__name,
      .msg-conversation-card__message-snippet,
      [class*="msg-"] span,
      [class*="msg-"] p {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      /* Message timestamps */
      .msg-s-message-group__timestamp,
      .msg-conversation-card__time-stamp {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      /* Messaging header */
      .msg-overlay-bubble-header,
      .msg-thread-header {
        background-color: #0a0a0a !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      /* Message attachments */
      .msg-s-event-listitem__attachment,
      [class*="msg-"][class*="attachment"] {
        background-color: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
    `;

    try {
      document.head.appendChild(style);
    } catch (e) {
      console.warn('[De-Slop LinkedIn Fixer] Error injecting dark mode styles:', e.message);
      return;
    }

    // Watch for LinkedIn removing the dark class and re-add it with debouncing
    let classDebounceTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(classDebounceTimer);
      classDebounceTimer = setTimeout(() => {
        try {
          const htmlElement = document.documentElement;
          const bodyElement = document.body;

          if (htmlElement && !htmlElement.classList.contains('dark')) {
            htmlElement.classList.add('theme--dark', 'dark');
          }
          if (bodyElement && !bodyElement.classList.contains('dark')) {
            bodyElement.classList.add('theme--dark', 'dark');
          }
        } catch (e) {
          // Silently handle errors during class re-application
        }
      }, 50);
    });

    try {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      if (htmlElement) {
        observer.observe(htmlElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }

      if (bodyElement) {
        observer.observe(bodyElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
    } catch (e) {
      console.warn('[De-Slop LinkedIn Fixer] Error setting up class observer:', e.message);
    }

    console.log('[De-Slop LinkedIn Fixer] Darker mode enabled');
  }
}

// Initialize LinkedIn Fixer after DOM is ready (since we run at document_start)
if (chrome.runtime?.id) {
  const initFixer = () => {
    // Wait for LinkedIn's core scripts to initialize
    const initDelay = document.readyState === 'complete' ? 100 : 500;

    setTimeout(() => {
      if (chrome.runtime?.id) {
        new LinkedInFixer();
      }
    }, initDelay);
  };

  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFixer);
  } else {
    initFixer();
  }
} else {
  console.log('[De-Slop LinkedIn Fixer] Extension context not available');
}
