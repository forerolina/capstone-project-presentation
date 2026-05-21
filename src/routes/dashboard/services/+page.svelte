<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { formatDurationMinutes, type BookingServiceOption } from '$lib/booking/service-catalog';
	import ServiceFormModal from '$lib/components/ServiceFormModal.svelte';
	import { Button, Card, HeaderAddButton, PageHeader } from '$lib/ui';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateModal = $state(false);
	let editingService = $state<BookingServiceOption | null>(null);

	const undoPayload = $derived(
		form && 'undo' in form && form.undo ? form.undo : null
	);

	const pageNotice = $derived.by(() => {
		if (!form) return null;
		if ('restored' in form && form.restored && 'restoredName' in form && form.restoredName) {
			return {
				tone: 'success' as const,
				text: `"${form.restoredName}" was added back to your catalog.`
			};
		}
		if ('warning' in form && form.warning) {
			return { tone: 'warning' as const, text: form.warning };
		}
		if ('message' in form && form.message && !('modal' in form)) {
			return { tone: 'error' as const, text: form.message };
		}
		return null;
	});

	const editFormState = $derived.by(() => {
		if (!editingService) return null;

		const isEditFailure = form && 'modal' in form && form.modal === 'edit';
		const serviceId =
			isEditFailure && 'serviceId' in form && typeof form.serviceId === 'string'
				? form.serviceId
				: editingService.id;

		const service =
			data.services.find((s) => s.id === serviceId) ?? editingService;

		return {
			serviceId: service.id,
			name:
				isEditFailure && 'name' in form && typeof form.name === 'string'
					? form.name
					: service.name,
			durationMinutes:
				isEditFailure &&
				'durationMinutes' in form &&
				typeof form.durationMinutes === 'string' &&
				form.durationMinutes !== ''
					? Number(form.durationMinutes)
					: service.durationMinutes,
			fieldErrors: isEditFailure && 'fieldErrors' in form ? (form.fieldErrors ?? {}) : {},
			message: isEditFailure && 'message' in form ? (form.message ?? null) : null
		};
	});

	const createFormState = $derived.by(() => {
		if (!showCreateModal) return null;
		const isCreateFailure = form && 'modal' in form && form.modal === 'create';
		return {
			fieldErrors: isCreateFailure && 'fieldErrors' in form ? (form.fieldErrors ?? {}) : {},
			message: isCreateFailure && 'message' in form ? (form.message ?? null) : null,
			name: isCreateFailure && 'name' in form && typeof form.name === 'string' ? form.name : '',
			durationMinutes:
				isCreateFailure &&
				'durationMinutes' in form &&
				typeof form.durationMinutes === 'string' &&
				form.durationMinutes !== ''
					? Number(form.durationMinutes)
					: null
		};
	});

	$effect(() => {
		if (form && 'success' in form && form.success) {
			showCreateModal = false;
			editingService = null;
		}
		if (form && 'modal' in form && form.modal === 'create') {
			showCreateModal = true;
			editingService = null;
		}
		if (form && 'modal' in form && form.modal === 'edit' && 'serviceId' in form && form.serviceId) {
			const match = data.services.find((s) => s.id === form.serviceId);
			if (match) editingService = match;
		}
	});

	function openCreate() {
		editingService = null;
		showCreateModal = true;
	}

	function openEdit(service: BookingServiceOption) {
		showCreateModal = false;
		editingService = service;
	}

	function closeModals() {
		showCreateModal = false;
		editingService = null;
	}
</script>

