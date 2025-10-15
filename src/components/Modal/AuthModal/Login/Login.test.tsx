import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { useUser } from "../../../../hooks/useUser";
import { signInWithEmailAndPassword } from "firebase/auth";
import "@testing-library/jest-dom";

// Мокаем Firebase auth
jest.mock("firebase/auth", () => ({
	signInWithEmailAndPassword: jest.fn(),
}));

// Мокаем хук useUser
jest.mock("../../../../hooks/useUser", () => ({
	useUser: jest.fn(),
}));

// Мокаем Firebase auth объект
jest.mock("../../../../utils/firebase", () => ({
	auth: {
		currentUser: null,
	},
}));

describe("Login Component", () => {
	const mockCloseModal = jest.fn();
	const mockToggleModal = jest.fn();
	const mockResetModal = jest.fn();
	const mockLoginUser = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useUser as jest.Mock).mockReturnValue({
			loginUser: mockLoginUser,
		});
	});

	it("должен отображать форму входа", () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		expect(screen.getByPlaceholderText("Эл. почта")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Пароль")).toBeInTheDocument();
		expect(screen.getByText("Войти")).toBeInTheDocument();
		expect(screen.getByText("Зарегистрироваться")).toBeInTheDocument();
	});

	it("должен показывать ошибки валидации для пустых полей", async () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const loginButton = screen.getByText("Войти");
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(screen.getByText("Поле email обязательно для заполнения")).toBeInTheDocument();
			expect(screen.getByText("Поле пароль обязательно для заполнения")).toBeInTheDocument();
		});
	});

	it("должен показывать ошибку валидации только для пустого email", async () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const passwordInput = screen.getByPlaceholderText("Пароль");
		const loginButton = screen.getByText("Войти");

		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(screen.getByText("Поле email обязательно для заполнения")).toBeInTheDocument();
			expect(screen.queryByText("Поле пароль обязательно для заполнения")).not.toBeInTheDocument();
		});
	});

	it("должен показывать ошибку валидации только для пустого пароля", async () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const loginButton = screen.getByText("Войти");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(screen.getByText("Поле пароль обязательно для заполнения")).toBeInTheDocument();
			expect(screen.queryByText("Поле email обязательно для заполнения")).not.toBeInTheDocument();
		});
	});

	it("должен вызывать Firebase auth при корректных данных", async () => {
		const mockUserCredential = {
			user: { uid: "test-uid", email: "test@example.com" },
		};

		(signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const loginButton = screen.getByText("Войти");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
				expect.anything(),
				"test@example.com",
				"password123"
			);
		});
	});

	it("должен обрабатывать ошибки Firebase", async () => {
		const error = new Error("Firebase: Error (auth/invalid-credential).");
		(signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const emailInput = screen.getByPlaceholderText("Эл. почта");
		const passwordInput = screen.getByPlaceholderText("Пароль");
		const loginButton = screen.getByText("Войти");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(screen.getByText("Неверный логин или пароль")).toBeInTheDocument();
		});
	});

	it("должен переключаться на форму регистрации", () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const registerButton = screen.getByText("Зарегистрироваться");
		fireEvent.click(registerButton);

		expect(mockToggleModal).toHaveBeenCalled();
	});

	it("должен переключаться на форму сброса пароля", () => {
		render(
			<Login
				closeModal={mockCloseModal}
				toggleModal={mockToggleModal}
				resetModal={mockResetModal}
			/>
		);

		const resetButton = screen.getByText("Забыли пароль?");
		fireEvent.click(resetButton);

		expect(mockResetModal).toHaveBeenCalled();
	});
});
