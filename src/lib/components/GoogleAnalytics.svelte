<script>
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import { browser } from '$app/environment';

  let { gaId } = $props();

  afterNavigate(() => {
    if (!browser || !gaId) return;

    // Manually send page_view event on navigation
    // We assume window.gtag is available because of the script in svelte:head
    if (typeof window.gtag === 'function') {
        window.gtag('config', gaId, {
            page_path: $page.url.pathname + $page.url.search,
            page_title: document.title
        });
    }
  });
</script>

<svelte:head>
  {#if gaId}
    <script async src="https://www.googletagmanager.com/gtag/js?id={gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '{gaId}', { send_page_view: false });
    </script>
  {/if}
</svelte:head>
