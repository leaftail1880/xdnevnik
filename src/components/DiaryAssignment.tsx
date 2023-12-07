import { useState } from 'react'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Assignment } from '../NetSchool/classes'
import { SmallButton } from './Button'
import { Mark } from './Mark'

export function DiaryAssignment({ assignment }: { assignment: Assignment }) {
	const [showHw, setShowHw] = useState(
		// Do not show long hw by default
		assignment.assignmentTypeName.length < 20
	)
	return (
		<View row spread centerV style={{ width: '100%' }} marginB-s2>
			<View row marginH-s1 style={{ width: '80%' }}>
				{assignment.assignmentTypeName && (
					<SmallButton
						onPress={() => setShowHw(!showHw)}
						style={{
							borderColor: Colors.$textAccent,
							borderWidth: 2,
							width: 40,
							height: 40,
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
					<Text $textAccent margin-s1 style={{ width: '85%' }} selectable>
						{assignment.assignmentTypeName}: {assignment.assignmentName}
					</Text>
				)}
			</View>

			<View row center>
				<Mark
					mark={assignment.result ?? 'Нет'}
					markWeight={{
						max: assignment.weight,
						min: assignment.weight,
						current: assignment.weight,
					}}
					style={{ width: 45, height: 45, padding: 0 }}
					textStyle={{ fontSize: 16 }}
					subTextStyle={{ fontSize: 14, alignSelf: 'center' }}
				/>
			</View>
		</View>
	)
}
