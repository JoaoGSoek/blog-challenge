import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const PasswordField = (props: React.ComponentProps<'input'>) => {

	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className='flex flex-row items-center gap-x-2 items-center'>
			<Input
				type={isVisible ? "text" : "password"}
				placeholder="pass123"
				required
				{...props}
			/>
			<Button type="button" variant="outline" onClick={() => setIsVisible(!isVisible)}>
				{isVisible ? <Eye /> : <EyeClosed />}
			</Button>
		</div>
	)
}

export default PasswordField