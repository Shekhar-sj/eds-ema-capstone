/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome and tracking artifacts so the import
 * contains only page-level authorable content. All selectors verified against
 * migration-work/cleaned.html (WKND homepage, AEM Core Component markup).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking / third-party iframe that blocks nothing but is not authorable.
    // Found in cleaned.html: <iframe id="destination_publishing_iframe_wkndsite_0"
    //   src="https://wkndsite.demdex.net/...">
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (header, footer, mobile nav) and leftover
    // stray elements. Selectors verified in cleaned.html:
    //   header.cmp-experiencefragment--header (sign-in, language nav, logo, nav, search)
    //   footer.cmp-experiencefragment--footer (logo, nav, social buttons, copyright)
    //   #toggleNav / #mobileNav (mobile hamburger + mobile navigation)
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.cmp-experiencefragment--header',
      'footer',
      '.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
      'meta',
      'noscript',
      'link',
    ]);
  }
}
