import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export class Page extends Component<HTMLElement> {
	protected _catalog: HTMLElement;
	protected _basket: HTMLButtonElement;
	protected _counter: HTMLElement;
	protected _pageWrapper: HTMLElement;

	constructor(
		container: HTMLElement,
		protected events: IEvents,
	) {
		super(container);

		this._catalog = ensureElement('.catalog__items');
		this._basket = ensureElement<HTMLButtonElement>('.header__basket');
		this._counter = ensureElement('.header__basket-counter');
		this._pageWrapper = ensureElement('.page__wrapper');

		this._basket.addEventListener('click', () => {
			this.events.emit('open:basket-active');
		});
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set counter(value: string | number) {
		this.setText(this._counter, value);
	}

	set locked(value: boolean) {
		if (value) {
			this._pageWrapper.classList.add('page__wrapper_locked');
		} else {
			this._pageWrapper.classList.remove('page__wrapper_locked');
		}
	}
}
