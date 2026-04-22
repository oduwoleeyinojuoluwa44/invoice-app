// react
import { useCallback, useEffect, useRef, useState } from 'react';

// styles
import thisCanvasStyles from '../../../assets/styles/modules/offcanvas/createinvoicecanvas.module.css';

// components
import Button from '../../button/Button';
import ItemList from './itemList';
import BillTo from './billTo/BillTo';
import BillForm from './billFrom/BillFrom';

// utils
import { validateData } from '../../../utilities/validateData';

// defaults
import { defaultFormError, defaultForm } from './defaultValues/default';

// types
import { FormDataType, FormErrorType } from '../../../types';
import { areAllValid } from '../../../utilities/areAllValid';
import { usePostData } from '../../../services/api/usePostData';
import { FormTextRef } from '../../forms/Text';

interface OffCanvasFormProps {
	header: string;
	close: () => void;
	data?: FormDataType;
	updateForm?: (data: FormDataType) => void;
}

/**
 * Renders an off-canvas form component with the provided header and close function.
 *
 * @param {OffCanvasFormProps} header - The header to display in the form component.
 * @param {() => void} close - The function to close the off-canvas form.
 * @return {JSX.Element} The rendered off-canvas form component.
 */
const OffCanvasForm = ({
	header,
	close,
	data,
	updateForm,
}: OffCanvasFormProps) => {
	// state
	const [formData, setFormData] = useState<FormDataType>(defaultForm);
	const [formError, setFormError] = useState<FormErrorType>(defaultFormError);

	// ref
	const inputRef = useRef<FormTextRef>(null);
	const submitModeRef = useRef<'draft' | 'pending' | null>(null);

	/**
	 * Validates the form errors by iterating over the formData object
	 * and calling the validateData function for each value.
	 *
	 * @return {void}
	 */
	const buildValidationErrors = (source: FormDataType): FormErrorType => {
		const itemErrors = source.items.map((item) => ({
			id: item.id,
			name: validateData('name', item.name),
			quantity: validateData('quantity', String(item.quantity)),
			price: validateData('price', String(item.price)),
		}));

		return {
			senderAddress: {
				street: validateData('street', source.senderAddress.street),
				city: validateData('city', source.senderAddress.city),
				postCode: validateData('postCode', source.senderAddress.postCode),
				country: validateData('country', source.senderAddress.country),
			},
			clientAddress: {
				street: validateData('street', source.clientAddress.street),
				city: validateData('city', source.clientAddress.city),
				postCode: validateData('postCode', source.clientAddress.postCode),
				country: validateData('country', source.clientAddress.country),
			},
			clientEmail: validateData('clientEmail', source.clientEmail),
			clientName: validateData('clientName', source.clientName),
			paymentTerms: validateData('paymentTerms', source.paymentTerms),
			createdAt: validateData('createdAt', source.createdAt),
			description: validateData('description', source.description),
			items: itemErrors,
		};
	};

	const validateFormErrors = () => {
		const nextErrors = buildValidationErrors(formData);
		setFormError(nextErrors);
		return nextErrors;
	};

	const submitData = async (status: string) => {
		const data = { ...formData, status: status };

		await usePostData('invoices', data).catch((error) => {
			console.error(error);
		});

		close();

		window.scrollTo(0, document.body.scrollHeight);
	};

	// function to handle events
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		nest?: string | null
	) => {
		const { name, value } = e.target;

		if (nest) {
			setFormData((prev: any) => {
				if (prev && prev[nest]) {
					return {
						...prev,
						[nest]: {
							...prev[nest],
							[name]: value,
						},
					};
				} else {
					return {
						...prev,
						[nest]: {
							[name]: value,
						},
					};
				}
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	const handleUpdateFormData = useCallback(
		(data: any) => {
			setFormData({
				...formData,
				...data,
			});
		},
		[formData]
	);

	const handleUpdateFormError = (data: any) => {
		setFormError({
			...formError,
			...data,
		});
	};

	const handleSubmit = useCallback(async () => {
		const submitMode = submitModeRef.current ?? 'draft';

		if (submitMode === 'pending') {
			const nextErrors = validateFormErrors();
			const isValid = areAllValid(nextErrors);
			if (isValid) {
				await submitData('pending');
			}
		} else {
			await submitData('draft');
		}
		submitModeRef.current = null;
	}, [formData, formError]);

	useEffect(() => {
		if (updateForm) {
			updateForm(formData);
		}
	}, [formData]);

	useEffect(() => {
		if (data && data.senderAddress && data.clientAddress) {
			handleUpdateFormData(data);
		}
	}, [data]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<h2 className='text--h2'>{header}</h2>
			<BillForm
				handleInputChange={handleInputChange}
				formData={formData}
				formError={formError}
				inputRef={inputRef}
			/>

			<BillTo
				handleInputChange={handleInputChange}
				update={handleUpdateFormData}
				formError={formError}
				inputRef={inputRef}
				formData={formData}
			/>

			<ItemList
				update={handleUpdateFormData}
				updateErrorForm={handleUpdateFormError}
				formError={formError}
				formData={formData}
			/>

			<div className={thisCanvasStyles.buttons}>
				<Button
					variant='editButton'
					onClick={() => {
						submitModeRef.current = null;
						close();
					}}
					type='button'
				>
					Discard
				</Button>
				<Button
					variant='saveAsDraftButton'
					onClick={() => {
						submitModeRef.current = 'draft';
					}}
					type='submit'
				>
					Save as Draft
				</Button>
				<Button
					type='submit'
					onClick={() => {
						submitModeRef.current = 'pending';
						validateFormErrors();
						inputRef.current?.scrollIntoView();
					}}
				>
					Save & Send
				</Button>
			</div>
		</form>
	);
};

export default OffCanvasForm;
