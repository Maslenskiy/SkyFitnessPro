import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "./ResetPassword";
import { sendPasswordResetEmail } from "firebase/auth";
import "@testing-library/jest-dom";

// Мокаем Firebase auth
jest.mock("firebase/auth", () => ({
	sendPasswordResetEmail: jest.fn(),
}));

// Мокаем Firebase auth объект
jest.mock("../../../../utils/firebase", () => ({
	auth: {
		currentUser: null,
	},
}));

describe("ResetPassword Component", () => {
	const mockCloseModal = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("должен отображать форму сброса пароля", () => {
		render(<ResetPassword closeModal={mockCloseModal} />);

		expect(screen.getByPlaceholderText("Введите ваш email")).toBeInTheDocument();
		expect(screen.getByText("Сбросить пароль")).toBeInTheDocument();
	});

	it("должен показывать ошибку валидации для пустого email", async () => {
		render(<ResetPassword closeModal={mockCloseModal} />);

		const resetButton = screen.getByText("Сбросить пароль");
		fireEvent.click(resetButton);

		await waitFor(() => {
			expect(screen.getByText("Поле email обязательно для заполнения")).toBeInTheDocument();
		});
	});

	it("должен успешно отправлять email для сброса пароля", async () => {
		(sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

		render(<ResetPassword closeModal={mockCloseModal} />);

		const emailInput = screen.getByPlaceholderText("Введите ваш email");
		const resetButton = screen.getByText("Сбросить пароль");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(resetButton);

		await waitFor(() => {
			expect(sendPasswordResetEmail).toHaveBeenCalledWith(
				expect.anything(),
				"test@example.com"
			);
		});

		await waitFor(() => {
			expect(screen.getByText(/Ссылка для восстановления пароля отправлена на test@example.com/)).toBeInTheDocument();
		});
	});

	it("должен обрабатывать ошибки Firebase", async () => {
		const error = new Error("Firebase: Error (auth/user-not-found).");
		(sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

		render(<ResetPassword closeModal={mockCloseModal} />);

		const emailInput = screen.getByPlaceholderText("Введите ваш email");
		const resetButton = screen.getByText("Сбросить пароль");

		fireEvent.change(emailInput, { target: { value: "nonexistent@example.com" } });
		fireEvent.click(resetButton);

		await waitFor(() => {
			expect(screen.getByText(/Произошла ошибка: Firebase: Error \(auth\/user-not-found\)\./)).toBeInTheDocument();
		});
	});

	it("должен скрывать форму после успешной отправки", async () => {
		(sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

		render(<ResetPassword closeModal={mockCloseModal} />);

		const emailInput = screen.getByPlaceholderText("Введите ваш email");
		const resetButton = screen.getByText("Сбросить пароль");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(resetButton);

		await waitFor(() => {
			expect(screen.queryByPlaceholderText("Введите ваш email")).not.toBeInTheDocument();
			expect(screen.queryByText("Сбросить пароль")).not.toBeInTheDocument();
		});
	});

	it("должен показывать зеленое сообщение об успехе", async () => {
		(sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

		render(<ResetPassword closeModal={mockCloseModal} />);

		const emailInput = screen.getByPlaceholderText("Введите ваш email");
		const resetButton = screen.getByText("Сбросить пароль");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(resetButton);

		await waitFor(() => {
			const successMessage = screen.getByText(/Ссылка для восстановления пароля отправлена на test@example.com/);
			expect(successMessage).toHaveClass("text-green-500");
		});
	});

	it("должен показывать красное сообщение об ошибке", async () => {
		const error = new Error("Test error");
		(sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

		render(<ResetPassword closeModal={mockCloseModal} />);

		const emailInput = screen.getByPlaceholderText("Введите ваш email");
		const resetButton = screen.getByText("Сбросить пароль");

		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(resetButton);

		await waitFor(() => {
			const errorMessage = screen.getByText(/Произошла ошибка: Test error/);
			expect(errorMessage).toHaveClass("text-red-500");
		});
	});
});
