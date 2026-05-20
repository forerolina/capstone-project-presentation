<!-- Mesh-style animated background (book page only) — colors from Paper MeshGradient -->
<div class="book-shader-bg" aria-hidden="true">
	<div class="book-shader-bg__base"></div>
	<div class="book-shader-bg__blob book-shader-bg__blob--cyan"></div>
	<div class="book-shader-bg__blob book-shader-bg__blob--teal"></div>
	<div class="book-shader-bg__blob book-shader-bg__blob--deep"></div>
	<div class="book-shader-bg__blob book-shader-bg__blob--orange"></div>
	<div class="book-shader-bg__blob book-shader-bg__blob--cyan-2"></div>
	<div class="book-shader-bg__mesh book-shader-bg__mesh--overlay"></div>
</div>

<style>
	.book-shader-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		isolation: isolate;
	}

	.book-shader-bg__base {
		position: absolute;
		inset: 0;
		background: #000000;
	}

	.book-shader-bg__blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(64px);
		opacity: 0.9;
		will-change: transform;
	}

	.book-shader-bg__blob--cyan {
		width: min(70vw, 520px);
		height: min(70vw, 520px);
		background: #06b6d4;
		top: -10%;
		left: -5%;
		animation: book-blob-cyan 16s ease-in-out infinite;
	}

	.book-shader-bg__blob--teal {
		width: min(60vw, 480px);
		height: min(60vw, 480px);
		background: #0891b2;
		top: 5%;
		right: -8%;
		animation: book-blob-teal 20s ease-in-out infinite reverse;
	}

	.book-shader-bg__blob--deep {
		width: min(65vw, 500px);
		height: min(65vw, 500px);
		background: #164e63;
		bottom: -15%;
		right: 10%;
		animation: book-blob-deep 22s ease-in-out infinite;
	}

	.book-shader-bg__blob--orange {
		width: min(55vw, 420px);
		height: min(55vw, 420px);
		background: #f97316;
		bottom: 0;
		left: 5%;
		animation: book-blob-orange 18s ease-in-out infinite reverse;
	}

	.book-shader-bg__blob--cyan-2 {
		width: min(50vw, 380px);
		height: min(50vw, 380px);
		background: #06b6d4;
		top: 40%;
		left: 35%;
		opacity: 0.55;
		animation: book-blob-cyan-2 14s ease-in-out infinite;
	}

	.book-shader-bg__mesh--overlay {
		position: absolute;
		inset: -30%;
		width: 160%;
		height: 160%;
		opacity: 0.5;
		mix-blend-mode: screen;
		filter: blur(48px);
		background:
			radial-gradient(ellipse 45% 40% at 30% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
			radial-gradient(ellipse 50% 45% at 70% 30%, rgba(6, 182, 212, 0.6) 0%, transparent 55%),
			radial-gradient(ellipse 40% 35% at 20% 70%, rgba(249, 115, 22, 0.5) 0%, transparent 50%);
		animation: book-mesh-overlay 24s ease-in-out infinite alternate-reverse;
	}

	@keyframes book-blob-cyan {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(18vw, 22vh) scale(1.15);
		}
	}

	@keyframes book-blob-teal {
		0%,
		100% {
			transform: translate(0, 0) scale(1.05);
		}
		50% {
			transform: translate(-20vw, 18vh) scale(0.95);
		}
	}

	@keyframes book-blob-deep {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(-15vw, -20vh) scale(1.2);
		}
	}

	@keyframes book-blob-orange {
		0%,
		100% {
			transform: translate(0, 0) scale(1.1);
		}
		50% {
			transform: translate(22vw, -12vh) scale(0.9);
		}
	}

	@keyframes book-blob-cyan-2 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(-25vw, 10vh) scale(1.25);
		}
		66% {
			transform: translate(15vw, -18vh) scale(0.85);
		}
	}

	@keyframes book-mesh-overlay {
		0% {
			transform: translate(0%, 0%) rotate(0deg);
		}
		100% {
			transform: translate(8%, -6%) rotate(8deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.book-shader-bg__blob,
		.book-shader-bg__mesh--overlay {
			animation: none;
		}
	}
</style>
