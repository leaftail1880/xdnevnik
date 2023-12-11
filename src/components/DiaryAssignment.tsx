import { useState } from 'react'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Assignment } from '../NetSchool/classes'
import { SmallButton } from './Button'
import { Mark } from './Mark'

// TODO support attachment

export function DiaryAssignment({ assignment }: { assignment: Assignment }) {
	const [showHw, setShowHw] = useState(
		// Do not show long hw by default
		// assignment.assignmentTypeName.length < 20
		true
	)
	return (
		<View
			row
			spread
			centerV
			style={{ width: '100%' }}
			marginV-s1
			backgroundColor={Colors.rgba(Colors.$backgroundPrimaryMedium, 0.1)}
			paddingV-s1
			br20
		>
			<View row marginH-s1 style={{ width: '80%' }}>
				{assignment.assignmentTypeName && (
					<SmallButton
						onPress={() => setShowHw(!showHw)}
						style={{
							borderColor: Colors.$textAccent,
							borderWidth: 2,
							width: 45,
							height: 45,
							alignSelf: 'center',
						}}
						centerH
						centerV
						br20
					>
						<Text $textAccent margin-s1>
							{assignment.assignmentTypeAbbr}
						</Text>
					</SmallButton>
				)}
				{showHw && (
					<Text
						$textAccent
						margin-s2
						style={{ width: '85%', alignSelf: 'center' }}
						selectable
					>
						{assignment.assignmentTypeName}: {assignment.assignmentName}
					</Text>
				)}
			</View>

			<View row center>
				<Mark
					mark={assignment.result ?? 'Нет'}
					duty={assignment.duty}
					markWeight={{
						max: assignment.weight,
						min: assignment.weight,
						current: assignment.weight,
					}}
					style={{
						width: 45,
						height: 45,
						padding: 0,
						alignSelf: 'center',
					}}
					textStyle={{ fontSize: 16 }}
					subTextStyle={{ fontSize: 14, alignSelf: 'center' }}
				/>
			</View>
		</View>
	)
}
