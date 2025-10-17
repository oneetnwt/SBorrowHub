import getIcon from "./icon/getIcon";

function FormInput({ type = "text", name, placeholder, id, onChange, icon }) {
	return icon ? (
		<div className="flex items-center border rounded-lg px-3 py-2">
			<getIcon className="text-gray-500 mr-2" />
			<input
				type={type}
				name={name}
				id={id}
				placeholder={placeholder}
				onChange={onChange}
				className="w-full outline-none bg-transparent"
			/>
		</div>
	) : (
		<input
			type={type}
			name={name}
			placeholder={placeholder}
			id={id}
			onChange={onChange}
			className="bg-[var(--neutral-color)] border-1 border-black/50 p-[12px_24px] rounded-md"
		/>
	);
}

export default FormInput;
