<script lang="ts">
	let { children } = $props();
</script>

<div class="book-page">
	<main class="page page--wide book-page__main">
		{@render children()}
	</main>
</div>

<style>
	.book-page {
		position: relative;
		z-index: 1;
		min-height: 100vh;
	}

	.book-page__main {
		position: relative;
		z-index: 1;
	}

	.book-page :global(.ui-page-header__main) {
		flex-wrap: nowrap;
		align-items: flex-start;
	}

	.book-page :global(.ui-page-header__text) {
		min-width: 0;
		flex: 1 1 0%;
	}

	.book-page :global(.ui-page-header__title-row) {
		min-width: 0;
		align-items: flex-start;
	}

	.book-page :global(.ui-page-header__actions) {
		flex-shrink: 0;
		margin-left: auto;
	}

	.book-page :global(.ui-page-header h1) {
		min-width: 0;
		max-width: 100%;
		overflow: visible;
		text-overflow: unset;
		white-space: normal;
		overflow-wrap: break-word;
		color: #ffffff;
	}

	@media (min-width: 48rem) {
		.book-page :global(.ui-page-header h1) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.book-page :global(.book-tagline) {
		margin: 0;
		font-size: var(--text-body-md-size);
		color: rgba(255, 255, 255, 0.7);
	}

	.book-page :global(.footer-links a) {
		color: rgba(255, 255, 255, 0.85);
	}

	.book-page :global(.footer-links a:hover) {
		color: #ffffff;
	}
</style>
