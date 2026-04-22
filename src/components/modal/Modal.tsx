// react
import { useEffect, useRef } from 'react';

// styles
import styles from '../../assets/styles/modules/modal/modal.module.css';

// redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { toggleModal, loadModal } from '../../redux/modal/modalSlice';

// components
import ConfirmDelete from './modalToRender/ConfirmDelete';

// rrd
import { useParams, useNavigate } from 'react-router-dom';

const Modal = () => {
	// rrd
	const { id } = useParams();
	const navigate = useNavigate();

	// redux
	const { isOpen, contentKey } = useSelector((state: RootState) => state.modal);
	const dispatch = useDispatch<AppDispatch>();
	const modalRef = useRef<HTMLDivElement | null>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	// disable scrolling
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			previousFocusRef.current = document.activeElement as HTMLElement | null;

			const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			focusableElements?.[0]?.focus();

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					handleClose();
				}

				if (event.key !== 'Tab' || !focusableElements || !focusableElements.length) {
					return;
				}

				const focusableArray = Array.from(focusableElements);
				const firstElement = focusableArray[0];
				const lastElement = focusableArray[focusableArray.length - 1];

				if (event.shiftKey && document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				} else if (!event.shiftKey && document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			};

			document.addEventListener('keydown', handleKeyDown);

			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		} else {
			document.body.style.overflow = 'unset';
			previousFocusRef.current?.focus?.();
		}
	}, [isOpen]);

	// event handlers
	const handleClose = () => {
		dispatch(toggleModal());
		dispatch(loadModal(''));
	};

	// utils
	const getKey = () => {
		switch (contentKey) {
			case 'confirm-delete':
				return (
					<ConfirmDelete
						id={id as string}
						close={handleClose}
						goHome={goHome}
					/>
				);
		}
	};

	const goHome = () => {
		navigate('/');
	};

	return (
		<>
			{isOpen && (
				<div
					className={styles.modalBackdrop}
					onMouseDown={handleClose}
				>
					<div
						className={styles.modal}
						ref={modalRef}
						role='dialog'
						aria-modal='true'
						aria-labelledby='confirm-delete-title'
						tabIndex={-1}
						onMouseDown={(event) => event.stopPropagation()}
					>
						{getKey()}
					</div>
				</div>
			)}
		</>
	);
};

export default Modal;
