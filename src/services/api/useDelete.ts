import { deleteInvoice, notifyInvoiceStorageChanged } from '../storage/invoiceStorage';

export async function useDelete(_url: string, id: string) {
	const invoices = deleteInvoice(id);
	notifyInvoiceStorageChanged();
	return invoices;
}
