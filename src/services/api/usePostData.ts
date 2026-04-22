import {
	createInvoice,
	notifyInvoiceStorageChanged,
	updateInvoice,
} from '../storage/invoiceStorage';

export async function usePostData(_url: string, data: any) {
	const invoices = createInvoice(data);
	notifyInvoiceStorageChanged();
	return invoices;
}

export async function usePostDataById(_url: string, id: string, data: any) {
	const invoices = updateInvoice(id, data);
	notifyInvoiceStorageChanged();
	return invoices;
}
