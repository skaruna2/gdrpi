import App from './Login.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;