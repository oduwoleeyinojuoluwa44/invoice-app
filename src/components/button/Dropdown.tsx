// react
import {
	useImperativeHandle,
	useRef,
	forwardRef,
	useState,
	useEffect,
} from 'react';

// styles

import styles from '../../assets/styles/modules/dropdown.module.css';

// svg
import downArrow from '../../assets/svg/icon-arrow-down.svg';

import { useMediaQuery } from 'react-responsive';
import { useLocation, useNavigate } from 'react-router-dom';

export interface OptionType {
	label: string;
	value: string;
}

interface DropdownProps {
	options?: OptionType[];
	label?: string;
	smallScreenIcon: React.ReactNode;
	searchParam: string;
}

export interface DropdownRef {
	value: OptionType[];
}

const Dropdown = forwardRef<DropdownRef, DropdownProps>((props, ref) => {
	const { options, searchParam } = props;

	// ref
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	// state
	const [selectedOption, setSelectedOption] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	// rrd
	const navigate = useNavigate();
	const location = useLocation();

	// libraries
	const isWide = useMediaQuery({
		query: '(min-width: 768px)',
	});

	useImperativeHandle(ref, () => {
		return {
			get value() {
				return options?.filter((option) => selectedOption.includes(option.value)) ?? [];
			},
		};
	});

	const handleClick = (option: OptionType) => {
		const value = option.value;
		const searchParams = new URLSearchParams(location.search);
		const existingParams = searchParams.get(searchParam)?.split(',') ?? [];

		const optionExists = existingParams.includes(value);

		if (optionExists) {
			const updatedParams = existingParams.filter((param) => param !== value);
			if (updatedParams.length === 0) {
				searchParams.delete(searchParam);
				setSelectedOption([]);
			} else {
				searchParams.set(searchParam, updatedParams.join(','));
				setSelectedOption(updatedParams);
			}
		} else {
			existingParams.push(value);
			searchParams.set(searchParam, existingParams.join(','));
			setSelectedOption([...selectedOption, value]);
		}

		navigate({
			pathname: location.pathname,
			search: searchParams.toString(),
		});
		setIsOpen(false);
	};

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const existingParams = searchParams.get(searchParam);

		if (existingParams) {
			setSelectedOption(existingParams.trim().split(','));
		}
	}, [location]);

	return (
		<>
			<div className={styles.dropdown}>
				<button
					type='button'
					aria-haspopup='menu'
					aria-expanded={isOpen}
					onClick={() => {
						setIsOpen((prev) => !prev);
					}}
				>
					{isWide ? (
						<>
							<p>{props.label ?? 'Filter'}</p>
							<img
								src={downArrow}
								style={{
									transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
								}}
								className={styles.arrowIcon}
								alt='down arrow'
							/>
						</>
					) : (
						<>{props.smallScreenIcon}</>
					)}
				</button>
				{options && (
					<dialog
						ref={dialogRef}
						open={isOpen}
						className={`${styles.dropdownDialog} animate fadeIn animate--fast`}
					>
						<div>
							{options?.map((option, index) => {
								const checked = selectedOption.includes(option.value);

								return (
									<button
										type='button'
										role='menuitemcheckbox'
										aria-checked={checked}
										onClick={() => {
											handleClick(option);
										}}
										key={index}
									>
										<div
											className={`${styles.checkbox} ${
												checked ? styles.checked : ''
											}`}
										></div>
										<span className='body-text'>{option.label}</span>
									</button>
								);
							})}
						</div>
					</dialog>
				)}
			</div>
		</>
	);
});

export default Dropdown;
