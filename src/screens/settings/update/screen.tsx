// import * as MediaLibrary from 'expo-media-library'
// import * as Permissions from 'expo-permissions'

import { observer } from 'mobx-react-lite'
import { FlatList, ListRenderItem, View } from 'react-native'

import UpdateDate from '~components/UpdateDate'
import { Github } from '~services/github/api'
import { GithubRelease } from '~services/github/entities'

import Release from './Release'
import UpdateInfo from './UpdateInfo'

// TODO Filter beta
// TODO Toggle tips

export default observer(function UpdatesScreen() {
	if (Github.Releases.fallback)
		return (
			<View>
				<UpdateInfo />
				{Github.Releases.fallback}
			</View>
		)

	return (
		<FlatList
			refreshControl={Github.Releases.refreshControl}
			data={Github.Releases.result}
			maxToRenderPerBatch={2}
			ListHeaderComponent={UpdateInfo}
			ListFooterComponent={
				<UpdateDate key={'updates'} store={Github.Releases} />
			}
			keyExtractor={keyExtractor}
			renderItem={renderItem}
		/>
	)
})

const keyExtractor = (i: GithubRelease) => i.id + ''
const renderItem: ListRenderItem<GithubRelease> = props => (
	<Release {...props} />
)
