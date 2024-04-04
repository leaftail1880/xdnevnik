import dottedShape from "../../assets/images/hero/dotted-shape.svg";
import hero from "../../assets/images/hero/hero-image.png";
import { githubDownloadLatestApk } from "../constants";
function Hero() {
	return (
		<section className="ud-hero" id="home">
			<div className="container">
				<div className="row">
					<div className="col-lg-12">
						<div
							className="ud-hero-content aos-init aos-animate"
							data-aos="fade-up"
							data-aos-duration="1000"
						>
							<h1 className="ud-hero-title">
								XDnevnik - Лучшее мобильное приложение Сетевого Города
							</h1>
							<p className="ud-hero-desc">
								Доступное, легкое и удобное мобильное приложение для доступа в
								электронный дневник Сетевой Город. Образование.
							</p>
							<ul className="ud-hero-buttons">
								<li>
									<a
										href={githubDownloadLatestApk}
										rel="nofollow noopener"
										target="_blank"
										className="ud-main-btn ud-white-btn"
									>
										Скачать APK
									</a>
								</li>
								<li>
									<a href="#features" className="ud-main-btn ud-link-btn">
										Преимущества <i className="lni lni-arrow-right"></i>
									</a>
								</li>
							</ul>
						</div>
						<div
							className="ud-hero-image"
							data-aos="fade-up"
							data-aos-duration="2500"
						>
							<img src={hero} alt="hero-image" className="hero-image-logo" />
							<img src={dottedShape} alt="shape" className="shape shape-1" />
							<img src={dottedShape} alt="shape" className="shape shape-2" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Hero;
