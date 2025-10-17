import React from "react";
import SignupForm from "../components/forms/SignupForm";

function Signup() {
	return (
		<main className="relative h-screen w-full">
			<section className="md:grid grid-cols-2">
				<article className="h-full">
					<SignupForm />
				</article>
				<aside className="h-full bg-secondary">
					{/* Design or illustration section */}
				</aside>
			</section>
		</main>
	);
}

export default Signup;
