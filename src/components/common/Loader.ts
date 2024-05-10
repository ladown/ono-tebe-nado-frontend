import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export interface ILoader {
	text: string;
}

export class Loader extends Component<ILoader> {
	protected _text: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);

		this._text = ensureElement('.loader__text', container);
	}

	set text(value: string) {
		this.setText(this._text, value);
	}

	// set modifier(value: string) {
	// 	this.toggleClass(this.container, `.loader_${value}`, true)
	// }
}
