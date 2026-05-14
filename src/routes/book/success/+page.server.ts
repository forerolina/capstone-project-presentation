import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	return { sessionId: url.searchParams.get('session_id') };
};
