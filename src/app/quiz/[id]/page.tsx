'use client';

import { useState } from 'react';
import { Question, Quiz } from '@prisma/client';
import Navbar from '@/components/Navbar';

type Props = {};

type QuizQuestions = Quiz & {
	questions: Question[];
};

export default function QuizPage(props: Props) {
	const [quiz, setQuiz] = useState<QuizQuestions | null>(null);
	const [answers, setAnswers] = useState<string[]>([]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const id = window?.location?.pathname?.split('/')?.[2];
		const response = await fetch(`/api/results/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ answers }),
		});
		const result = await response.json();

		window.location.href = `/results/${result.id}`;
	};

	const fetchQuiz = async () => {
		try {
			// get id from the url
			const id = window?.location?.pathname?.split('/')?.[2];
			const response = await fetch(`/api/quiz/${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ quizId: Number(id) }),
			});
			const data = await response.json();
			setQuiz(data[0]);
		} catch (error) {
			console.error(error);
		}
	};

	if (!quiz) {
		fetchQuiz();
		return (
			<main className="flex flex-col items-center min-h-screen bg-gray-100">
				<Navbar />
				<div className="w-2/3 mt-8">
					<h2 className="text-2xl font-medium text-slate-500 mb-4">Loading...</h2>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-col items-center min-h-screen bg-gray-100">
			<Navbar />
			<div className="w-2/3 mt-8">
				<h2 className="text-2xl font-medium text-slate-500 mb-4">{quiz.title}</h2>
				<p className="text-md text-slate-400">{quiz.description}</p>
				<form onSubmit={handleSubmit}>
					<ul className="space-y-4">
						{quiz?.questions?.map((question: Question, i: number) => (
							<div key={i} className="flex flex-col gap-2 border-2 p-2 rounded-md">
								<li>
									<p className="text-md text-slate-400">
										#{i + 1} {question.question}
									</p>
									{question.type === 'MULTIPLE_CHOICE' && (
										<ul className="space-y-2">
											{question.choices.map((choice: string, j: number) => (
												<li key={j}>
													<label>
														<input
															type="radio"
															name={`question-${i}`}
															value={choice}
															onChange={(event) => {
																const newAnswers = [...answers];
																newAnswers[i] = event.target.value;
																setAnswers(newAnswers);
															}}
														/>
														<span className="ml-2 text-md text-slate-400">
															{choice}
														</span>
													</label>
												</li>
											))}
										</ul>
									)}
									{question.type === 'TRUE_FALSE' && (
										<ul className="space-y-2">
											<li>
												<label>
													<input
														type="radio"
														name={`question-${i}`}
														value="true"
														onChange={(event) => {
															const newAnswers = [...answers];
															newAnswers[i] = event.target.value;
															setAnswers(newAnswers);
														}}
													/>
													<span className="ml-2 text-md text-slate-400">
														True
													</span>
												</label>
											</li>
											<li>
												<label>
													<input
														type="radio"
														name={`question-${i}`}
														value="false"
														onChange={(event) => {
															const newAnswers = [...answers];
															newAnswers[i] = event.target.value;
															setAnswers(newAnswers);
														}}
													/>
													<span className="ml-2 text-md text-slate-400">
														False
													</span>
												</label>
											</li>
										</ul>
									)}
									{question.type === 'SHORT_ANSWER' && (
										<input
											type="text"
											name={`question-${i}`}
											onChange={(event) => {
												const newAnswers = [...answers];
												newAnswers[i] = event.target.value;
												setAnswers(newAnswers);
											}}
										/>
									)}
								</li>
							</div>
						))}
					</ul>
					<button
						type="submit"
						className="bg-slate-300 py-2.5 hover:bg-slate-200 transition ease-in-out duration-300 delay-50 w-full focus:outline-none rounded-lg text-xs font-bold flex justify-center gap-4 text-black/50 mt-4"
					>
						Submit
					</button>
				</form>
			</div>
		</main>
	);
}