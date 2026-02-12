import { Slot } from "radix-ui";
import { type ChangeEvent, useCallback, useId } from "react";
import { type Control, Controller, type ControllerRenderProps } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";

const FormField = (
	{
		name,
		label,
		control,
		children,
		onChange,
		className = ""
	}: {
		name: string;
		label: string;
		// biome-ignore lint/suspicious/noExplicitAny: <I don't know what else to do, biome>
		control: Control<any>;
		children: React.ReactNode;
		onChange?: (e: ChangeEvent<HTMLInputElement>, field: ControllerRenderProps) => void;
		className?: string;
	}
) => {
	const id = useId();
	const slotChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>, field: ControllerRenderProps) => {
		if (onChange) return onChange(e, field);
		field.onChange(e);
	}, [onChange]);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field className={cn("grid gap-2", className)} data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={id}>{label}</FieldLabel>
					<Slot.Root
						{...field}
						aria-invalid={fieldState.invalid}
						id={id}
						onChange={e => slotChangeHandler(e as ChangeEvent<HTMLInputElement>, field)}
					>
						{children}
					</Slot.Root>
					{fieldState.invalid && (
						<FieldError errors={[fieldState.error]} />
					)}
				</Field>
			)}
		/>
	)
}

export default FormField;