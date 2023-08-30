import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const schema = z.object({
	quizId: z.number(),
	answers: z.array(
		z.object({
			questionId: z.number(),
			answer: z.string(),
		})
	),
});

export async function POST(req: NextRequest) {
	try {
		const { quizId, answers } = schema.parse(await req.json());
		const quiz = await prisma.quiz.findUnique({
			where: { id: quizId },
			include: {
				questions: {
					include: {},
				},
			},
		});

		if (!quiz) {
			return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
		}

		const grade = quiz.questions.filter((question) => {
			const answer = answers.find((answer) => answer.questionId === question.id);
			return answer && answer.answer === question.answer;
		});

		return NextResponse.json({ answers: grade });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: 'Failed to grade quiz' }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
}
