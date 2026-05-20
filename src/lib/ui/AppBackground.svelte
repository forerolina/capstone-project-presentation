<div class="app-bg" aria-hidden="true">
	<div class="app-bg__glow"></div>
</div>

<style>
	.app-bg {
		position: fixed;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
		background: var(--color-background);
	}

	.app-bg__glow {
		position: absolute;
		inset: -20%;
		background:
			radial-gradient(ellipse 80% 60% at 10% 0%, rgba(76, 214, 255, 0.35), transparent 55%),
			radial-gradient(ellipse 70% 50% at 90% 10%, rgba(81, 210, 216, 0.28), transparent 50%),
			radial-gradient(ellipse 60% 40% at 50% 100%, rgba(183, 234, 255, 0.25), transparent 55%);
		filter: blur(40px);
		opacity: 0.9;
	}

	.app-bg__glow::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 50% 40% at 70% 30%, rgba(253, 137, 85, 0.12), transparent 50%),
			radial-gradient(ellipse 40% 35% at 20% 70%, rgba(0, 209, 255, 0.15), transparent 45%);
		animation: bg-drift 90s linear infinite;
	}

	@keyframes bg-drift {
		from {
			transform: translate(0, 0) scale(1);
		}
		to {
			transform: translate(2%, -1%) scale(1.02);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.app-bg__glow::after {
			animation: none;
		}
	}
</style>
