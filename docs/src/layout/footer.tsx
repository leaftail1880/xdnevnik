import shape1 from "../../assets/images/footer/shape-1.svg";
import shape2 from "../../assets/images/footer/shape-2.svg";
import shape3 from "../../assets/images/footer/shape-3.svg";
import logo from "../../assets/images/logo-outline.svg";
import {
	githubDownloadLatestApk,
	githubReleases,
	githubRepo,
	githubUser,
} from "../constants";

function Footer() {
	return (
		<footer className="ud-footer">
			<div className="shape shape-1">
				<img src={shape1} alt="shape" />
			</div>
			<div className="shape shape-2">
				<img src={shape2} alt="shape" />
			</div>
			<div className="shape shape-3">
				<img src={shape3} alt="shape" />
			</div>
			<div className="ud-footer-widgets">
				<div className="container">
					<div className="row">
						<div className="col-xl-3 col-lg-4 col-md-6">
							<div className="ud-widget">
								<a href="index.html" className="ud-footer-logo">
									<img src={logo} alt="logo" />
								</a>
								<p className="ud-widget-desc">
									Создаем приложения, упрощающие жизнь.
								</p>

								<div className="ud-widget-socials">
									<a href="https://t.me/xdnevnikoffical">
										<i className="lni lni-telegram-original"></i>
										<p className="ud-widget-desc">Новости</p>
									</a>
								</div>
								<div className="ud-widget-socials">
									<a href="https://t.me/xdnevniksupport">
										<i className="lni lni-telegram-original"></i>
										<p className="ud-widget-desc">Тех поддержка</p>
									</a>
								</div>
							</div>
						</div>
						<div className="col-xl-2 col-lg-2 col-md-6 col-sm-6">
							<div className="ud-widget">
								<h5 className="ud-widget-title">Скачать</h5>
								<ul className="ud-widget-links">
									<li>
										<a href={githubDownloadLatestApk}>.APK</a>
									</li>
									<li>
										<a href={githubReleases}>Список версий</a>
									</li>
									<li>
										<a href={githubRepo}>Исходный код</a>
									</li>
								</ul>
							</div>
						</div>
						<div className="col-xl-2 col-lg-3 col-md-6 col-sm-6">
							<div className="ud-widget">
								<h5 className="ud-widget-title">Разделы</h5>
								<ul className="ud-widget-links">
									<li>
										<a href="#home">Главная</a>
									</li>
									<li>
										<a href="#features">Преимущества</a>
									</li>
									<li>
										<a href="#about">О приложении</a>
									</li>
									<li>
										<a href="#faq">Вопрос-Ответ</a>
									</li>
								</ul>
							</div>
						</div>

						{/* <!-- <div className="col-xl-2 col-lg-3 col-md-6 col-sm-6">
              <div className="ud-widget">
                <h5 className="ud-widget-title">Our Products</h5>
                <ul className="ud-widget-links">
                  <li>
                    <a
                      href="https://lineicons.com/"
                      rel="nofollow noopner"
                      target="_blank"
                      >Lineicons
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ecommercehtml.com/"
                      rel="nofollow noopner"
                      target="_blank"
                      >Ecommerce HTML</a
                    >
                  </li>
                  <li>
                    <a
                      href="https://ayroui.com/"
                      rel="nofollow noopner"
                      target="_blank"
                      >Ayro UI</a
                    >
                  </li>
                  <li>
                    <a
                      href="https://graygrids.com/"
                      rel="nofollow noopner"
                      target="_blank"
                      >Plain Admin</a
                    >
                  </li>
                </ul>
              </div>
            </div> --> */}
						{/* <!-- <div className="col-xl-3 col-lg-6 col-md-8 col-sm-10">
              <div className="ud-widget">
                <h5 className="ud-widget-title">Partners</h5>
                <ul className="ud-widget-brands">
                  <li>
                    <a
                      href="https://ayroui.com/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/ayroui.svg"
                        alt="ayroui"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ecommercehtml.com/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/ecommerce-html.svg"
                        alt="ecommerce-html"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://graygrids.com/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/graygrids.svg"
                        alt="graygrids"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://lineicons.com/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/lineicons.svg"
                        alt="lineicons"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://uideck.com/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/uideck.svg"
                        alt="uideck"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://tailwindtemplates.co/"
                      rel="nofollow noopner"
                      target="_blank"
                    >
                      <img
                        src="assets/images/footer/brands/tailwindtemplates.svg"
                        alt="tailwindtemplates"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div> --> */}
					</div>
				</div>
			</div>
			<div className="ud-footer-bottom">
				<div className="container">
					<div className="row">
						{/* <div className="col-md-8">
							<ul className="ud-footer-bottom-left">
								<li>
									<a href="#home)">Privacy policy</a>
								</li>
								<li>
									<a href="#home)">Support policy</a>
								</li>
								<li>
									<a href="#home)">Terms of service</a>
								</li>
							</ul>
						</div> */}
						<div className="col-md-4">
							<p className="ud-footer-bottom-right">
								© Copyright{" "}
								<a href={githubUser} rel="nofollow">
									Leaftail1880
								</a>{" "}
								{new Date().getFullYear().toString()}
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
