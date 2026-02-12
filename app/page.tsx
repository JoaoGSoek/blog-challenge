'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"
import FormField from "@/components/composed/formField"
import PasswordField from "@/components/composed/passwordField"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { LoginFormSchema } from "@/lib/definitions"
import { authenticate } from "./api/lib/actions"

const Login = () => {

	const form = useForm<z.infer<typeof LoginFormSchema>>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const [state, dispatch, isPending] = useActionState(authenticate, undefined);

	useEffect(() => {
		if (state?.status === 'error')
			toast.error(state?.message);
	}, [state]);

	return (
		<Card className="w-full max-w-sm m-auto">
			<CardHeader>
				<CardTitle>Login to your account</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
				<CardAction>
					<Button variant="link" asChild>
						<Link href="/register">
							Sign Up
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<form action={dispatch} className="flex flex-col gap-[inherit]">
				<CardContent>
					<div className="flex flex-col gap-6">
						<FormField
							name="email"
							label="Email"
							control={form.control}
						>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
							/>
						</FormField>
						<FormField
							name="password"
							label="Password"
							control={form.control}
						>
							<PasswordField />
						</FormField>
					</div>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? (
							<div className="flex flex-row items-center gap-x-1">
								<Spinner />
								<p>Logging in...</p>
							</div>
						) : 'Login'}
					</Button>
					<Button variant="outline" className="w-full">
						Login with Google
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

export default Login;