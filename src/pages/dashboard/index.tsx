// react imports
import { useCallback, useEffect, useState } from 'react';

// styles
import styles from '../../assets/styles/modules/dashboard/dashboard.module.css';

// components
import ShowNoInvoice from './components/ShowNoInvoice';
import DashboardNav from './components/DashboardNav';

// type imports
import { InvoiceType } from '../../types/InvoiceTypes';
import Invoice from '../../features/invoice';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { getInvoiceAsync } from '../../redux/invoice/invoiceSlice';

// libraries
import { useAutoAnimate } from '@formkit/auto-animate/react';

// rrd
import { useLocation } from 'react-router-dom';
import useFilter from '../../hooks/useFilter';

const Dashboard = () => {
	// rrd
	const location = useLocation();

	// refs
	const [animationParent] = useAutoAnimate();

	// states
	const [data, setData] = useState<InvoiceType[]>([]);
	const [filter, setFilter] = useState<string[]>([]);
	const [manipulatedData, setManipulatedData] = useState<InvoiceType[]>([]);

	// redux
	const invoiceData = useSelector((state: RootState) => state.invoice);
	const dispatch = useDispatch<AppDispatch>();

	const { loading, invoiceItems } = invoiceData;

	// function to trigger data
	const fetchData = useCallback(async () => {
		await dispatch(getInvoiceAsync());
	}, [dispatch]);
	// UseEffects

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		const handleStorageChange = () => {
			fetchData();
		};

		window.addEventListener('invoice-storage-changed', handleStorageChange);

		return () => {
			window.removeEventListener(
				'invoice-storage-changed',
				handleStorageChange
			);
		};
	}, [fetchData]);

	// setting fetched data into data state
	useEffect(() => {
		if (!loading) {
			setData(invoiceItems);
		}
	}, [loading, invoiceItems]);

	// a logic to handle sorted items
	useEffect(() => {
		const filteredData = useFilter(data, filter);

		setManipulatedData(filteredData);
	}, [data, filter]);

	// sorting is handled using URL
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);

		const newFilter = searchParams.get('filter') || '';

		setFilter(newFilter.split(','));
	}, [location]);

	return (
		<div className={styles.dashboard}>
			<DashboardNav length={data.length ?? 0} />

			<div className={styles.invoiceContainer}>
				{manipulatedData && manipulatedData.length > 0 ? (
					<div
						className={styles.invoiceWrapper}
						ref={animationParent}
					>
						{manipulatedData.map((invoice: InvoiceType) => (
							<Invoice
								data={invoice}
								key={invoice.id}
							/>
						))}
					</div>
				) : (
					<div className={styles.noInvoice}>
						<ShowNoInvoice />
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
