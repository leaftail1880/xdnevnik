import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { Picker } from "@react-native-picker/picker";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableHighlight,
	View,
} from "react-native";
import "react-native-gesture-handler";
import SelectDropdown from "react-native-select-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";

// TODO implement caching/request from files while in dev
// TODO implement actual cookie saver/parser and try it on build

import { URL } from "react-native-url-polyfill";
import NetSchoolApi, { Endpoints } from "./src/NetSchool/api";
import Diary from "./src/NetSchool/classes/Diary";
import { School } from "./src/NetSchool/classes/SchoolSearch";
import { text } from "./src/lang";

console.log(" ");
console.log(" ");
console.log("reload");
console.log(" ");

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

const ACCENT_COLOR = "#88f";
const RED_ACCENT_COLOR = "#f88";
const SECONDARY_COLOR = "#888";
const BUTTON_TEXT_COLOR = "#fff";
const NOTIFICATION_COLOR = "#8888ff";

let user: NetSchoolApi | null = null;

const InputField = (props) => (
	<TextInput
		style={styles.text_field}
		placeholder={props.placeholder}
		onChangeText={props.onChangeText}
		secureTextEntry={props.isPassword}
		autoComplete={props.autoComplete}
	/>
);

declare global {
	interface Date {
		getDayMon(): number;
	}
}

const Tab = createBottomTabNavigator();

