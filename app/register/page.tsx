'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import FormField from '@/components/composed/formField'
import PasswordField from '@/components/composed/passwordField'
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

const schema = z.object({
	username: z.string(),
	email: z.string().email({ message: 'Por favor, insira um email válido.' }),
	password: z.string(),
});

const Register = () => {

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const router = useRouter();

	const handleRegister: SubmitHandler<z.infer<typeof schema>> = useCallback((data) => {
		fetch("/api/register", {
			method: "POST",
			body: JSON.stringify(data),
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);
			toast[status === 200 ? 'success' : 'error'](message);
			if (status === 200) router.push('/');
		})
	}, [router]);

	return (
		<Card className="w-full max-w-sm m-auto">
			<CardHeader>
				<CardTitle>Sign up</CardTitle>
				<CardDescription>
					Fill the form below to create an account
				</CardDescription>
				<CardAction>
					<Button variant="link" asChild>
						<Link href="/">
							Login
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<form onSubmit={form.handleSubmit(handleRegister)} className="flex flex-col gap-[inherit]">
				<CardContent className="flex flex-col gap-6">
					<FormField
						name="username"
						label="Username"
						control={form.control}
					>
						<Input
							type="text"
							placeholder="john-doe"
							required
						/>
					</FormField>
					<FormField
						name="email"
						label="Email"
						control={form.control}
					>
						<Input
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
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button type="submit" className="w-full">
						Register
					</Button>
					{/* <Button type="button" variant="outline" className="w-full">
						Register with Google
					</Button> */}
				</CardFooter>
			</form>
		</Card>
	)
}

export default Register;