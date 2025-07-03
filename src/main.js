import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import { supabase } from './supabase';

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
