import shape from "../../assets/images/faq/shape.svg";

function FAQ() {
	return (
		<section id="faq" className="ud-faq">
			<div className="shape">
				<img src={shape} alt="shape" />
			</div>
			<div className="container">
				<div className="row">
					<div className="col-lg-12">
						<div className="ud-section-title text-center mx-auto">
							<span>Возникли вопросы? У нас уже есть ответы!</span>
							<h3>Вопрос-Ответ</h3>
							<p>
								Здесь содержатся одни из самых частых вопросов, связанных с
								дневником.
							</p>
						</div>
					</div>
				</div>

				<div className="row">
					{[
						[
							"Что это вообще? Что за Сетевой Город?",
							"Это приложение для электронного дневника, называемого Сетевой Город. Он часто используется в школах и колледжах среди многих регионов России. В приложении вы можете посмотреть расписание уроков или пар и свои оценки.",
						],
						[
							"Здесь те же оценки, что и в Сетевом Городе?",
							"Да, дневник использует ту же информацию. Вы увидите ровно те же данные, что и на сайте Сетевого Города и в официальном приложение.",
						],
						[
							"Будет ли поддержка iOS?",
							"Из-за невозможности оплаты разработчика Apple, поддержки iOS пока нет, также пока не найден способ удобно устанавливать приложения со сторонних магазинов на iOS. Если эти проблемы решатся, XDnevnik сразу станет доступен на iOS!",
						],
						[
							"Приложение бесплатное?",
							"Да, приложение полностью бесплатное и в нем нет никакой рекламы. Разработчики не получают никаких средств с этого приложения.",
						],
						[
							"Хранит ли приложение личные данные?",
							<p>
								Все данные хранятся на каждом телефоне отдельно, приложение
								отправляет лишь анонимные отчеты об ошибках с помощью сервиса{" "}
								<a
									href="https://sentry.io/privacy/#what-does-sentry-do"
									target="_blank"
								>
									Sentry
								</a>
								.
							</p>,
						],
						[
							"Это для родителей, учеников или учителей?",
							"Для родителей и учеников, которые могут просматривать свой дневник. К сожалению, приложение для учителей было бы слишком сложным и без возможности полноценного тестирования, содержало бы огромное количество ошибок.",
						],
						[
							"Я могу выставить себе оценки?",
							'Нет, приложение никак не изменяет ничего в Сетевом Городе. Однако, вы может проверить, как изменится средний балл, если у вас будут определенные оценки. Для этого, передите в оценки по предмету и нажмите на кнопку "Добавить"',
						],
					].map((e, i) => (
						<Accordion
							key={i.toString()}
							i={i}
							title={e[0]}
							description={e[1]}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function Accordion(props: {
	i: number;
	title: React.ReactNode;
	description: React.ReactNode;
}) {
	return (
		<div className="col-lg-6">
			<div
				className="ud-single-faq"
				data-aos="fade-up"
				data-aos-delay={props.i * 200 + 2000}
			>
				<div className="accordion">
					<button
						className="ud-faq-btn collapsed"
						data-bs-toggle="collapse"
						data-bs-target={`#collapse${props.i}`}
					>
						<span className="icon flex-shrink-0">
							<i className="lni lni-chevron-down"></i>
						</span>
						<span>{props.title}</span>
					</button>
					<div
						id={`collapse${props.i}`}
						className="accordion-collapse collapse"
					>
						<div className="ud-faq-body">{props.description}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default FAQ;
