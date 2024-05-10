import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface INotifyActions {
	onClick?: () => void;
}

export class Notify extends Component<HTMLElement> {
	protected closeTrigger: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: INotifyActions) {
		super(container);

		this.closeTrigger = ensureElement<HTMLButtonElement>(`.state__action`, container);

		if (this.closeTrigger && actions.onClick) {
			this.closeTrigger.addEventListener('click', actions.onClick);
		}
	}
}
