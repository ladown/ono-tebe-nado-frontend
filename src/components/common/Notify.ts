import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface INotify {
	text: string;
	buttonModifier: string;
	buttonText: string;
}

interface INotifyActions {
	onClick?: () => void;
}

export class Notify extends Component<INotify> {
	protected _button: HTMLButtonElement;
	protected _text: HTMLElement;

	constructor(container: HTMLElement, actions?: INotifyActions) {
		super(container);

		this._button = ensureElement<HTMLButtonElement>(`.state__action`, container);
		this._text = container.querySelector(`.state__subtitle`);

		if (this._button && actions?.onClick) {
			this._button.addEventListener('click', actions.onClick);
		}
	}

	set text(value: string) {
		this.setText(this._text, value);
	}

	set buttonText(value: string) {
		this.setText(this._button, value);
	}

	set buttonModifier(value: string) {
		this.toggleClass(this._button, `button_${value}`, true);
	}
}
