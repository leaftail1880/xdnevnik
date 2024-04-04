import About from "../sections/about";
import FAQ from "../sections/faq";
import Features from "../sections/features";
import Hero from "../sections/hero";

function Landing() {
	return (
		<>
			<Hero />
			<Features />
			<About />
			{/* Pricing */}
			<FAQ />
			{/* Testimonals */}
			{/* Team */}
			{/* Contact */}
		</>
	);
}

export default Landing;