<main class="page page--wide">
	<PageHeader title="Services" borderless>
		{#snippet titleAddon()}
			<HeaderAddButton label="Add service" onclick={openCreate} />
		{/snippet}

		{#snippet actions()}
			<form method="post" action="?/signOut" use:enhance class="services-sign-out">
				<Button variant="secondary" type="submit">Sign out</Button>
			</form>
		{/snippet}

		<div class="services-toolbar">
			<p class="services-toolbar__tagline text-muted">
				What clients can book, and how long each visit takes.
			</p>
			<nav class="breadcrumb services-toolbar__breadcrumb" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/book')}>Book</a></li>
					<li><a href={resolve('/dashboard')}>Dashboard</a></li>
					<li><span aria-current="page">Services</span></li>
				</ol>
			</nav>
		</div>
	</PageHeader>

	{#if pageNotice}
		<div
			class="services-page-notice"
			class:services-page-notice--warning={pageNotice.tone === 'warning'}
			class:services-page-notice--success={pageNotice.tone === 'success'}
			class:services-page-notice--error={pageNotice.tone === 'error'}
			role="status"
		>
			<p class="services-page-notice__text">{pageNotice.text}</p>
			{#if pageNotice.tone === 'warning' && undoPayload}
				<form
					method="post"
					action="?/undoDeleteService"
					class="services-page-notice__undo"
					use:enhance
				>
					<input type="hidden" name="id" value={undoPayload.id} />
					<input type="hidden" name="name" value={undoPayload.name} />
					<input type="hidden" name="durationMinutes" value={undoPayload.durationMinutes} />
					<input type="hidden" name="appointmentIds" value={undoPayload.appointmentIds.join(',')} />
					<Button variant="tertiary" type="submit">Undo</Button>
				</form>
			{/if}
		</div>
	{/if}

	<section class="section" aria-labelledby="services-list-heading">
		<h2 id="services-list-heading" class="visually-hidden">Service list</h2>

		{#if data.services.length === 0}
			<Card class="services-list__card">
				<p class="services-empty text-muted">No services yet. Add one so clients can book online.</p>
				<Button variant="primary" type="button" onclick={openCreate}>Add service</Button>
			</Card>
		{:else}
			<ul class="services-list">
				{#each data.services as service (service.id)}
					<li>
						<Card class="services-list__card">
							<div class="services-list__row">
								<div class="services-list__main">
									<p class="services-list__name text-label-md">{service.name}</p>
									<span class="services-list__sep text-muted" aria-hidden="true">·</span>
									<p class="services-list__duration text-muted">
										{formatDurationMinutes(service.durationMinutes)}
									</p>
								</div>
								<div class="services-list__actions">
									<Button variant="secondary" type="button" onclick={() => openEdit(service)}>
										Edit
									</Button>
									<form method="post" action="?/deleteService" use:enhance>
										<input type="hidden" name="serviceId" value={service.id} />
										<Button variant="tertiary" type="submit">Remove</Button>
									</form>
								</div>
							</div>
						</Card>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

{#if showCreateModal && createFormState}
	<ServiceFormModal
		mode="create"
		name={createFormState.name}
		durationMinutes={createFormState.durationMinutes}
		fieldErrors={createFormState.fieldErrors}
		message={createFormState.message}
		onClose={closeModals}
	/>
{/if}

{#if editingService && editFormState}
	<ServiceFormModal
		mode="edit"
		serviceId={editFormState.serviceId}
		name={editFormState.name}
		durationMinutes={editFormState.durationMinutes}
		fieldErrors={editFormState.fieldErrors}
		message={editFormState.message}
		onClose={closeModals}
	/>
{/if}

<style>
	.services-sign-out {
		margin: 0;
	}

	.services-toolbar {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.services-toolbar__tagline {
		margin: 0;
		font-size: var(--text-body-md-size);
		line-height: var(--text-body-md-line);
	}

	.services-toolbar__breadcrumb :global(ol) {
		margin: 0;
	}

	.services-page-notice {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
		margin: 0 0 1.5rem;
	}

	.services-page-notice__text {
		margin: 0;
		flex: 1 1 12rem;
		font-size: var(--text-label-md-size);
		font-weight: 500;
		line-height: 1.45;
	}

	.services-page-notice__undo {
		margin: 0;
		flex-shrink: 0;
	}

	.services-page-notice--warning {
		padding: 0.75rem 1rem;
		color: var(--color-on-secondary-fixed);
		background: var(--color-secondary-fixed);
		border-radius: var(--radius-default);
		border: 1px solid var(--color-secondary-container);
	}

	.services-page-notice--success {
		padding: 0.75rem 1rem;
		color: var(--color-on-tertiary-fixed);
		background: var(--color-tertiary-fixed);
		border-radius: var(--radius-default);
		border: 1px solid var(--color-tertiary-container);
	}

	.services-page-notice--error {
		padding: 0.75rem 1rem;
		color: var(--color-on-error-container);
		background: var(--color-error-container);
		border-radius: var(--radius-default);
		border: 1px solid var(--color-error);
	}

	.services-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
		width: 100%;
		min-width: 0;
	}

	.services-list > li {
		min-width: 0;
	}

	:global(.services-list__card.ui-card) {
		padding: 1rem 1.25rem;
	}

	:global(.section .ui-card:not(.services-list__card)) {
		padding: 1rem 1.25rem;
	}

	.services-list__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem 1.5rem;
		min-width: 0;
	}

	.services-list__main {
		display: flex;
		flex-wrap: nowrap;
		align-items: baseline;
		gap: 0.25rem 0.75rem;
		min-width: 0;
		overflow: hidden;
	}

	.services-list__name {
		margin: 0;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.services-list__duration {
		margin: 0;
		font-size: var(--text-body-md-size);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.services-list__sep {
		flex-shrink: 0;
		user-select: none;
	}

	.services-list__actions {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.services-list__actions form {
		margin: 0;
	}

	.services-empty {
		margin: 0 0 1rem;
	}
</style>
