import { Component } from '../base/Component';
import { ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasket {
	total: number;
	selected: string[];
	items: HTMLElement[];
}

export class Basket extends Component<IBasket> {
	protected _total: HTMLElement | null;
	protected _list: HTMLElement;
	protected _button: HTMLButtonElement | null;
	protected _actions: HTMLElement | null;
	protected emptyState: HTMLElement;

	constructor(
		container: HTMLElement,
		protected events: EventEmitter,
		emptyState: HTMLElement,
	) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__total');
		this._button = this.container.querySelector('.basket__action');
		this._actions = this.container.querySelector('.basket__actions');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.emptyState = emptyState;

		this.items = [];
		this.total = 0;
	}

	set items(value: HTMLElement[]) {
		if (value.length) {
			if (this._actions) {
				this.setVisible(this._actions);
			}

			this._list.replaceChildren(...value);
		} else {
			if (this._actions) {
				this.setHidden(this._actions);
			}

			this._list.replaceChildren(this.emptyState);
		}
	}

	set selected(value: string[]) {
		if (this._button) {
			if (value.length) {
				this.setDisabled(this._button, false);
			} else {
				this.setDisabled(this._button, true);
			}
		}
	}

	set total(value: number) {
		if (this._total) {
			if (value) {
				this.setText(this._total, formatNumber(value));
				this.setVisible(this._total);
			} else {
				this.setHidden(this._total);
			}
		}
	}
}
