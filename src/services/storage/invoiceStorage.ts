import seedData from '../../data/data.json';
import { generateInvoiceId } from '../../utilities/GetInvoiceId';
import { InvoiceType } from '../../types/InvoiceTypes';

const STORAGE_KEY = 'invoice-app-invoices';

type AnyInvoice = Partial<InvoiceType> & {
	total?: number;
	paymentTerm?: string | number;
	clientAddress?: Partial<InvoiceType['clientAddress']> & {
		clientStreet?: string;
		postcode?: string;
	};
};

type AddressLike = Record<string, unknown> | undefined;

const isBrowser = () => typeof window !== 'undefined';
const STORAGE_CHANGE_EVENT = 'invoice-storage-changed';

const toStringValue = (value: unknown) => String(value ?? '');

const normalizeAddress = (
	address: AddressLike,
	kind: 'sender' | 'client'
) => ({
	street: toStringValue(
		(address?.street as string | undefined) ??
			(kind === 'client' ? (address?.clientStreet as string | undefined) : '')
	),
	city: toStringValue(address?.city as string | undefined),
	postCode: toStringValue(
		(address?.postCode as string | undefined) ??
			(address?.postcode as string | undefined)
	),
	country: toStringValue(address?.country as string | undefined),
});

const normalizeItems = (items: unknown): InvoiceType['items'] => {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.map((item: any) => {
		const quantity = Number(item?.quantity ?? 0);
		const price = Number(item?.price ?? 0);

		return {
			id: toStringValue(item?.id ?? crypto.randomUUID()),
			name: toStringValue(item?.name),
			quantity,
			price,
			total: quantity * price,
		};
	});
};

const calculateTotal = (items: InvoiceType['items']) =>
	items.reduce((sum, item) => sum + item.quantity * item.price, 0);

const normalizeInvoice = (invoice: AnyInvoice): InvoiceType => {
	const items = normalizeItems(invoice.items);

	return {
		id: toStringValue(invoice.id || generateInvoiceId()),
		createdAt: toStringValue(invoice.createdAt),
		paymentDue: toStringValue(invoice.paymentDue),
		description: toStringValue(invoice.description),
		paymentTerms: toStringValue(
			invoice.paymentTerms ?? invoice.paymentTerm ?? ''
		),
		clientName: toStringValue(invoice.clientName),
		clientEmail: toStringValue(invoice.clientEmail),
		status: toStringValue(invoice.status || 'pending'),
		senderAddress: normalizeAddress(invoice.senderAddress, 'sender'),
		clientAddress: normalizeAddress(invoice.clientAddress, 'client'),
		items,
		total: calculateTotal(items),
	};
};

const getSeedInvoices = () =>
	(((seedData as unknown as { invoices?: AnyInvoice[] }).invoices ?? []).map(
		normalizeInvoice
	) as InvoiceType[]);

const readInvoices = () => {
	if (!isBrowser()) {
		return getSeedInvoices();
	}

	const stored = window.localStorage.getItem(STORAGE_KEY);

	if (!stored) {
		const seed = getSeedInvoices();
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
		return seed;
	}

	try {
		const parsed = JSON.parse(stored) as AnyInvoice[];

		if (!Array.isArray(parsed)) {
			throw new Error('Invalid stored invoice data');
		}

		const normalized = parsed.map(normalizeInvoice);
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
		return normalized;
	} catch {
		const seed = getSeedInvoices();
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
		return seed;
	}
};

const writeInvoices = (invoices: InvoiceType[]) => {
	if (!isBrowser()) {
		return invoices;
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
	return invoices;
};

export const notifyInvoiceStorageChanged = () => {
	if (isBrowser()) {
		window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
	}
};

export const getInvoices = () => readInvoices();

export const getInvoiceById = (id: string) =>
	readInvoices().find((invoice) => invoice.id === id);

export const createInvoice = (invoice: AnyInvoice) => {
	const invoices = readInvoices();
	let id = toStringValue(invoice.id);

	if (!id) {
		do {
			id = generateInvoiceId();
		} while (invoices.some((item) => item.id === id));
	}

	const normalizedInvoice = normalizeInvoice({
		...invoice,
		id,
		status: invoice.status ?? 'pending',
	});

	return writeInvoices([normalizedInvoice, ...invoices]);
};

export const updateInvoice = (id: string, updates: AnyInvoice) => {
	const invoices = readInvoices();
	const existing = invoices.find((invoice) => invoice.id === id);

	if (!existing) {
		return invoices;
	}

	const updatedInvoice = normalizeInvoice({
		...existing,
		...updates,
		id,
	});

	return writeInvoices(
		invoices.map((invoice) => (invoice.id === id ? updatedInvoice : invoice))
	);
};

export const deleteInvoice = (id: string) => {
	const invoices = readInvoices().filter((invoice) => invoice.id !== id);
	return writeInvoices(invoices);
};
