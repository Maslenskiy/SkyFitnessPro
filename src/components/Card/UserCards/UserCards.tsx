import { useState, useEffect } from "react";
import TrainingSelectModal from "../../Modal/TrainingSelectModal/TrainingSelectModal";
import { CardType } from "../../../types/cards";
import {
	deleteCourseToUser,
	deleteProgress,
	getCourseById,
	getRealQuantityWithoutExercises,
	getWorkoutsById,
} from "../../../utils/api";
import { useUser } from "../../../hooks/useUser";
import { TrainingType } from "../../../types/training";

type UserCardsProps = CardType & { onDelete: (courseId: string) => void };

function UserCards({ courseId, image, nameRu, onDelete }: UserCardsProps) {
	const [isTrainingSelectModalOpen, setTrainingSelectModalOpen] = useState(false);
	const [courseData, setCourseData] = useState([]);
	const [workoutInfo, setWorkoutInfo] = useState<TrainingType[]>([]);
	const [completeArray, setCompleteArray] = useState<TrainingType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useUser();
	const FULL_PROGRESS = 100;

	const openTrainingSelectModal = () => setTrainingSelectModalOpen(true);
	const closeTrainingSelectModal = () => setTrainingSelectModalOpen(false);

	useEffect(() => {
		if (user && user.uid) {
			getCourseById(courseId)
				.then((data) => {
					setCourseData(data.workouts);
				})
				.catch((error: unknown) => console.error(error));
		}
	}, [courseId, user]);

	useEffect(() => {
		const fetchWorkoutInfo = async () => {
			if (courseData.length > 0) {
				try {
					const workoutInfoArray = await Promise.all(
						courseData.map(async (workout) => {
							const response = await getWorkoutsById(workout);
							return response;
						}),
					);
					setWorkoutInfo(workoutInfoArray);
				} catch (error: unknown) {
					console.error("Ошибка при получении информации о курсе:", error);
				}
			}
		};
		fetchWorkoutInfo();
	}, [courseData]);

	useEffect(() => {
		const fetchCompleteData = async () => {
			if (workoutInfo.length > 0 && user && user.uid) {
				const trainingArray = await Promise.all(
					workoutInfo.map(async (workout) => {
						const data = await getRealQuantityWithoutExercises(user.uid, courseId, workout._id);
						return data !== null ? data : null;
					}),
				);
				setCompleteArray(trainingArray.filter((data) => data !== null));
			}
		};
		fetchCompleteData();
		setIsLoading(true);
	}, [workoutInfo, user, courseId]);

	function deleteCourse() {
		if (user && user.uid) {
			deleteCourseToUser(user.uid, courseId)
				.then(() => {
					onDelete(courseId);
				})
				.catch((error: unknown) => {
					console.error("Ошибка при удалении курса:", error);
				});
		}
	}

	function restartCourse() {
		if (user && user.uid) {
			deleteProgress(user.uid, courseId).then(() => {
				setCompleteArray([]);
			});
		}
	}

	const visitedRatio = workoutInfo.length > 0 ? (completeArray.length / workoutInfo.length) * 100 : 0;

	return (
		<>
			{isLoading ? (
				<div
					key={courseId}
					className="card w-[343px] sm:w-[360px] bg-white rounded-[30px] flex flex-col gap-6 shadow-[0_4px_67px_-12px_rgba(0,0,0,0.13)]"
				>
					<img className="" src={image} alt={nameRu} />
					<div className="cardImage relative">
						<button
							onClick={deleteCourse}
							className="addCourse w-[32px] h-[32px] absolute top-[-330px] right-5"
							title="Удалить курс"
						>
							<svg className="w-[32px] h-[32px]">
								<use xlinkHref="./icon/sprite.svg#icon-minus" />
							</svg>
						</button>
					</div>
					<div className="flex flex-col gap-5 mx-[21px] sm:mx-[30px]">
						<div className="courseTitle">
							<h3 className="text-[32px] font-medium text-left">{nameRu}</h3>
						</div>
						<div className="courseParams flex flex-row flex-wrap gap-1.5 mb-[15px]">
							<p className="parameter bg-[#F7F7F7] p-2.5 rounded-full flex flex-row gap-1.5 items-center">
								<svg className="w-[15px] h-[15px]">
									<use xlinkHref="./icon/sprite.svg#icon-calendar" />
								</svg>
								25 дней
							</p>
							<p className="parameter bg-[#F7F7F7] p-2.5 rounded-full flex flex-row gap-1.5 items-center">
								<svg className="w-[15px] h-[15px]">
									<use xlinkHref="./icon/sprite.svg#icon-time" />
								</svg>
								20-50 мин/день
							</p>
							<p className="parameter bg-[#F7F7F7] p-2.5 rounded-full flex flex-row gap-1.5 items-center">
								<svg className="w-[18px] h-[18px]">
									<use xlinkHref="./icon/sprite.svg#icon-complexity" />
								</svg>
								Сложность
							</p>
							<div className="w-full h-[36px] flex flex-col justify-center gap-[10px] opacity-100 mt-[20px]">
								<div className="text-lg text-start">Прогресс {Math.round(visitedRatio)}%</div>
								<div className="relative w-full h-[6px] bg-gray-300 rounded-full">
									<div
										className="absolute top-0 left-0 h-[6px] bg-[#00C1FF]"
										style={{ width: `${Math.round(visitedRatio)}%` }}
									></div>
								</div>
							</div>
							<div className="items-center mt-[40px]">
								{Math.round(visitedRatio) !== FULL_PROGRESS ? (
									<button
										onClick={openTrainingSelectModal}
										className="w-[300px] h-[52px] bg-[#BCEC30] rounded-[46px] hover:bg-[#C6FF00] active:bg-[#000000] active:text-[#FFFFFF] text-lg"
									>
										{Math.round(visitedRatio) === 0 ? "Начать тренировки" : "Продолжить"}
									</button>
								) : (
									<button
										onClick={restartCourse}
										className="w-[300px] h-[52px] bg-[#BCEC30] rounded-[46px] hover:bg-[#C6FF00] active:bg-[#000000] active:text-[#FFFFFF] text-lg"
									>
										Начать заново
									</button>
								)}
								{isTrainingSelectModalOpen && (
									<TrainingSelectModal courseId={courseId} closeModal={closeTrainingSelectModal} />
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<p>Загрузка</p>
			)}
		</>
	);
}

export default UserCards;
