import AOS from "aos";
import "aos/dist/aos.css";
import { ClientOnly } from "vite-react-ssg";
import logoOutline from "../assets/images/logo-outline.svg";
import logoCommon from "../assets/images/logo.svg";

function Client() {
	return (
		<ClientOnly>
			{() => {
				// ======= Sticky
				window.onscroll = function () {
					const ud_header = document.querySelector(".ud-header") as HTMLElement;
					if (!ud_header) return;
					const sticky = ud_header.offsetTop;
					const logo = document.querySelector(
						".navbar-brand img"
					) as HTMLImageElement;
					if (!logo) return;

					if (window.scrollY > sticky) {
						ud_header.classList.add("sticky");
					} else {
						ud_header.classList.remove("sticky");
					}

					// === logo change
					if (ud_header.classList.contains("sticky")) {
						logo.src = logoCommon;
					} else {
						logo.src = logoOutline;
					}

					// show or hide the back-top-top button
					const backToTop = document.querySelector(
						".back-to-top"
					) as HTMLElement;
					if (backToTop) {
						if (
							document.body.scrollTop > 50 ||
							document.documentElement.scrollTop > 50
						) {
							backToTop.style.display = "flex";
						} else {
							backToTop.style.display = "none";
						}
					}
				};

				//===== close navbar-collapse when a  clicked
				const navbarToggler = document.querySelector(".navbar-toggler");
				const navbarCollapse = document.querySelector(".navbar-collapse");

				if (navbarCollapse && navbarToggler) {
					document.querySelectorAll(".ud-menu-scroll").forEach((e) =>
						e.addEventListener("click", () => {
							navbarToggler.classList.remove("active");
							navbarCollapse.classList.remove("show");
						})
					);
					navbarToggler.addEventListener("click", function () {
						navbarToggler.classList.toggle("active");
						navbarCollapse.classList.toggle("show");
					});
				}

				// ===== submenu
				const submenuButton = document.querySelectorAll(
					".nav-item-has-children"
				);
				if (submenuButton) {
					submenuButton.forEach((elem) => {
						if (!elem) return;

						elem.querySelector("a")?.addEventListener("click", () => {
							elem.querySelector(".ud-submenu")?.classList.toggle("show");
						});
					});
				}

				const pageLink = document.querySelectorAll(".ud-menu-scroll");

				pageLink.forEach((elem) => {
					elem.addEventListener("click", (e) => {
						e.preventDefault();
						(
							document.querySelector(
								elem!.getAttribute("href")!
							) as HTMLAnchorElement
						).scrollIntoView({
							behavior: "smooth",
							// @ts-ignore
							offsetTop: 1 - 60,
						});
					});
				});

				window.document.addEventListener("scroll", () => {
					const sections = document.querySelectorAll(".ud-menu-scroll");
					const scrollPos =
						window.scrollY ||
						document.documentElement.scrollTop ||
						document.body.scrollTop;

					for (const section of sections) {
						const val = section.getAttribute("href")!;
						const refElement = document.querySelector(val) as HTMLElement;
						if (!refElement) continue;

						const scrollTopMinus = scrollPos + 73;
						if (
							refElement.offsetTop <= scrollTopMinus &&
							refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
						) {
							document
								.querySelector(".ud-menu-scroll")
								?.classList.remove("active");
							section.classList.add("active");
						} else {
							section.classList.remove("active");
						}
					}
				});

				AOS.init();

				return <></>;
			}}
		</ClientOnly>
	);
}

export default Client;
