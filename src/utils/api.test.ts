import {
	getCourse,
	addUser,
	addCourseToUser,
	deleteCourseToUser,
	getUserCourses,
	getCourseById,
	addRealQuantity,
	getRealQuantity,
	deleteProgress,
	addUserName,
	getUserName,
} from "./api";

// Мокаем fetch
(globalThis as any).fetch = jest.fn();

describe("API Functions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockClear();
	});

	describe("getCourse", () => {
		it("должен успешно получать список курсов", async () => {
			const mockData = { course1: { id: "1", name: "Course 1" } };
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			});

			const result = await getCourse();
			expect(result).toEqual(mockData);
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/courses.json"
			);
		});

		it("должен обрабатывать ошибку 401", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
			});

			await expect(getCourse()).rejects.toThrow("Невозможно получить список курсов");
		});

		it("должен обрабатывать другие ошибки", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			await expect(getCourse()).rejects.toThrow("Ошибка! Статус: 500");
		});
	});

	describe("addUser", () => {
		it("должен успешно добавлять пользователя", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			await addUser("test-uuid");
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/test-uuid.json",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						uuid: "test-uuid",
					}),
				}
			);
		});

		it("должен обрабатывать ошибку 401", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
			});

			await expect(addUser("test-uuid")).rejects.toThrow("Невозможно добавить пользователя");
		});
	});

	describe("addCourseToUser", () => {
		it("должен успешно добавлять курс пользователю", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			await addCourseToUser("user-uuid", "course-id");
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/user-uuid/courses/course-id.json",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: "course-id",
					}),
				}
			);
		});
	});

	describe("deleteCourseToUser", () => {
		it("должен успешно удалять курс у пользователя", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			await deleteCourseToUser("user-uuid", "course-id");
		expect(fetch).toHaveBeenCalledWith(
			"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app//users//user-uuid/courses/course-id.json",
			{
				method: "DELETE",
			}
		);
		});

		it("должен обрабатывать ошибку при удалении", async () => {
			const consoleSpy = jest.spyOn(console, "error").mockImplementation();
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
			});

			await deleteCourseToUser("user-uuid", "course-id");
			expect(consoleSpy).toHaveBeenCalledWith("Ошибка при удалении курса");
			consoleSpy.mockRestore();
		});
	});

	describe("getUserCourses", () => {
		it("должен успешно получать курсы пользователя", async () => {
			const mockData = { course1: { id: "1", name: "Course 1" } };
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			});

			const result = await getUserCourses("user-uuid");
			expect(result).toEqual(mockData);
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/user-uuid/courses.json"
			);
		});
	});

	describe("getCourseById", () => {
		it("должен успешно получать курс по ID", async () => {
			const mockData = { id: "1", name: "Course 1" };
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			});

			const result = await getCourseById("course-id");
			expect(result).toEqual(mockData);
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/courses/course-id/.json"
			);
		});
	});

	describe("addRealQuantity", () => {
		it("должен успешно добавлять реальное количество упражнений", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			const exercises = [{ name: "push-ups", quantity: 10 }];
			await addRealQuantity("user-uuid", "course-id", "workout-id", exercises);

			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/user-uuid/courses/course-id/workouts/workout-id.json",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ exercises }),
				}
			);
		});
	});

	describe("getRealQuantity", () => {
		it("должен успешно получать реальное количество упражнений", async () => {
			const mockData = [
				{ name: "push-ups", quantity: 10 },
				{ name: "squats", quantity: 15 },
			];
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			});

			const result = await getRealQuantity("user-uuid", "course-id", "workout-id");
			expect(result).toEqual([10, 15]);
		});

		it("должен возвращать пустой массив если данных нет", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(null),
			});

			const result = await getRealQuantity("user-uuid", "course-id", "workout-id");
			expect(result).toEqual([]);
		});
	});

	describe("addUserName", () => {
		it("должен успешно добавлять имя пользователя", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			await addUserName("user-uuid", "John Doe");
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/user-uuid.json",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: "John Doe",
					}),
				}
			);
		});
	});

	describe("getUserName", () => {
		it("должен успешно получать имя пользователя", async () => {
			const mockData = { name: "John Doe", email: "john@example.com" };
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockData),
			});

			const result = await getUserName("user-uuid");
			expect(result).toEqual(mockData);
		});
	});

	describe("deleteProgress", () => {
		it("должен успешно удалять прогресс", async () => {
			(fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			await deleteProgress("user-uuid", "course-id");
			expect(fetch).toHaveBeenCalledWith(
				"https://fitness-pro-67b02-default-rtdb.europe-west1.firebasedatabase.app/users/user-uuid/courses/course-id/workouts.json",
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		});
	});
});
