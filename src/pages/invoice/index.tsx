import Invoice from './component/Invoice';
import { LoaderFunction } from 'react-router-dom';
import { useFetchDatabyId } from '../../services/api/useFetch';
import { InvoiceType } from '../../types';

export interface paramsType {
	id: string;
	invoice: InvoiceType;
}

export const invoiceLoader: LoaderFunction<paramsType> = async ({ params }) => {
	const id = params.id ?? '';

	const invoiceData = await useFetchDatabyId('invoices', { id });

	return { id, invoice: invoiceData.invoice };
};
const InvoicePage = () => {
	return <Invoice />;
};

export default InvoicePage;
