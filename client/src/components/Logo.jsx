import logo from "../assets/SBorrowHubLogo.png";

function Logo() {
	return (
		<div className="flex gap-3 items-center">
			<img src={logo} alt="SBorrowHub Logo" className="w-10 rounded-md" />
			<h1 className="text-2xl font-raleway font-bold text-secondary">
				SBorrowHub
			</h1>
		</div>
	);
}

export default Logo;
