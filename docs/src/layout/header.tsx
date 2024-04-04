import logo from "../../assets/images/logo-outline.svg";
import { githubDownloadLatestApk, githubRepo } from "../constants";

function Header() {
	return (
		<header className="ud-header">
			<div className="container">
				<div className="row">
					<div className="col-lg-12">
						<nav className="navbar navbar-expand-lg">
							<a className="navbar-brand" href="#home">
								<img src={logo} alt="Logo" />
							</a>
							<button className="navbar-toggler">
								<span className="toggler-icon"> </span>
								<span className="toggler-icon"> </span>
								<span className="toggler-icon"> </span>
							</button>

							<div className="navbar-collapse">
								<ul id="nav" className="navbar-nav mx-auto">
									{[
										["Главная", "home"],
										["О приложении", "about"],
										["Преимущества", "features"],
									].map((e) => (
										<li className="nav-item" key={e[1]}>
											<a className="ud-menu-scroll" href={`#${e[1]}`}>
												{e[0]}
											</a>
										</li>
									))}

									{/* <li className="nav-item">
										<a className="ud-menu-scroll" href="#team">
											Team
										</a>
									</li> */}

									{/* <li className="nav-item nav-item-has-children">
										<a href="#home)"> Pages </a>
										<ul className="ud-submenu">
											<li className="ud-submenu-item">
												<a href="about.html" className="ud-submenu-link">
													About Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="pricing.html" className="ud-submenu-link">
													Pricing Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="contact.html" className="ud-submenu-link">
													Contact Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="blog.html" className="ud-submenu-link">
													Blog Grid Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="blog-details.html" className="ud-submenu-link">
													Blog Details Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="login.html" className="ud-submenu-link">
													Sign In Page
												</a>
											</li>
											<li className="ud-submenu-item">
												<a href="404.html" className="ud-submenu-link">
													404 Page
												</a>
											</li>
										</ul>
									</li> */}
								</ul>
							</div>

							<div className="navbar-btn d-none d-sm-inline-block">
								<a
									className="ud-main-btn ud-login-btn"
									href={githubDownloadLatestApk}
								>
									Скачать APK
								</a>
								<a className="ud-main-btn ud-white-btn" href={githubRepo}>
									GitHub
								</a>
							</div>
						</nav>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
