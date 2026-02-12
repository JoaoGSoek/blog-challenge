import { NextResponse } from "next/server";
import { userService } from "@/services/user.service";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ email: string }> },
) {
	try {
		const { email } = await params;

		if (email === undefined) {
			return NextResponse.json(
				{ error: "Email de usuário inválido" },
				{ status: 400 },
			);
		}

		const statistics = await userService.getStatisticsByUserEmail(email);
		return NextResponse.json(statistics);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Erro ao buscar posts" },
			{ status: 500 },
		);
	}
}
