// import about from "../../assets/images/about/about-image.svg";

function About() {
	return (
		<section id="about" className="ud-about">
			<div className="container">
				<div
					className="ud-about-wrapper"
					data-aos="fade-up"
					data-aos-delay="2000"
				>
					<div className="ud-about-content-wrapper">
						<div className="ud-about-content">
							<span className="tag">О приложении</span>
							<h2>Цель создания</h2>
							<p>
								Приложение создавалось в первую очередь для пользователей,
								поэтому в нем нет и <strong>никогда не будет рекламы</strong>, а
								скачивание всегда останется <strong>бесплатным</strong>. Вы
								всегда можете связаться с разработчиком если у вас есть
								предложения или если вы заметили баг
							</p>
							<p>
								У приложения открытый исходный код - вы точно можете быть
								уверены, <strong>что именно</strong> вы устанавливаете
							</p>
						</div>
					</div>
					{/* <div className="ud-about-image">
						<img src={about} alt="about-image" />
					</div> */}
				</div>
			</div>
		</section>
	);
}
export default About;
