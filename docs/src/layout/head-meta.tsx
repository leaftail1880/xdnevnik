import { Head } from "vite-react-ssg";
import previewImg from "../../assets/images/hero/hero-image.png";

const title = "XDNevnik | Сетевой Город";
const description = "Бесплатное и удобное приложение для Сетевого Города";
const url = "https://leaftail1880.github.io";
const previewUrl = url + previewImg;

function HeadMeta() {
	return (
		<Head>
			<title>{title}</title>

			{/* <!-- Primary Meta Tags --> */}
			<meta name="title" content={title} />
			<meta name="description" content={description} />

			{/* <!-- Open Graph / Facebook --> */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={previewUrl} />

			{/* <!-- Twitter --> */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={url} />
			<meta property="twitter:title" content={title} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={previewUrl} />
		</Head>
	);
}

export default HeadMeta;
