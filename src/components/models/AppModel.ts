import { Model } from '../base/Model';
import { IAppState, ILot, IOrder, FormErrors, IOrderForm } from '../../types';
import { CardModel } from './CardModel';

export type CatalogChangeEvent = {
	catalog: ILot[];
};

export class AppModel extends Model<IAppState> {
	catalog: CardModel[];
	basket: string[];
	cardAuction: string | null;
	order: IOrder = {
		email: '',
		phone: '',
		items: [],
	};
	formErrors: FormErrors = {};

	setCatalog(items: ILot[]) {
		this.catalog = items.map((item) => new CardModel(item, this.events));
		this.emitChanges('catalog:changed', { catalog: this.catalog });
	}

	setCardAuction(item: CardModel) {
		this.cardAuction = item.id;
		this.emitChanges('card:show-preview', item);
	}

	getClosedLots() {
		return this.catalog.filter((card) => card.status === 'closed' && card.isMyBid);
	}

	getActiveLots() {
		return this.catalog.filter((card) => card.status === 'active' && card.isParticipate);
	}

	setOrderField(target: HTMLInputElement, field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder(target, field)) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(target: HTMLInputElement, field: keyof IOrderForm) {
		const errors: typeof this.formErrors = {};

		if (!target.checkValidity()) {
			errors[field] = target.validationMessage;
		}

		Object.keys(this.order).forEach((key: keyof IOrderForm) => {
			if (!errors[key] && !this.order[key]) {
				errors[key] = `Необходимо указать поле ${key}`;
			}
		});

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);

		return Object.keys(errors).length === 0;
	}

	toggleOrderedLot(id: string, state: boolean) {
		if (state) {
			this.order.items.push(id);
		} else {
			this.order.items = this.order.items.filter((orderItemId) => orderItemId !== id);
		}
	}

	getTotal(): number {
		return this.order.items.reduce((acc, orderItemId) => {
			const item = this.catalog.find((catalogItem) => catalogItem.id === orderItemId);

			return (acc += item.price);
		}, 0);
	}

	clearBasket() {
		this.order.items.forEach((id) => {
			this.toggleOrderedLot(id, false);
			this.catalog.find((it) => it.id === id).clearBid();
		});
	}
}
