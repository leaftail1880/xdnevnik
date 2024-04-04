import { Head } from "vite-react-ssg";
import previewImg from "../../assets/images/hero/hero-image.png";
import { githubPagesUrl } from "../constants";

const title = "XDnevnik | Сетевой Город";
const description = "Бесплатное и удобное приложение для Сетевого Города";
const previewImgUrl = githubPagesUrl + previewImg;

function HeadMeta() {
	return (
		<Head>
			<title>{title}</title>

			{/* <!-- Primary Meta Tags --> */}
			<meta name="title" content={title} />
			<meta name="description" content={description} />

			{/* <!-- Open Graph / Facebook --> */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={githubPagesUrl} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={previewImgUrl} />

			{/* <!-- Twitter --> */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={githubPagesUrl} />
			<meta property="twitter:title" content={title} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={previewImgUrl} />
		</Head>
	);
}

export default HeadMeta;
