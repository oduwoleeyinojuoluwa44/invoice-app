// styles
import styles from '../../assets/styles/modules/offcanvas/offcanvas.module.css';
import thisCanvasStyles from '../../assets/styles/modules/offcanvas/createinvoicecanvas.module.css';

// component
import Button from '../button/Button';

// redux
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import {
	toggleCanvas,
	onLoadCanvas,
} from '../../redux/offcanvas/offCanvasSlice';
import OffCanvasForm from './form/OffCanvasForm';

// rrd
import { useParams, useNavigate } from 'react-router-dom';

// react
import { useEffect, useState } from 'react';

// services
import { usePostDataById } from '../../services/api/usePostData';
import { useFetchDatabyId } from '../../services/api/useFetch';
import { FormDataType } from '../../types';
import { defaultForm } from './form/defaultValues/default';

const EditInvoiceCanvas = () => {
	const navigate = useNavigate();
	const params = useParams();
	const dispatch = useDispatch<AppDispatch>();

	// state
	const [data, setData] = useState<FormDataType>();
	const [editedFormData, setEditedFormData] = useState<FormDataType>();

	// utils
	const updateForm = (data: FormDataType) => {
		setEditedFormData(data);
	};

	const submitData = async (status?: 'draft' | 'pending') => {
		if (editedFormData) {
			const invoiceToSave = status
				? { ...editedFormData, status }
				: editedFormData;
			const filteredData = Object.entries(invoiceToSave).filter(
				([key, _]) => key !== 'id'
			);

			await usePostDataById(
				'invoices',
				params.id as string,
				Object.fromEntries(filteredData)
			);

			setData(invoiceToSave);
			navigate(0);
		}
	};

	// event handlers
	const handleClose = () => {
		dispatch(toggleCanvas());
		dispatch(onLoadCanvas(''));
	};

	const handleSave = async (status?: 'draft' | 'pending') => {
		await submitData(status);
		handleClose();
	};

	useEffect(() => {
		const fetchData = async () => {
			const data = await useFetchDatabyId(
				'invoices',
				{
					id: params.id as string,
				}
			);

			setData((data?.invoice ?? defaultForm) as FormDataType);
		};

		fetchData();
	}, []);

	return (
		<div
			className={`${styles.canvas} animate animate--very-slow animate-ease-in-out slideToRight`}
		>
			<OffCanvasForm
				header={`Edit #${params.id}`}
				close={handleClose}
				data={data}
				updateForm={updateForm}
				hideActions
			/>

			<div className={thisCanvasStyles.buttons}>
				<Button
					variant='editButton'
					onClick={handleClose}
				>
					Cancel
				</Button>
				{data && data.status === 'draft' ? (
					<Button
						variant='saveAsDraftButton'
						onClick={() => handleSave('draft')}
					>
						Save Draft
					</Button>
				) : (
					<Button onClick={() => handleSave()}>Save Changes</Button>
				)}

				{data && data.status === 'draft' && (
					<Button onClick={() => handleSave('pending')}>Save & Send</Button>
				)}
			</div>
		</div>
	);
};

export default EditInvoiceCanvas;
