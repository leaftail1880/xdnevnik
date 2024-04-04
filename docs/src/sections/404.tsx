function NotFoundPage() {
	return (
		<>
			<section className="ud-page-banner">
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="ud-banner-content">
								<h1>Не найдено - 404</h1>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="ud-404">
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="ud-404-wrapper">
								<div className="ud-404-content">
									<h2 className="ud-404-title">Ошибка 404</h2>
									<h5 className="ud-404-subtitle">
										Этой страницы не было, она была перемещена или удалена.
										Может, вы хотели сюда?
									</h5>
									<ul className="ud-404-links">
										<li>
											<a href="/">Главная</a>
										</li>
										<li>
											<a href="/#support">Поддержка</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default NotFoundPage;
