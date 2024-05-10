import { Component } from '../base/Component';
import { LotStatus } from '../../types/index';
import { ensureElement, formatNumber } from '../../utils/utils';

interface ICardActions {
	onClick?: (event: MouseEvent) => void;
	onChange?: (event: MouseEvent) => void;
}

export interface ICard<T> {
	title: string;
	description?: string | string[];
	image: string;
	status: T;
}

export class Card<T> extends Component<ICard<T>> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions,
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
		this._description = this.container.querySelector(`.${blockName}__description`);
		this._button = this.container.querySelector(`.${blockName}__button`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				this.container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title() {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				}),
			);
		} else {
			this.setText(this._description, value);
		}
	}
}

export type TCardCatalogStatus = {
	status: LotStatus;
	label: string;
};

export class CardCatalog extends Card<TCardCatalogStatus> {
	protected _status: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._status = ensureElement<HTMLElement>(`.card__status`, container);
	}

	set status({ status, label }: TCardCatalogStatus) {
		this.setText(this._status, label);

		if (status === 'active' || status === 'closed') {
			const modifier = `${this.blockName}__status_${status}`;
			this._status.classList.add(modifier);
		}
	}
}

export class CardAuction extends Card<HTMLElement> {
	protected _status: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('lot', container, actions);

		this._status = ensureElement('.lot__status', container);
	}

	set status(element: HTMLElement) {
		this._status.replaceWith(element);
	}
}

export interface ICardBidStatus {
	amount: number;
	status: boolean;
}

export class CardBid extends Card<ICardBidStatus> {
	protected _amount: HTMLElement;
	protected _status: HTMLElement;
	protected _input: HTMLInputElement | null;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('bid', container, actions);

		this._amount = ensureElement<HTMLElement>(`.bid__amount`, container);
		this._status = ensureElement<HTMLElement>(`.bid__status`, container);
		this._input = container.querySelector(`.bid__selector-input`);

		if (actions.onChange && this._input) {
			this._input.addEventListener('input', actions.onChange);
		}
	}

	set amount(value: number) {
		this.setText(this._amount, value);
	}

	set status({ amount, status }: ICardBidStatus) {
		this.setText(this._amount, formatNumber(amount));

		if (status) {
			this.setVisible(this._status);
		} else {
			this.setHidden(this._status);
		}
	}
}
