function Features() {
	return (
		<section id="features" className="ud-features">
			<div className="container">
				<div className="row">
					<div className="col-lg-12">
						<div className="ud-section-title">
							<span>Преимущества</span>
							<h3>Почему XDnevnik?</h3>
							<p>Этого нет в официальном приложении.</p>
						</div>
					</div>
				</div>
				<div className="row">
					{[
						['dashboard', 'Скорость', 'Запуск в 3 раза быстрее официального'],
						['package', 'Вес', 'Весит 27мб, против 76мб у официального'],
						[
							'night',
							'Темная тема',
							'Поддержка темной темы и выбора разных цветов акцента',
						],
						[
							'alarm',
							'Уведомления',
							'Уведомления о текущем уроке, с ним вы точно будете знать, в какой кабинет идти',
						],
						[
							'network',
							'Оффлайн-режим',
							'Просмотр ранее загруженной информации без интернета',
						],
						[
							'layout',
							'Удобный интерфейс',
							'Ничего лишнего, только то, что вам нужно',
						],
						[
							'pencil-alt',
							'Настраиваемость',
							'Неправильное расписание? Не нравится длинное название предмета? Вы можете все это изменить!',
						],
						[
							'gift',
							'Бесплатно!',
							'В приложении нет рекламы и скачивание полностью бесплатно!',
						],
					].map((e, i) => (
						<Feature
							icon={e[0]}
							key={e[0]}
							title={e[1]}
							description={e[2]}
							delay={i * 100 + 100}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default Features

function Feature(props: {
	icon: string
	title: string
	description: string
	delay: number
}) {
	return (
		<div className="col-xl-3 col-lg-3 col-sm-6">
			<div
				className="ud-single-feature"
				data-aos-delay={props.delay.toString()}
				data-aos-duration={1000}
				data-aos="fade-up"
			>
				<div className="ud-feature-icon">
					<i className={`lni lni-${props.icon}`}></i>
				</div>
				<div className="ud-feature-content">
					<h3 className="ud-feature-title">{props.title}</h3>
					<p className="ud-feature-desc">{props.description}</p>
					{/* <a href="#home)" className="ud-feature-link">
						Узнать больше
					</a> */}
				</div>
			</div>
		</div>
	)
}
