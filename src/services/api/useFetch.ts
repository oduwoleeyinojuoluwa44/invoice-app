import { getInvoiceById, getInvoices } from '../storage/invoiceStorage';

export const useFetchData = async (_url: string) => {
	return {
		invoices: getInvoices(),
	};
};

export const useFetchDatabyId = async (
	_url: string,
	params: {
		id: string;
	}
) => {
	return {
		invoice: getInvoiceById(params.id),
	};
};
