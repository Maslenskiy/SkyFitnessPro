import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./Register";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addUser } from "../../../../utils/api";
import "@testing-library/jest-dom";

// Мокаем Firebase auth
jest.mock("firebase/auth", () => ({
	createUserWithEmailAndPassword: jest.fn(),
}));

// Мокаем API функции
jest.mock("../../../../utils/api", () => ({
	addUser: jest.fn(),
}));

// Мокаем Firebase auth объект
jest.mock("../../../../utils/firebase", () => ({
	auth: {
		currentUser: null,
	},
}));

describe("Register Component", () => {
	const mockCloseModal = jest.fn();
	const mockToggleModal = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("должен отображать форму регистрации", () => {
		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		expect(screen.getByPlaceholderText("Эл. почта")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Пароль")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Повторите пароль")).toBeInTheDocument();
		expect(screen.getByText("Зарегистрироваться")).toBeInTheDocument();
		expect(screen.getByText("Войти")).toBeInTheDocument();
	});

	it("должен показывать ошибки валидации для пустых полей", async () => {
		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const registerButton = screen.getByText("Зарегистрироваться");
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(screen.getByText("Поле email обязательно для заполнения")).toBeInTheDocument();
			expect(screen.getByText("Поле пароль обязательно для заполнения")).toBeInTheDocument();
			expect(screen.getByText("Поле повтор пароля обязательно для заполнения")).toBeInTheDocument();
		});
	});

	it("должен показывать ошибку при несовпадающих паролях", async () => {
		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const copyPasswordInput = screen.getByPlaceholderText("Повторите пароль");
		const registerButton = screen.getByText("Зарегистрироваться");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(copyPasswordInput, { target: { value: "differentpassword" } });
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(screen.getByText("Пароли не совпадают")).toBeInTheDocument();
		});
	});

	it("должен успешно регистрировать пользователя при корректных данных", async () => {
		const mockUserCredential = {
			user: { uid: "test-uid", email: "test@example.com" },
		};

		(createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
		(addUser as jest.Mock).mockResolvedValue(undefined);

		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const copyPasswordInput = screen.getByPlaceholderText("Повторите пароль");
		const registerButton = screen.getByText("Зарегистрироваться");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(copyPasswordInput, { target: { value: "password123" } });
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
				expect.anything(),
				"test@example.com",
				"password123"
			);
			expect(addUser).toHaveBeenCalledWith("test-uid");
			expect(mockCloseModal).toHaveBeenCalled();
		});
	});

	it("должен обрабатывать ошибки Firebase", async () => {
		const error = new Error("Firebase: Password should be at least 6 characters (auth/weak-password).");
		(createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const copyPasswordInput = screen.getByPlaceholderText("Повторите пароль");
		const registerButton = screen.getByText("Зарегистрироваться");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "123" } });
		fireEvent.change(copyPasswordInput, { target: { value: "123" } });
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(screen.getByText("Пароль должен быть не менее 6 символов")).toBeInTheDocument();
		});
	});

	it("должен переключаться на форму входа", () => {
		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const loginButton = screen.getByText("Войти");
		fireEvent.click(loginButton);

		expect(mockToggleModal).toHaveBeenCalled();
	});

	it("должен очищать поля после успешной регистрации", async () => {
		const mockUserCredential = {
			user: { uid: "test-uid", email: "test@example.com" },
		};

		(createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
		(addUser as jest.Mock).mockResolvedValue(undefined);

		render(
			<Register
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const copyPasswordInput = screen.getByPlaceholderText("Повторите пароль");
		const registerButton = screen.getByText("Зарегистрироваться");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(copyPasswordInput, { target: { value: "password123" } });
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(emailInput).toHaveValue("");
			expect(passwordInput).toHaveValue("");
			expect(copyPasswordInput).toHaveValue("");
		});
	});
});
