import { AnchorHTMLAttributes, memo } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { Text, TextProps } from 'react-native-paper'

// eslint-disable-next-line mobx/missing-observer
export function Strong(props: TextProps<string>) {
	return (
		<Text
			{...props}
			style={{
				fontWeight: 'bold',
				fontSize: 20,
			}}
		></Text>
	)
}

// eslint-disable-next-line mobx/missing-observer
export function Link(
	props: TextProps<string> & AnchorHTMLAttributes<never> & { href: string },
) {
	return (
		<Text
			{...props}
			onPress={() => {
				Linking.openURL(props.href)
			}}
		></Text>
	)
}

// eslint-disable-next-line mobx/missing-observer
export default memo(function PrivacyPolicy() {
	return (
		<ScrollView contentContainerStyle={{ padding: 7 }}>
			<View>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Privacy Policy</Strong>
				<Text>
					Leaftail1880 built the XDnevnik app as an Open Source app. This
					SERVICE is provided by Leaftail1880 at no cost and is intended for use
					as is.
				</Text>
				<Text>
					This page is used to inform visitors regarding my policies with the
					collection, use, and disclosure of Personal Information if anyone
					decided to use my Service.
				</Text>
				<Text>
					If you choose to use my Service, then you agree to the collection and
					use of information in relation to this policy. The Personal
					Information that I collect is used for providing and improving the
					Service. I will not use or share your information with anyone except
					as described in this Privacy Policy.
				</Text>
				<Text>
					The terms used in this Privacy Policy have the same meanings as in our
					Terms and Conditions, which are accessible at XDnevnik unless
					otherwise defined in this Privacy Policy.
				</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Information Collection and Use</Strong>
				<Text>
					For a better experience, while using our Service, I may require you to
					provide us with certain personally identifiable information, including
					but not limited to IP, device name, device OS, device API version..
					The information that I request will be retained on your device and is
					not collected by me in any way.
				</Text>
				<View>
					<Text>
						The app does use third-party services that may collect information
						used to identify you.
					</Text>
					<Text>
						Link to the privacy policy of third-party service providers used by
						the app
					</Text>
					<Link
						href="https://expo.io/privacy"
						target="_blank"
						rel="noopener noreferrer"
						// eslint-disable-next-line react-native/no-raw-text
					>
						Expo
					</Link>
					<Link
						href="https://sentry.io/privacy/"
						target="_blank"
						rel="noopener noreferrer"
						// eslint-disable-next-line react-native/no-raw-text
					>
						Sentry
					</Link>
				</View>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Log Data</Strong>
				<Text>
					I want to inform you that whenever you use my Service, in a case of an
					error in the app I collect data and information (through third-party
					products) on your phone called Log Data. This Log Data may include
					information such as your device Internet Protocol (“IP”) address,
					device name, operating system version, the configuration of the app
					when utilizing my Service, the time and date of your use of the
					Service, and other statistics.
				</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Cookies</Strong>
				<Text>
					Cookies are files with a small amount of data that are commonly used
					as anonymous unique identifiers. These are sent to your browser from
					the websites that you visit and are stored on your device’s internal
					memory.
				</Text>
				<Text>
					This Service does not use these “cookies” explicitly. However, the app
					may use third-party code and libraries that use “cookies” to collect
					information and improve their services. You have the option to either
					accept or refuse these cookies and know when a cookie is being sent to
					your device. If you choose to refuse our cookies, you may not be able
					to use some portions of this Service.
				</Text>
				<Text>
					<Strong>Service Providers</Strong>
				</Text>
				<Text>
					I may employ third-party companies and individuals due to the
					following reasons:
				</Text>
				<Text>To facilitate our Service;</Text>
				<Text>To provide the Service on our behalf;</Text>
				<Text>To perform Service-related services; or</Text>
				<Text>To assist us in analyzing how our Service is used.</Text>
				<Text>
					I want to inform users of this Service that these third parties have
					access to their Personal Information. The reason is to perform the
					tasks assigned to them on our behalf. However, they are obligated not
					to disclose or use the information for any other purpose.
				</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Security</Strong>
				<Text>
					I value your trust in providing us your Personal Information, thus we
					are striving to use commercially acceptable means of protecting it.
					But remember that no method of transmission over the internet, or
					method of electronic storage is 100% secure and reliable, and I cannot
					guarantee its absolute security.
				</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Links to Other Sites</Strong>
				<Text>
					This Service may contain links to other sites. If you click on a
					third-party link, you will be directed to that site. Note that these
					external sites are not operated by me. Therefore, I strongly advise
					you to review the Privacy Policy of these websites. I have no control
					over and assume no responsibility for the content, privacy policies,
					or practices of any third-party sites or services.
				</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Children’s Privacy</Strong>
				<View>
					<Text>
						These Services do not address anyone under the age of 13. I do not
						knowingly collect personally identifiable information from children
						under 13 years of age. In the case I discover that a child under 13
						has provided me with personal information, I immediately delete this
						from our servers. If you are a parent or guardian and you are aware
						that your child has provided us with personal information, please
						contact me so that I will be able to do the necessary actions.
					</Text>
				</View>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Changes to This Privacy Policy</Strong>
				<Text>
					I may update our Privacy Policy from time to time. Thus, you are
					advised to review this page periodically for any changes. I will
					notify you of any changes by posting the new Privacy Policy on this
					page.
				</Text>
				<Text>This policy is effective as of 2024-02-01</Text>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Strong>Contact Us</Strong>
				<Text>
					If you have any questions or suggestions about my Privacy Policy, do
					not hesitate to contact me at leaftail1880@outlook.com.
				</Text>
				<Text>
					This privacy policy page was created at{' '}
					<Link
						href="https://privacypolicytemplate.net"
						target="_blank"
						rel="noopener noreferrer"
					>
						privacypolicytemplate.net
					</Link>{' '}
					and modified/generated by{' '}
					<Link
						href="https://app-privacy-policy-generator.nisrulz.com/"
						target="_blank"
						rel="noopener noreferrer"
					>
						App Privacy Policy Generator
					</Link>
				</Text>
			</View>
		</ScrollView>
	)
})