export default function App() {
	const todayDate = new Date();
	const today = todayDate.toISOString().split("T")[0];
	let days = [];
	for (let i = 0; i < 7; i++)
		days.push(
			new Date(
				new Date().getTime() - (todayDate.getDayMon() - i) * 1000 * 60 * 60 * 24
			)
				.toISOString()
				.split("T")[0]
		);

	const [notification, setNotification] = useState<
		Notifications.Notification | false
	>(false);
	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();

	const registerNotificationsSchedule = async () => {
		if (Platform.OS === "android")
			await Notifications.setNotificationChannelAsync("default", {
				name: "Default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: NOTIFICATION_COLOR,
			});

		if (Device.isDevice) {
			let { status } = await Notifications.getPermissionsAsync();
			if (status !== "granted") {
				({ status } = await Notifications.requestPermissionsAsync());
			}
			if (status !== "granted") {
				Alert.alert("Включи уведомления!");
				return;
			}
		} else Alert.alert("Уведомления недоступны вне устройства");
	};

	useEffect(() => {
		registerNotificationsSchedule();

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log("NotificationResponseReceivedListener", response);
			});

		return () => {
			Notifications.removeNotificationSubscription(
				notificationListener.current
			);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	const [schedule, setSchedule] = useState([]);
	const [diary, setDiary] = useState<Diary>(null);
	const [student, setStudent] = useState("0");
	const [selDay, setSelDay] = useState(today);
	const [selWeek, setSelWeek] = useState("this");
	const [homework, setHomework] = useState([]);
	const [homework2, setHomework2] = useState([]);
	const [marks, setMarks] = useState([]);
	const [loggingIn, setLoggingIn] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [notificationsToggled, setNotificationsToggled] = useState(false);

	useEffect(() => {
		(async () => {
			console.log("useEffect::setting loader");
			const notifications = await AsyncStorage.getItem("notifications");
			if (!notification) await AsyncStorage.setItem("notifications", "no");
			setNotificationsEnabled(notifications == "yes");

			const student = (await AsyncStorage.getItem("student")) ?? "0";
			setStudent(student);
		})();
		return () => null;
	}, []);

	function selectStudent(student: string) {
		setStudent(student);
		AsyncStorage.setItem("student", student);
	}

	useEffect(() => {
		if (!user?.context) return;
		const studentId = user.context.students[parseInt(student)]?.id;

		console.log({ studentId, student, p: parseInt(student) });
		if (!studentId) return;
		user
			.diary({
				studentId,
				start: new Date(2023, 10, 1),
				end: new Date(2023, 9, 25),
			})
			.then(setDiary);
	}, [student, user]);

	useEffect(() => {
		console.log("useEffect::notification sheduller");
		if (!notificationsToggled) return () => null;
		AsyncStorage.setItem("notifications", notificationsEnabled ? "yes" : "no");
		(async () => {
			if (notificationsEnabled) {
				if (schedule.length > 0) {
					for (let i of schedule) {
						if (i.schedules.length == 0) continue;
						let date = new Date(`${i.date} ${i.period_start}`);
						date = new Date(date.getTime() - 5 * 60 * 1000);
						Notifications.scheduleNotificationAsync({
							content: {
								title: `${i.schedules[0].group.subject.subject_name} ${i.schedules[0].room.room_name}`,
								body: `${i.period_shortname} ${i.period_name} ${i.period_start}`,
							},
							trigger: {
								repeats: true,
								weekday: date.getDay() + 1,
								hour: date.getHours(),
								minute: date.getMinutes(),
							},
						});
						console.log(
							"Scheduled",
							`${i.schedules[0].group.subject.subject_name} ${i.schedules[0].room.room_name}`,
							date
						);
					}
				}
			} else {
				await Notifications.cancelAllScheduledNotificationsAsync();
			}
		})();

		return () => null;
	}, [notificationsEnabled, schedule]);

	const generateTable = () => {
		let col = [];
		for (let i of schedule) {
			if (i.date != selDay) continue;
			if (i.schedules.length != 0)
				col.push(
					<View>
						<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
							{`(${i.period_start} - ${i.period_end}) ${i.schedules[0].group.subject.subject_name}\n`}
						</Text>
						<Text style={styles.buttonText}>
							{i.schedules[0].group.group_name +
								" " +
								i.schedules[0].room.room_name +
								"\n"}
						</Text>
						<Text
							style={{ fontSize: 8, ...styles.buttonText }}
						>{`${i.period_name} (${i.period_shortname})`}</Text>
					</View>
				);
		}
		return col;
	};
	const generateHomework = () => {
		let col = [];
		const hw = selWeek == "this" ? homework : homework2;
		for (let i in hw)
			for (let j of hw[i]) {
				if (j.task == "") continue;
				col.push(
					<View>
						<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
							{j.name + "\n"}
						</Text>
						<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
							{[
								text["monday"],
								text["tuesday"],
								text["wednesday"],
								text["thursday"],
								text["friday"],
								text["saturday"],
								text["sunday"],
							][i] + "\n"}
						</Text>
						<Text style={styles.buttonText}>{j.task}</Text>
						<Text>
							{j.link ? (
								<TouchableHighlight onPress={() => Linking.openURL(j.link)}>
									<Text
										style={{
											...styles.buttonText,
											textDecorationLine: "underline",
											fontSize: 30,
										}}
									>
										{text["link"]}
									</Text>
								</TouchableHighlight>
							) : (
								<Text style={styles.buttonText}>{text["no_link"]}</Text>
							)}
						</Text>
					</View>
				);
			}
		return col;
	};
	const generateMarks = () => {
		let col = [];
		for (let i of marks) {
			if (
				i.formative_list.length == 0 &&
				i.summative_list.length == 0 &&
				i.final_mark_list == 0
			)
				continue;
			col.push(
				<View>
					<Text style={{ fontSize: 25, ...styles.buttonText }}>
						{i.group.subject.subject_name}
					</Text>
					<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
						{text["avg_summative"] + i.summative_avg_value}
					</Text>
					<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
						{text["avg_formative"] + i.formative_avg_value}
					</Text>
					<Text style={{ fontWeight: "bold", ...styles.buttonText }}>
						{text["avg_final"] + i.result_final_mark}
					</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
						{i.formative_list.map((x) => (
							<Pressable
								onPress={() => Alert.alert(x.lesson_thema, x.created_at)}
								style={styles.invertedSchedule_item}
							>
								<Text style={styles.invertedButtonText}>
									{(x.mark_criterion ?? "F") + " " + x.mark_value}
								</Text>
							</Pressable>
						))}
					</View>
					<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
						{i.summative_list.map((x) => (
							<Pressable
								onPress={() => Alert.alert(x.lesson_thema, x.created_at)}
								style={styles.invertedSchedule_item}
							>
								<Text style={styles.invertedButtonText}>
									{(x.mark_criterion ?? "F") + " " + x.mark_value}
								</Text>
							</Pressable>
						))}
					</View>
					<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
						{i.final_mark_list.map((x) => (
							<Pressable
								onPress={() => Alert.alert(x.lesson_thema, x.created_at)}
								style={styles.invertedSchedule_item}
							>
								<Text style={styles.invertedButtonText}>
									{(x.mark_criterion ?? "F") + " " + x.mark_value}
								</Text>
							</Pressable>
						))}
					</View>
				</View>
			);
		}
		return col;
	};

	const loggerFromMemory = useRef<() => Promise<void>>();
	const logging = useRef(false);
	useEffect(() => {
		console.log("effect::loggingFromMemory, " + logging.current);
		if (logging.current) return;
		logging.current = true;
		loggerFromMemory
			.current?.()
			.catch(console.error)
			.finally(() => (logging.current = false));
	}, []);

	// Get cookies for a url
	CookieManager.get("http://example.com").then((cookies) => {
		console.log("CookieManager.get =>", cookies);
	});

	const LoginScreen = () => {
		if (user?.context) return LogoutScreen();

		loggerFromMemory.current = async () => {
			if (!user?.context) {
				const loadedEndpoint = await AsyncStorage.getItem("endpoint");
				const loadedLogin = await AsyncStorage.getItem("login");
				if (loadedLogin && loadedEndpoint) {
					reinitClientWithNewEndpoint(loadedEndpoint);
					console.log("autologin::loaded");
					await login(() => {}, loadedLogin);
				}
			}
		};

		if (logging.current)
			return (
				<View style={styles.container}>
					<Text style={{ fontSize: 15 }}>
						Вход по сохраненному паролю/логину...
					</Text>
				</View>
			);

		const [endpoints, setEndpoints] = useState<Endpoints>();
		useEffect(() => {
			NetSchoolApi.getEndpoints().then(setEndpoints);
		}, []);

		function reinitClientWithNewEndpoint(endpoint: string) {
			console.log("reinit client with endpoint: '" + endpoint + "'");
			if (!endpoint) return;
			try {
				console.log(new URL(endpoint).origin);
			} catch {
				return;
			}

			user = new NetSchoolApi(endpoint);
		}

		const [selectedRegion, setSelectedRegion] = useState("");
		const [schools, setSchools] = useState<School[]>();
		const [school, setSchool] = useState<School>();

		const [uname, setUname] = useState("");
		const [pwd, setPwd] = useState("");

		async function login(onLogin?: () => void, savedCredentials?: string) {
			try {
				if ((!user || !uname || !pwd || !school) && !savedCredentials)
					throw new Error("No data to login");

				setLoggingIn(true);
				const credentials = await user.logIn(
					savedCredentials
						? JSON.parse(savedCredentials)
						: {
								login: uname,
								password: pwd,
								school,
						  }
				);
				await AsyncStorage.setItem("login", JSON.stringify(credentials));
				setLoggingIn(false);
				if (onLogin) onLogin();
			} catch (_) {
				console.error("LoginFailedError", _);
				Alert.alert("Авторизация не удалась", _?.message ?? _);
				setLoggingIn(false);
			}
		}

		return (
			<View style={styles.container}>
				{!selectedRegion &&
					(endpoints ? (
						<ScrollView style={{ margin: 0, padding: 0, minWidth: 350 }}>
							{endpoints.map((endpoint, index) => (
								<Pressable
									style={{ ...styles.button, margin: 5, padding: 15 }}
									key={index.toString()}
									onPress={() => {
										setSelectedRegion(endpoint.name);
										reinitClientWithNewEndpoint(endpoint.url);
										user.getSchools().then(setSchools);
										AsyncStorage.setItem("endpoint", endpoint.url);
									}}
								>
									<Text style={styles.buttonText}>{endpoint.name}</Text>
								</Pressable>
							))}
						</ScrollView>
					) : (
						<Text style={{ fontSize: 15 }}>Загрузка списка регионов...</Text>
					))}
				{selectedRegion && (
					<View style={{ margin: 0, padding: 0, minWidth: 400 }}>
						<Pressable
							style={styles.button}
							onPress={() => {
								setSelectedRegion("");
								setSchool(void 0);
							}}
						>
							<Text style={styles.buttonText}>
								{"<"} {selectedRegion}
							</Text>
						</Pressable>
						{schools ? (
							<SelectDropdown
								dropdownStyle={{
									minWidth: 350,
									minHeight: 450,
									borderRadius: 5,
								}}
								buttonStyle={{ ...styles.button, minWidth: 400 }}
								buttonTextStyle={{ ...styles.buttonText, fontSize: 14 }}
								defaultButtonText="Выбери школу"
								search
								searchInputStyle={{
									...styles.text_field,
									width: 300,
									alignSelf: "center",
								}}
								rowStyle={{ ...styles.option, padding: 1 }}
								rowTextStyle={{ ...styles.optionText, textAlign: "left" }}
								data={schools.map((e) => e.name)}
								onSelect={(selectedItem, index) => {
									console.log("selected school", selectedItem, index);
									setSchool(schools[index]);
								}}
							/>
						) : (
							<Text style={{ alignSelf: "center" }}>
								Загрузка списка школ...
							</Text>
						)}
						{school && (
							<View style={{ margin: 0, padding: 0 }}>
								<InputField
									placeholder={text["uname"]}
									onChangeText={setUname}
									autoComplete="username"
								/>
								<InputField
									placeholder={text["pwd"]}
									onChangeText={setPwd}
									isPassword={true}
									autoComplete="current-password"
								/>
								<Pressable
									style={styles.button}
									disabled={loggingIn}
									key={"key"}
									onPress={() => {
										if (loggingIn) return;

										if (uname == "")
											return Alert.alert(
												text["enter_username"],
												text["enter_username_2"]
											);
										if (pwd == "")
											return Alert.alert(
												text["enter_password"],
												text["enter_password_2"]
											);

										login(() =>
											Alert.alert(
												text["login_success"],
												text["login_success_2"]
											)
										);
									}}
								>
									<Text style={styles.buttonText}>
										{loggingIn ? text["logging_in"] : text["log_in"]}
									</Text>
								</Pressable>
							</View>
						)}
					</View>
				)}
			</View>
		);
	};
	const LogoutScreen = () => {
		const logout = async () => {
			await AsyncStorage.removeItem("login");
			await AsyncStorage.removeItem("endpoint");
			setSchedule([]);
			setHomework([]);
			setHomework2([]);
			setMarks([]);
			user = null;
		};
		return (
			<View style={styles.container}>
				<Pressable
					style={{ ...styles.button, backgroundColor: RED_ACCENT_COLOR }}
					onPress={() => logout()}
				>
					<Text style={styles.buttonText}>{text["log_out"]}</Text>
				</Pressable>
				<Text style={{ maxWidth: 300, textAlign: "center" }}>
					{text["log_out_info"]}
				</Text>
			</View>
		);
	};

	const ScheduleList = ({ data }) => {
		const schd = data.map((x) => <View style={styles.schedule_item}>{x}</View>);
		return <View>{schd}</View>;
	};

	const ScheduleScreen = () => {
		return (
			<ScrollView
				contentContainerStyle={{
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				<Picker
					style={{ alignSelf: "stretch" }}
					selectedValue={selDay}
					onValueChange={setSelDay}
				>
					<Picker.Item label={text["monday"]} value={days[0]} />
					<Picker.Item label={text["tuesday"]} value={days[1]} />
					<Picker.Item label={text["wednesday"]} value={days[2]} />
					<Picker.Item label={text["thursday"]} value={days[3]} />
					<Picker.Item label={text["friday"]} value={days[4]} />
					<Picker.Item label={text["saturday"]} value={days[5]} />
					<Picker.Item label={text["sunday"]} value={days[6]} />
				</Picker>
				<ScheduleList data={generateTable()} />
			</ScrollView>
		);
	};

	const HomeworkScreen = () => {
		return (
			<ScrollView
				contentContainerStyle={{
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				<Picker
					style={{ alignSelf: "stretch" }}
					selectedValue={selWeek}
					onValueChange={setSelWeek}
				>
					<Picker.Item label={text["this_week"]} value="this" />
					<Picker.Item label={text["next_week"]} value="next" />
				</Picker>
				<ScheduleList data={generateHomework()} />
			</ScrollView>
		);
	};

	const MarksScreen = () => {
		console.info("DIARY", diary);
		return (
			<ScrollView
				contentContainerStyle={{
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				<ScheduleList data={generateMarks()} />
			</ScrollView>
		);
	};

	const SettingsScreen = () => {
		return (
			<View
				style={{
					...styles.container,
					minWidth: 350,
					minHeight: 400,
					alignContent: "stretch",
				}}
			>
				{user && user.context && (
					<Picker
						style={{ width: 350 }}
						selectedValue={student.toString()}
						onValueChange={selectStudent}
					>
						{user.context.students.map((student, index) => {
							return (
								<Picker.Item
									label={student.name}
									key={student.name}
									value={index.toString()}
								/>
							);
						})}
					</Picker>
				)}
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						maxWidth: 350,
						margin: 15,
					}}
				>
					<Text style={{ flex: 1, flexDirection: "row" }}>
						{text["notification"]}
					</Text>
					<Switch
						trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
						thumbColor={notificationsEnabled ? ACCENT_COLOR : BUTTON_TEXT_COLOR}
						onValueChange={(value) => {
							setNotificationsToggled(true);
							setNotificationsEnabled(value);
						}}
						value={notificationsEnabled}
					/>
				</View>
				<View>
					<Text>Название: {Application.applicationName}</Text>
					<Text>Идентификатор: {Application.applicationId}</Text>
					<Text>Версия: {Application.nativeApplicationVersion}</Text>
					<Text>Версия сборки: {Application.nativeBuildVersion}</Text>
					<Text>{text["made_by"]}</Text>
				</View>
			</View>
		);
	};

	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						let iconName = {
							[text["s_log_in"]]: "log-in",
							[text["s_log_out"]]: "log-out",
							[text["s_schedule"]]: "time",
							[text["s_marks"]]: "school",
							[text["s_homework"]]: "document",
							[text["s_settings"]]: "settings",
						}[route.name];
						if (focused) iconName += "-outline";
						return <Ionicons name={iconName} size={size} color={color} />;
					},
					tabBarActiveTintColor: ACCENT_COLOR,
					tabBarInactiveTintColor: SECONDARY_COLOR,
				})}
			>
				<Tab.Screen
					name={user?.context ? text["s_log_out"] : text["s_log_in"]}
					component={LoginScreen}
				/>
				<Tab.Screen name={text["s_schedule"]} component={ScheduleScreen} />
				<Tab.Screen name={text["s_marks"]} component={MarksScreen} />
				<Tab.Screen name={text["s_homework"]} component={HomeworkScreen} />
				<Tab.Screen name={text["s_settings"]} component={SettingsScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	text_field: {
		margin: 15,
		padding: 15,
		borderColor: ACCENT_COLOR,
		borderWidth: 3,
		borderRadius: 5,
		minWidth: 250,
	},
	button: {
		margin: 15,
		padding: 15,
		backgroundColor: ACCENT_COLOR,
		alignItems: "center",
		borderRadius: 5,
		minWidth: 250,
		elevation: 3,
	},
	buttonText: {
		color: BUTTON_TEXT_COLOR,
	},
	invertedSchedule_item: {
		margin: 15,
		padding: 15,
		backgroundColor: BUTTON_TEXT_COLOR,
		borderRadius: 5,
		alignSelf: "flex-start",
		elevation: 3,
	},
	invertedButtonText: {
		color: ACCENT_COLOR,
	},
	schedule_item: {
		margin: 15,
		padding: 15,
		backgroundColor: ACCENT_COLOR,
		borderRadius: 5,
		minWidth: 250,
		elevation: 3,
	},
	option: {
		padding: 15,
		borderBottomWidth: 1.5,
		borderBottomColor: SECONDARY_COLOR,
		flexDirection: "row",
	},
	optionText: {
		fontSize: 18,
		color: ACCENT_COLOR,
		flex: 1,
		justifyContent: "flex-start",
	},
	optionArrow: {
		color: ACCENT_COLOR,
		justifyContent: "flex-end",
	},
});

