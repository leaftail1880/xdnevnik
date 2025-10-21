import { HoursMinutes } from '@/components/SelectTime'
import { Logger } from '@/constants'
import { NSEntity } from '@/services/net-school/entities'
import { StudentsStore } from '@/services/net-school/store'
import { makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { makeReloadPersistable } from '../utils/makePersistable'

export interface CustomSubjectMeeting {
	dayIndex: number
	startTime: HoursMinutes
	time: number
	sendNotificationBeforeMins: number
}

export interface CustomSubject {
	name: string
	meetings: CustomSubjectMeeting[]
}

export interface StudentSettings {
	/**
	 * Map containing subjectIds as keys and overrided subjectName as value
	 */
	subjectNames: Record<string, string | undefined>

	/**
	 * Map containing days as keys and map of lesson.localOverrideId as keys and overriden subjectNames as value
	 */
	subjectNamesDay: Record<string, string | undefined>

	customSubjects: CustomSubject[]

	lessonOrder: Record<number, Record<string, number> | undefined>
	subjectAttestation: Record<string, number>
	defaultAttestation: number

	/**
	 * Current term of the student
	 */
	currentTermv2?: NSEntity

	targetMark?: number
	defaultMark?: number
	defaultMarkWeight?: number

  ignoreLessons?: string[]
}

class SettingsStore {
	studentIndex = 0

	notificationsEnabled = Platform.select({
		android: true,

		default: false,
	})

	lessonNotifications = true
	marksNotifications = true

	nameFormat: 'fio' | 'ifo' = 'ifo'
	currentTotalsOnly = false
	markStyle: 'background' | 'border' = 'background'
	// showMarkWeightTip = true
	collapseLongAssignmentText = false
	targetMarkCompact = false

	newDatePicker = true

	markRoundAdd = -0.1

	overrideTimeD = Date.now()
	useOverrideTime = false

	/**
	 * Map containing per student overrides
	 */
	studentOverrides: Record<string, StudentSettings | undefined> = {}

	get studentId() {
		const student =
			StudentsStore.result && StudentsStore.result[XSettings.studentIndex]
		if (student) return student.studentId
	}

	forStudent(id: number): StudentSettings {
		const defaultValue: StudentSettings = {
			subjectNames: {},
			lessonOrder: {},
			subjectNamesDay: {},
			customSubjects: [],
			subjectAttestation: {},
			defaultAttestation: 0,
		}
		const overrides = this.studentOverrides[id]

		if (overrides) {
			runInAction(() => {
				for (const [k, v] of Object.entries(defaultValue)) {
					overrides[k as keyof StudentSettings] ??= v
				}
			})
			return overrides
		} else {
			runInAction(() => (this.studentOverrides[id] = defaultValue))

			const overrides = this.studentOverrides[id]
			if (overrides) {
				return overrides
			} else {
				Logger.warn(new Error('Overrides are UNDEFINED.'))
				return defaultValue
			}
		}
	}

	forStudentOrThrow() {
		const { studentId } = this
		if (!studentId)
			throw new TypeError(
				'Unable to get settings for student: StudentID is undefined!',
			)
		return this.forStudent(studentId)
	}

	constructor() {
		makeAutoObservable(this, {
			forStudent: false,
			forStudentOrThrow: false,
			fullname: false,
			studentId: false,
		})

		const clearOverrides = (value: this['studentOverrides']) => {
			runInAction(() => {
				for (const override of Object.values(value)) {
					if (override) Reflect.deleteProperty(override, 'save')
				}
			})

			return value
		}

		makeReloadPersistable(this, {
			name: 'settings',
			properties: [
				...(Object.keys(this) as unknown as (keyof this)[]).filter(
					e => typeof this[e] !== 'function' && e !== 'studentOverrides',
				),
				{
					key: 'studentOverrides',
					deserialize: clearOverrides,
					serialize: clearOverrides,
				},
			],
		})
	}

	save(value: Partial<Omit<this, 'save'>>) {
		Object.assign(this, value)
	}

	fullname(name: string) {
		if (this.nameFormat === 'ifo') {
			const parts = name.split(' ')
			return [parts[1], parts[2], parts[0]].join(' ')
		} else {
			return name
		}
	}
}

export const XSettings = new SettingsStore() as Readonly<SettingsStore>
