import { Component } from '../base/Component';
import { ensureElement, formatNumber, createElement } from '../../utils/utils';
import { LotStatus } from '../../types';

export interface IAuctionView {
	status: string;
	time: string;
	label: string;
	nextBid: number;
	history: number[];
}

export interface IAuctionViewActions {
	onSubmit(price: number): void;
}

export class AuctionView extends Component<IAuctionView> {
	protected _timer: HTMLElement;
	protected _label: HTMLElement;
	protected _form: HTMLFormElement;
	protected _button: HTMLButtonElement;
	protected _input: HTMLInputElement;
	protected _bids: HTMLUListElement;
	protected _history: HTMLElement;

	constructor(container: HTMLElement, actions?: IAuctionViewActions) {
		super(container);

		this._timer = ensureElement('.lot__auction-timer', container);
		this._label = ensureElement('.lot__auction-text', container);
		this._form = ensureElement<HTMLFormElement>('.lot__bid', container);
		this._button = ensureElement<HTMLButtonElement>('.lot__bid .button', container);
		this._input = ensureElement<HTMLInputElement>('.lot__bid .form__input', container);
		this._bids = ensureElement<HTMLUListElement>('.lot__history', container);
		this._history = ensureElement('.lot__history-bids', container);

		if (actions?.onSubmit) {
			this._form.addEventListener('submit', (event) => {
				event.preventDefault();
				actions.onSubmit(parseInt(this._input.value));
			});
		}
	}

	set status(value: LotStatus) {
		if (value !== 'active') {
			this.setHidden(this._form);
			this.setHidden(this._bids);
		} else {
			this.setVisible(this._form);
			this.setVisible(this._bids);
		}
	}

	set time(value: string) {
		this.setText(this._timer, value);
	}

	set label(value: string) {
		this.setText(this._label, value);
	}

	set history(value: number[]) {
		this._history.replaceChildren(
			...value.map((bid) =>
				createElement<HTMLLinkElement>('li', {
					className: 'lot__history-item',
					textContent: formatNumber(bid),
				}),
			),
		);
	}

	set nextBid(value: number) {
		this._input.value = String(value);
	}

	focus() {
		this._input.focus({ preventScroll: true });
	}
}
