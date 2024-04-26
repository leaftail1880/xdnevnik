import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { List } from 'react-native-paper'
import NumberInput from '../../../components/NumberInput'
import { Theme } from '../../../models/theme'
import { API } from '../../../services/NetSchool/api'

export default observer(function Appearance() {
	Theme.key

	return (
		<ScrollView>
			<List.Section title="Общие">
				<NumberInput
					label="Длительность запроса (в секундах)"
					value={API.timeoutLimit}
					onChange={value => runInAction(() => (API.timeoutLimit = value))}
					defaultValue={6}
				/>
			</List.Section>
		</ScrollView>
	)
})
