// LinkedIn Fixer
// Blocks auto-play videos and injects darker mode CSS

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
    // Block auto-play videos
    const blockVideo = (video) => {
      video.pause();
      video.muted = true;
      video.autoplay = false;
      video.setAttribute('data-deslop-blocked', 'true');

      // Hide video container
      let container = video.closest('.feed-shared-update-v2__content, .feed-shared-inline-video, .feed-shared-native-video');
      if (container) {
        container.style.display = 'none';
      }
    };

    // Block existing videos
    document.querySelectorAll('video').forEach(blockVideo);

    // Watch for new videos
    const observer = new MutationObserver((mutations) => {
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
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[De-Slop LinkedIn Fixer] Video blocking enabled');
  }

  injectDarkerMode() {
    const style = document.createElement('style');
    style.id = 'deslop-linkedin-darker-mode';
    style.textContent = `
      /* De-Slop LinkedIn Darker Mode */

      /* Main background */
      body,
      .scaffold-layout__main,
      .application-outlet,
      .global-nav,
      .scaffold-finite-scroll__content {
        background-color: #000 !important;
      }

      /* Feed background */
      .feed-shared-update-v2,
      .feed-shared-update-v2__description-wrapper,
      .feed-shared-actor,
      .feed-shared-text,
      .feed-shared-inline-show-more-text,
      .scaffold-layout__sidebar {
        background-color: #0a0a0a !important;
        border-color: #1a1a1a !important;
      }

      /* Card backgrounds */
      .artdeco-card,
      .pvs-list__paged-list-item,
      .scaffold-finite-scroll,
      .feed-shared-update-v2__commentary,
      .comments-comments-list,
      .comments-comment-item {
        background-color: #0a0a0a !important;
        border-color: #1a1a1a !important;
      }

      /* Text colors */
      .feed-shared-actor__title,
      .feed-shared-actor__description,
      .feed-shared-text__text-view,
      .feed-shared-inline-show-more-text__button,
      span.visually-hidden,
      .visually-hidden,
      .feed-shared-text,
      .comments-comment-item__main-content,
      .comments-comment-texteditor,
      .artdeco-entity-lockup__title,
      .artdeco-entity-lockup__subtitle,
      .pvs-entity__caption-wrapper,
      .t-black,
      .t-normal,
      .t-14 {
        color: #d0d0d0 !important;
      }

      /* Secondary text */
      .feed-shared-actor__sub-description,
      .feed-shared-social-counts__count,
      .t-black--light,
      .t-12,
      .comments-comment-item__timestamp {
        color: #888 !important;
      }

      /* Navigation */
      .global-nav__content,
      .global-nav__primary-link,
      .global-nav__primary-link-text {
        background-color: #0f0f0f !important;
        color: #d0d0d0 !important;
        border-color: #1a1a1a !important;
      }

      /* Sidebar */
      .scaffold-layout__sidebar,
      .scaffold-layout-container__aside {
        background-color: #000 !important;
      }

      /* Buttons */
      .artdeco-button--secondary {
        background-color: #1a1a1a !important;
        color: #d0d0d0 !important;
        border-color: #333 !important;
      }

      .artdeco-button--secondary:hover {
        background-color: #222 !important;
        border-color: #444 !important;
      }

      /* Inputs */
      .artdeco-text-input--input,
      .msg-form__contenteditable,
      .share-creation-state__text-editor {
        background-color: #0f0f0f !important;
        color: #d0d0d0 !important;
        border-color: #333 !important;
      }

      /* Dropdowns and modals */
      .artdeco-dropdown__content,
      .artdeco-modal,
      .artdeco-modal__content {
        background-color: #0a0a0a !important;
        border-color: #1a1a1a !important;
      }

      /* Reactions */
      .reactions-menu,
      .reactions-react-button {
        background-color: #0f0f0f !important;
        border-color: #1a1a1a !important;
      }

      /* Search */
      .search-global-typeahead,
      .search-global-typeahead__input {
        background-color: #0f0f0f !important;
        color: #d0d0d0 !important;
        border-color: #333 !important;
      }

      /* Messaging */
      .msg-overlay-list-bubble,
      .msg-thread,
      .msg-s-message-list,
      .msg-s-message-list__container {
        background-color: #0a0a0a !important;
        border-color: #1a1a1a !important;
      }

      .msg-s-message-group__message {
        background-color: #0f0f0f !important;
        color: #d0d0d0 !important;
      }

      /* Reduce brightness of images slightly */
      .feed-shared-image__image-link img,
      .feed-shared-article__image img,
      .ivm-image-view-model img {
        filter: brightness(0.85);
      }

      /* Make links more visible */
      a, .app-aware-link {
        color: #8ab4f8 !important;
      }

      /* Dividers */
      .feed-shared-update-v2__update-content-wrapper,
      .pvs-list__item--border-bottom {
        border-bottom-color: #1a1a1a !important;
      }
    `;

    document.head.appendChild(style);
    console.log('[De-Slop LinkedIn Fixer] Darker mode enabled');
  }
}

// Initialize LinkedIn Fixer
if (chrome.runtime?.id) {
  new LinkedInFixer();
} else {
  console.log('[De-Slop LinkedIn Fixer] Extension context not available');
}
