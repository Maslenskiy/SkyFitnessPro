import { useEffect, useState } from "react";
import { getCourse } from "../../utils/api";
import Card from "../../components/Card/Card";
import { TrainingType } from "../../types/training";

function Main() {
	function scrollToCourses() {
		const element = document.getElementById("top");
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	}

	const [isLoaded, setIsLoaded] = useState(false);
	const [courses, setCourses] = useState<TrainingType[]>([]);

	useEffect(() => {
		getCourse()
			.then((data: Record<string, TrainingType>) => {
				const coursesData: TrainingType[] = Object.keys(data).map((key) => data[key]);
				setCourses(coursesData);
			})
			.catch((error: unknown) => {
				console.warn(error);
			})
			.finally(() => {
				setIsLoaded(true);
			});
	}, []);

	return (
		<>
			<div
				id="top"
				className="description flex flex-row mb-[34px] justify-between h-[120px] mt-[39px] sm:mt-[60px] sm:mb-[50px]"
			>
				<h1 className="text-[32px] sm:text-[42px] xl:text-[60px] font-medium text-left leading-none">
					Начните заниматься спортом и улучшите качество жизни
				</h1>
				<img className="h-[120px] hidden lg:block" src="./description-img.svg" alt="description" />
			</div>
			{isLoaded ? (
				<div className="flex justify-center xl:justify-start flex-wrap gap-6 sm:gap-10">
					{courses.map((course) => (
						<Card key={course._id} courseId={course._id} image={course.images.cardImage} nameRu={course.nameRU} />
					))}
				</div>
			) : (
				<div>
					<p>Страница загружается</p>
				</div>
			)}
			<div className="flex flex-row justify-center mt-[34px] mb-[81px]">
				<button
					onClick={scrollToCourses}
					className="w-[127px] h-[52px] bg-[#BCEC30] rounded-[46px] hover:bg-[#C6FF00] active:bg-[#000000] active:text-[#FFFFFF] text-lg leading-3"
				>
					Наверх
				</button>
			</div>
		</>
	);
}

export default Main;
