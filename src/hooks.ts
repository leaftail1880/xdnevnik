import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useCaching<T extends Record<string, string>>(
	key: string,
	getter: () => Promise<T>
) {
	const [state, setState] = useState<T | null>(null);

	useEffect(() => {
		(async () => {
			let value: T;
			try {
				value = await getter();
			} catch {
				value = JSON.parse(await AsyncStorage.getItem(key));
			}
			setState(value);
		})();
	}, []);

	async function saveState(value: T) {
		setState(value);
		await AsyncStorage.setItem(key, JSON.stringify(value));
	}

	return [state, saveState];
}

export function useStorage<T>(key: string, defaultValue: T) {
	const [state, setState] = useState<T>(defaultValue);

	useEffect(() => {
		AsyncStorage.getItem(key).then(JSON.parse).then(setState);
	}, []);

	async function saveState(value: T) {
		setState(value);
		await AsyncStorage.setItem(key, JSON.stringify(value));
	}

	return [state, saveState];
}
