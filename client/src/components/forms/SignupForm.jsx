import FormInput from "../FormInput";
import Logo from "../Logo";

function SignupForm() {
	const handleChange = (e) => {};
	return (
		<div>
			<Logo />
			<h1>Create your Account</h1>
			<p>Get instant access to a smarter borrowing and sharing hub.</p>
			<form className="space-y-3 flex flex-col">
				<FormInput
					name="firstname"
					id="firstname"
					placeholder="Firstname"
					onChange={handleChange}
				/>
				<FormInput
					name="lastname"
					id="lastname"
					placeholder="Lastname"
					onChange={handleChange}
				/>
				<FormInput
					type="number"
					name="studentId"
					id="studentId"
					placeholder="Student ID"
					onChange={handleChange}
				/>
				<FormInput
					type="email"
					name="email"
					id="email"
					placeholder="Email"
					onChange={handleChange}
				/>
				<FormInput
					type="number"
					name="phoneNumber"
					id="phoneNumber"
					placeholder="Phone Number"
					onChange={handleChange}
				/>
			</form>
		</div>
	);
}

export default SignupForm;
